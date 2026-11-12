#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

if ! command -v terraform >/dev/null 2>&1; then
  echo "terraform is required. Install Terraform 1.6 or newer first." >&2
  exit 1
fi

if ! command -v aws >/dev/null 2>&1; then
  echo "AWS CLI is required. Configure credentials first (for example: aws login --profile terraform-deployer)." >&2
  exit 1
fi

AWS_PROFILE="${AWS_PROFILE:-terraform-deployer}"
export AWS_PROFILE
export AWS_REGION="${AWS_REGION:-us-east-1}"
export AWS_DEFAULT_REGION="$AWS_REGION"

echo "Checking AWS credentials for profile '$AWS_PROFILE' in $AWS_REGION..."
aws sts get-caller-identity --profile "$AWS_PROFILE" >/dev/null

if [[ ! -f terraform.tfvars ]]; then
  umask 077
  cat > terraform.tfvars <<'EOF'
frontend_image       = "hatimrangwala/finance-frontend"
frontend_image_tag   = "v1"
transaction_image     = "hatimrangwala/finance-transaction-service"
transaction_image_tag = "v1"
EOF
  chmod 600 terraform.tfvars
fi

if ! grep -q '^rds_password[[:space:]]*=' terraform.tfvars; then
  read -rsp "Set an RDS password (8+ characters): " RDS_PASSWORD
  printf '\n'
  if (( ${#RDS_PASSWORD} < 8 )); then
    echo "Password must be at least 8 characters." >&2
    exit 1
  fi
  printf 'rds_password = %s\n' "$(printf '%s' "$RDS_PASSWORD" | python3 -c 'import json,sys; print(json.dumps(sys.stdin.read()))')" >> terraform.tfvars
  unset RDS_PASSWORD
fi

terraform init
terraform plan -out=tfplan
terraform apply tfplan
rm -f tfplan

echo
echo "Deployment finished. Frontend address:"
terraform output -raw frontend_access_address
echo
echo "When finished, run ./destroy.sh from this directory."
