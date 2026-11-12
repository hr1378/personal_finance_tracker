data "aws_availability_zones" "available" {
  state = "available"

  filter {
    name   = "opt-in-status"
    values = ["opt-in-not-required"]
  }
}

data "aws_ssm_parameter" "ecs_optimized_ami" {
  name = "/aws/service/ecs/optimized-ami/amazon-linux-2023/arm64/recommended/image_id"
}

locals {
  name              = var.project_name
  vpc_cidr          = "10.20.0.0/16"
  availability_zone = slice(data.aws_availability_zones.available.names, 0, 2)
  public_subnets = {
    for index, az in local.availability_zone : az => cidrsubnet(local.vpc_cidr, 8, index + 1)
  }
  private_subnets = {
    for index, az in local.availability_zone : az => cidrsubnet(local.vpc_cidr, 8, index + 11)
  }
  private_subnet_ids = [for az in local.availability_zone : aws_subnet.private[az].id]
}

resource "aws_vpc" "main" {
  cidr_block           = local.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true
  tags                 = { Name = "${local.name}-vpc" }
}

resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id
  tags   = { Name = "${local.name}-igw" }
}

resource "aws_subnet" "public" {
  for_each                = local.public_subnets
  vpc_id                  = aws_vpc.main.id
  availability_zone       = each.key
  cidr_block              = each.value
  map_public_ip_on_launch = true
  tags                    = { Name = "${local.name}-public-${each.key}" }
}

resource "aws_subnet" "private" {
  for_each          = local.private_subnets
  vpc_id            = aws_vpc.main.id
  availability_zone = each.key
  cidr_block        = each.value
  tags              = { Name = "${local.name}-private-${each.key}" }
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }
  tags = { Name = "${local.name}-public-rt" }
}

resource "aws_route_table_association" "public" {
  for_each       = aws_subnet.public
  subnet_id      = each.value.id
  route_table_id = aws_route_table.public.id
}

resource "aws_db_subnet_group" "main" {
  name       = "${local.name}-db"
  subnet_ids = local.private_subnet_ids
  tags       = { Name = "${local.name}-db-subnets" }
}

