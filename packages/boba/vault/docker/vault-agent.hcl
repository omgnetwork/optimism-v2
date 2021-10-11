exit_after_auth = false
pid_file = "./pidfile"

auto_auth {
  method "aws" {
      mount_path = "auth/aws"
      config = {
          type = "iam"
          role = "${AWS_VAULT_ROLE}"
      }
  }

  sink "file" {
      config = {
          path = "${AWS_SINK_JWT_TOKEN_PATH}"
      }
  }
}

vault {
  address = "${VAULT_ADDR}"
}
