# 02 - AWS OIDC and IAM

## OIDC flow

```text
GitHub Actions
     |
     | OIDC JWT
     v
token.actions.githubusercontent.com
     |
     v
AWS IAM OIDC Provider
     |
     v
GitHubActions-EKS-ECR role
     |
     +--> ECR
     |
     +--> EKS DescribeCluster
     |
     +--> Kubernetes API access
```

GitHub recommends using OIDC so workflows can access AWS without storing long-lived AWS credentials.

## 1. Create GitHub OIDC provider

AWS IAM -> Identity providers -> Add provider

- Provider type: OpenID Connect
- Provider URL: `https://token.actions.githubusercontent.com`
- Audience: `sts.amazonaws.com`

## 2. Trust policy

Replace the placeholders with your organization, repository and branch.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::<ACCOUNT_ID>:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com",
          "token.actions.githubusercontent.com:sub": "repo:<ORG>/<REPO>:ref:refs/heads/main"
        }
      }
    }
  ]
}
```

For a production setup, scope the trust policy as tightly as possible. If the workflow uses an environment, the `sub` claim format is different.

## 3. Permissions for CI

The CI job needs:

- ECR CreateRepository (optional, because this lab creates repositories automatically)
- ECR GetAuthorizationToken
- ECR BatchCheckLayerAvailability
- ECR InitiateLayerUpload
- ECR UploadLayerPart
- ECR CompleteLayerUpload
- ECR PutImage
- ECR DescribeRepositories

## 4. Permissions for CD

The CD workflow needs:

- `eks:DescribeCluster`
- ECR read permissions if the cluster pulls private ECR images through its node role
- Kubernetes RBAC permissions for the GitHub identity used by the EKS authentication mapping

Important: AWS IAM permission to call `eks:DescribeCluster` is not the same as Kubernetes RBAC permission. The EKS access entry/role mapping must also allow the GitHub role to perform the required Kubernetes actions.

## 5. GitHub variables

Set repository variables:

```text
AWS_REGION=ap-south-1
AWS_ACCOUNT_ID=123456789012
ECR_REGISTRY=123456789012.dkr.ecr.ap-south-1.amazonaws.com
AWS_GITHUB_ROLE_ARN=arn:aws:iam::123456789012:role/<ROLE_NAME>
EKS_CLUSTER_NAME=<YOUR_EXISTING_EKS_CLUSTER>
```

Secret:

```text
DB_PASSWORD=<strong-password>
```

Do not commit the database password.

## OIDC checklist

- [ ] IAM OIDC provider created
- [ ] Trust policy limited to the repository
- [ ] Branch restricted to main
- [ ] `permissions.id-token: write` enabled
- [ ] GitHub variables configured
- [ ] No static AWS keys stored in GitHub
- [ ] CD role has EKS access and Kubernetes RBAC
