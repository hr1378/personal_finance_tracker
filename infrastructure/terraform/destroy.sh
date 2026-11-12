#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

if ! command -v terraform >/dev/null 2>&1; then
  echo "terraform is required. Install Terraform 1.6 or newer first." >&2
  exit 1
fi

AWS_PROFILE="${AWS_PROFILE:-terraform-deployer}"
export AWS_PROFILE
export AWS_REGION="${AWS_REGION:-us-east-1}"
export AWS_DEFAULT_REGION="$AWS_REGION"

if [[ ! -d .terraform ]]; then
  terraform init
fi

echo "Checking AWS credentials for profile '$AWS_PROFILE' in $AWS_REGION..."
aws sts get-caller-identity --profile "$AWS_PROFILE" >/dev/null

terraform destroy -auto-approve

echo "Terraform destroy completed. Checking managed state..."
if terraform state list | grep -q .; then
  echo "Terraform still lists managed resources; keeping local state for recovery." >&2
  exit 1
fi

rm -f terraform.tfvars tfplan
echo "Managed resources are destroyed and generated variables/plan files were removed."