resource "aws_security_group" "application" {
  name        = "${local.name}-application"
  description = "HTTP access to the frontend container"
  vpc_id      = aws_vpc.main.id

  ingress {
    description = "Frontend HTTP"
    from_port   = var.frontend_container_port
    to_port     = var.frontend_container_port
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    description = "Image pulls and database access"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  tags = { Name = "${local.name}-application" }
}

resource "aws_security_group" "database" {
  name        = "${local.name}-database"
  description = "RDS PostgreSQL access from the ECS host"
  vpc_id      = aws_vpc.main.id

  ingress {
    description     = "PostgreSQL from application host"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.application.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  tags = { Name = "${local.name}-database" }
}

resource "aws_iam_role" "ecs_instance" {
  name = "${local.name}-ecs-instance"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "ec2.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_instance" {
  role       = aws_iam_role.ecs_instance.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonEC2ContainerServiceforEC2Role"
}

resource "aws_iam_instance_profile" "ecs_instance" {
  name = "${local.name}-ecs-instance"
  role = aws_iam_role.ecs_instance.name
}

resource "aws_ecs_cluster" "main" {
  name = "${local.name}-cluster"
}

resource "aws_instance" "ecs" {
  ami                         = data.aws_ssm_parameter.ecs_optimized_ami.value
  instance_type               = var.ec2_instance_type
  subnet_id                   = aws_subnet.public[local.availability_zone[0]].id
  vpc_security_group_ids      = [aws_security_group.application.id]
  iam_instance_profile        = aws_iam_instance_profile.ecs_instance.name
  associate_public_ip_address = true
  user_data                   = "#!/bin/bash\necho ECS_CLUSTER=${aws_ecs_cluster.main.name} >> /etc/ecs/ecs.config\n"
  user_data_replace_on_change = true

  metadata_options {
    http_endpoint               = "enabled"
    http_tokens                 = "required"
    http_put_response_hop_limit = 2
  }

  root_block_device {
    encrypted             = true
    volume_size           = 30
    volume_type           = "gp3"
    delete_on_termination = true
  }

  depends_on = [
    aws_internet_gateway.main,
    aws_route_table_association.public
  ]

  tags = { Name = "${local.name}-ecs-instance" }
}

resource "aws_db_instance" "main" {
  identifier                          = "${local.name}-postgres"
  engine                              = "postgres"
  engine_version                      = var.rds_engine_version
  instance_class                      = var.rds_instance_class
  allocated_storage                   = var.rds_allocated_storage
  storage_type                        = "gp3"
  storage_encrypted                   = true
  db_name                             = var.rds_database_name
  username                            = var.rds_username
  password                            = var.rds_password
  db_subnet_group_name                = aws_db_subnet_group.main.name
  vpc_security_group_ids              = [aws_security_group.database.id]
  multi_az                            = false
  publicly_accessible                 = false
  port                                = 5432
  backup_retention_period             = 0
  deletion_protection                 = false
  skip_final_snapshot                 = true
  copy_tags_to_snapshot               = false
  apply_immediately                   = false
  auto_minor_version_upgrade          = true
  allow_major_version_upgrade         = false
  enabled_cloudwatch_logs_exports     = []
  performance_insights_enabled        = false
  monitoring_interval                 = 0
  ca_cert_identifier                  = "rds-ca-rsa2048-g1"
  iam_database_authentication_enabled = false
}

resource "aws_ecs_task_definition" "application" {
  family                   = "${local.name}-application"
  network_mode             = "bridge"
  requires_compatibilities = ["EC2"]
  cpu                      = "512"
  memory                   = "768"

  container_definitions = jsonencode([
    {
      name      = "transaction-service"
      image     = "${var.transaction_image}:${var.transaction_image_tag}"
      essential = true
      portMappings = [{
        containerPort = 8080
        hostPort      = 0
        protocol      = "tcp"
      }]
      environment = [
        { name = "SPRING_DATASOURCE_URL", value = "jdbc:postgresql://${aws_db_instance.main.address}:${aws_db_instance.main.port}/${aws_db_instance.main.db_name}" },
        { name = "SPRING_DATASOURCE_USERNAME", value = var.rds_username },
        { name = "SPRING_DATASOURCE_PASSWORD", value = var.rds_password },
        { name = "SPRING_JPA_HIBERNATE_DDL_AUTO", value = "none" },
        { name = "SPRING_FLYWAY_ENABLED", value = "false" },
        { name = "SERVER_PORT", value = "8080" },
        { name = "MANAGEMENT_HEALTH_KAFKA_ENABLED", value = "false" },
        { name = "KAFKA_BOOTSTRAP_SERVERS", value = "localhost:9092" }
      ]
      healthCheck = {
        command     = ["CMD-SHELL", "curl -f http://localhost:8080/actuator/health || exit 1"]
        interval    = 30
        timeout     = 10
        retries     = 3
        startPeriod = 60
      }
      stopTimeout = 60
    },
    {
      name      = "frontend"
      image     = "${var.frontend_image}:${var.frontend_image_tag}"
      essential = true
      links     = ["transaction-service:gateway"]
      portMappings = [{
        containerPort = var.frontend_container_port
        hostPort      = var.frontend_container_port
        protocol      = "tcp"
      }]
      dependsOn = [{
        containerName = "transaction-service"
        condition     = "START"
      }]
      stopTimeout = 30
    }
  ])
}

resource "aws_ecs_service" "application" {
  name                    = "${local.name}-application"
  cluster                 = aws_ecs_cluster.main.id
  task_definition         = aws_ecs_task_definition.application.arn
  desired_count           = 1
  launch_type             = "EC2"
  force_new_deployment    = true
  enable_ecs_managed_tags = true
  propagate_tags          = "SERVICE"

  deployment_minimum_healthy_percent = 0
  deployment_maximum_percent         = 100

  deployment_circuit_breaker {
    enable   = true
    rollback = true
  }

  depends_on = [aws_instance.ecs, aws_db_instance.main]
}
