terraform {
  required_version = ">= 0.11, < 0.12"
  backend "s3" {
    # overrides to work with s3 look alikes
    skip_requesting_account_id = true
    skip_credentials_validation = true
    skip_get_ec2_platforms = true
    skip_metadata_api_check = true
    region = "us-east-1"

    # get from environment
    # access_key = "" # AWS_ACCESS_KEY_ID
    # secret_key = "" # AWS_SECRET_ACCESS_KEY

    endpoint = "https://sfo2.digitaloceanspaces.com"
    bucket = "palmetto"
    key = "palmetto/all-in-one.tfstate"
  }
}

provider "digitalocean" {
  token = "${var.do_token}"
}

