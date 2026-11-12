variable "aws_region" {
  description = "AWS region for all resources."
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Short name used in resource names and tags."
  type        = string
  default     = "finance"

  validation {
    condition     = can(regex("^[a-z0-9-]{1,24}$", var.project_name))
    error_message = "project_name must contain 1-24 lowercase letters, numbers, or hyphens."
  }
}

variable "ec2_instance_type" {
  description = "EC2 instance type for the single ECS container host."
  type        = string
  default     = "t4g.micro"
}

variable "frontend_image" {
  description = "Full Docker registry image name for the frontend, for example username/finance-frontend."
  type        = string
}

variable "frontend_image_tag" {
  description = "Docker Hub tag for the frontend image."
  type        = string
  default     = "latest"
}

variable "transaction_image" {
  description = "Full Docker registry image name for the transaction service."
  type        = string
}

variable "transaction_image_tag" {
  description = "Docker Hub tag for the transaction service image."
  type        = string
  default     = "latest"
}

variable "frontend_container_port" {
  description = "Frontend container HTTP port."
  type        = number
  default     = 80

  validation {
    condition     = var.frontend_container_port >= 1 && var.frontend_container_port <= 65535
    error_message = "frontend_container_port must be between 1 and 65535."
  }
}

variable "rds_instance_class" {
  description = "RDS PostgreSQL instance class."
  type        = string
  default     = "db.t4g.micro"
}

variable "rds_allocated_storage" {
  description = "Initial RDS PostgreSQL storage in GiB."
  type        = number
  default     = 20

  validation {
    condition     = var.rds_allocated_storage >= 20 && var.rds_allocated_storage <= 65536
    error_message = "rds_allocated_storage must be between 20 and 65536 GiB for PostgreSQL."
  }
}

variable "rds_engine_version" {
  description = "RDS PostgreSQL engine version."
  type        = string
  default     = "17.6"
}

variable "rds_database_name" {
  description = "Application database name."
  type        = string
  default     = "finance_tracker"
}

variable "rds_username" {
  description = "Application database username."
  type        = string
  default     = "finance_user"
  sensitive   = true
}

variable "rds_password" {
  description = "Application database password. Supply through TF_VAR_rds_password or a Terraform variables file excluded from Git."
  type        = string
  sensitive   = true
  nullable    = false

  validation {
    condition     = length(var.rds_password) >= 8
    error_message = "rds_password must be at least 8 characters."
  }
}

