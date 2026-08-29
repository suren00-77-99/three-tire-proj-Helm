# 06 - GitHub Configuration

## Repository variables

GitHub -> Settings -> Secrets and variables -> Actions -> Variables

Create:

| Name | Example |
|---|---|
| AWS_REGION | ap-south-1 |
| AWS_ACCOUNT_ID | 123456789012 |
| ECR_REGISTRY | 123456789012.dkr.ecr.ap-south-1.amazonaws.com |
| AWS_GITHUB_ROLE_ARN | arn:aws:iam::123456789012:role/GitHubActionsEKS |
| EKS_CLUSTER_NAME | my-eks-cluster |

## Repository secret

Create:

```text
DB_PASSWORD
```

Use a strong random password.

## Workflow permissions

The workflow requires:

```yaml
permissions:
  contents: read
  id-token: write
```

`id-token: write` lets GitHub issue the OIDC token. It does not itself grant AWS permissions.

## Recommended branch protection

For a real repository:

- Require pull request review
- Require CI workflow to pass
- Restrict direct pushes to main
- Require signed commits if your organization uses them
- Use GitHub Environments for production deployments
- Restrict who can run the CD workflow

## Deployment input

Use the SHA printed by the successful CI run.

Example:

```text
f4e7c8b2...
```

The CD workflow uses that exact tag for both application images.
