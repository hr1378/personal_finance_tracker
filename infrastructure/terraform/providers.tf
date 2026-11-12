provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "personal-finance-tracker"
      Environment = "minimal-aws"
      ManagedBy   = "terraform"
    }
  }
}
