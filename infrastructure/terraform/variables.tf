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

variable "supabase_jdbc_url" {
  description = "JDBC URL for the Supabase Postgres session pooler, e.g. jdbc:postgresql://aws-0-<region>.pooler.supabase.com:6543/postgres?sslmode=require&prepareThreshold=0"
  type        = string
  default     = "jdbc:postgresql://aws-0-us-west-2.pooler.supabase.com:6543/postgres?sslmode=require&prepareThreshold=0"
}

variable "supabase_username" {
  description = "Supabase Postgres username (postgres.<project-ref> for the pooler)."
  type        = string
  default     = "postgres.ozdbgastmdzryvrugmae"
}

variable "supabase_password" {
  description = "Supabase database password. Supply through TF_VAR_supabase_password or a Terraform variables file excluded from Git."
  type        = string
  sensitive   = true
  nullable    = false

  validation {
    condition     = length(var.supabase_password) >= 8
    error_message = "supabase_password must be at least 8 characters."
  }
}

variable "jwt_secret" {
  description = "JWT signing secret shared by the services. Supply through TF_VAR_jwt_secret or a Terraform variables file excluded from Git."
  type        = string
  sensitive   = true
  nullable    = false

  validation {
    condition     = length(var.jwt_secret) >= 32
    error_message = "jwt_secret must be at least 32 characters."
  }
}

