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
# AWS CLI login credentials are stored in the CLI login cache; export them so
# the Terraform AWS provider can consume them through its standard env chain.
eval "$(aws configure export-credentials --profile "$AWS_PROFILE" --format env)"

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

if ! grep -q '^supabase_password[[:space:]]*=' terraform.tfvars; then
  read -rsp "Set the Supabase database password (8+ characters): " SUPABASE_PASSWORD
  printf '\n'
  if (( ${#SUPABASE_PASSWORD} < 8 )); then
    echo "Password must be at least 8 characters." >&2
    exit 1
  fi
  printf 'supabase_password = %s\n' "$(printf '%s' "$SUPABASE_PASSWORD" | python3 -c 'import json,sys; print(json.dumps(sys.stdin.read()))')" >> terraform.tfvars
  unset SUPABASE_PASSWORD
fi

if ! grep -q '^jwt_secret[[:space:]]*=' terraform.tfvars; then
  read -rsp "Set the JWT secret (32+ characters): " JWT_SECRET_VALUE
  printf '\n'
  if (( ${#JWT_SECRET_VALUE} < 32 )); then
    echo "JWT secret must be at least 32 characters." >&2
    exit 1
  fi
  printf 'jwt_secret = %s\n' "$(printf '%s' "$JWT_SECRET_VALUE" | python3 -c 'import json,sys; print(json.dumps(sys.stdin.read()))')" >> terraform.tfvars
  unset JWT_SECRET_VALUE
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
