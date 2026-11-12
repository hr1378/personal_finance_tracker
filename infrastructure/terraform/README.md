# Minimal AWS Deployment (ECS on EC2 and RDS)

This Terraform configuration is prepared for a small learning deployment using the frontend and transaction-service images from a public Docker registry. It does not create AWS resources until you run `terraform apply`; no AWS resources have been created by this work.

## AWS design

- ECS cluster and one ECS service with one task containing the frontend and transaction-service containers.
- One EC2 `t4g.micro` ARM64 host running the ECS-optimized Amazon Linux AMI. Both registry images publish ARM64 manifests; the x86 instance type cannot pull them. The AMI requires a 30 GiB root volume. A single host avoids Fargate and Auto Scaling Group resources and is enough for this low traffic learning setup, subject to the images fitting in the available memory.
- One encrypted, single-AZ RDS PostgreSQL `db.t4g.micro` instance with 20 GiB storage.
- A VPC, two public subnets, two private DB subnets, an Internet Gateway, route table, security groups, and a small ECS instance role/profile are supporting configuration required for networking and ECS. The EC2 host is public for Docker registry pulls and browser access; RDS is private.
- No load balancer, NAT Gateway, ECR, CloudWatch log group, or other application service is provisioned. ECS service/container logging uses the Docker default, so logs are available on the host.

The frontend nginx configuration bundled in the existing image proxies `/api` to `gateway:8080`. The ECS task links the transaction container under that alias and overrides its Spring port to 8080. This allows transaction API requests to reach the selected transaction image without adding the gateway image. Other UI functions (budgets, accounts, debts, chat, and similar features) require services excluded by the two-image limit and will not work.

The transaction service gets its PostgreSQL connection from the RDS endpoint. Terraform sets `SPRING_FLYWAY_ENABLED=false` and `SPRING_JPA_HIBERNATE_DDL_AUTO=none`, so Flyway migrations are disabled and Hibernate neither validates nor creates tables. The RDS database is left with no application schema or seed data. Code inspection found no startup runner or initializer that queries the transaction repositories, so Spring can build its context with an empty schema as long as it can connect to PostgreSQL. The actuator health check can confirm database connectivity; transaction API operations that query or write tables will fail until you create the schema yourself. Kafka is not included; transaction event publishing may log failures when invoked. Destroy removes the database without a final snapshot.

## Image names

The repository's CD workflow publishes `finance-frontend` and `finance-transaction-service` under the Docker Hub username stored in its `DOCKER_USERNAME` secret. Supply the actual public image names and tags in `terraform.tfvars`. The example names below use `YOUR_DOCKER_USERNAME`; replace them with the correct owner and published tags.

## Prerequisites and setup

- Terraform 1.6 or newer and AWS credentials configured for the account/region you want to use.
- Permissions to create VPC networking resources, EC2 instances and IAM instance profiles, ECS resources, and RDS resources.
- Both registry images must be public. Private registry authentication is not configured.

The scripts default to the `terraform-deployer` AWS CLI profile and `us-east-1`. Sign in/configure that profile first, and make sure Terraform 1.6+, AWS CLI, and Python 3 are installed. You can override these defaults with `AWS_PROFILE` and `AWS_REGION`.

`deploy.sh` writes the known public image names and `v1` tags to a private, gitignored `terraform.tfvars`, prompts for the database password, then initializes, plans, and applies. Terraform's local state contains the database password and task environment values; keep it private and do not commit it.

## Deploy when ready

Run the one-command setup from this directory:

```bash
./deploy.sh
```

Open the printed address in a browser. The transaction container is reachable through the frontend proxy, not directly from the public internet. The task uses a single EC2 host and is not highly available. Instance replacement or host failure requires Terraform/EC2 recovery.

## Stop charges and remove the deployment

When finished, run the one-command teardown from this directory, with the same AWS profile and region:

```bash
./destroy.sh
```

The script checks the AWS identity, runs `terraform destroy -auto-approve`, and only removes the generated variables and plan after Terraform reports no managed resources in state. `skip_final_snapshot = true` means the RDS database and its contents are deleted permanently. Keep the state until destroy completes; removing state first does not delete AWS resources. Costs may accrue while resources exist, including EC2, its public IPv4 address and EBS volume, and RDS compute and storage. Destroy removes these Terraform-managed resources; it cannot clean up resources made outside this configuration.
