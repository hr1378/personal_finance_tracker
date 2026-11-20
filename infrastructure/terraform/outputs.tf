output "ecs_cluster_name" {
  description = "Name of the ECS cluster."
  value       = aws_ecs_cluster.main.name
}

output "ecs_cluster_arn" {
  description = "ARN of the ECS cluster."
  value       = aws_ecs_cluster.main.arn
}

output "ecs_service_name" {
  description = "Name of the single ECS application service."
  value       = aws_ecs_service.application.name
}

output "ec2_public_ip" {
  description = "Public IPv4 address of the ECS container instance."
  value       = aws_instance.ecs.public_ip
}

output "frontend_access_address" {
  description = "Frontend HTTP access address."
  value       = "http://${aws_instance.ecs.public_ip}:${var.frontend_container_port}"
}

output "database_provider" {
  description = "External database provider used by the deployment."
  value       = "supabase"
}

output "database_jdbc_url" {
  description = "JDBC URL of the Supabase Postgres pooler."
  value       = var.supabase_jdbc_url
}
