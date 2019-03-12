terraform {
  required_version = ">= 0.11, < 0.12"

  backend "s3" {
    # overrides to work with s3 look alikes
    skip_requesting_account_id  = true
    skip_credentials_validation = true
    skip_get_ec2_platforms      = true
    skip_metadata_api_check     = true
    region                      = "us-east-1"

    # get from environment
    # access_key = "" # AWS_ACCESS_KEY_ID
    # secret_key = "" # AWS_SECRET_ACCESS_KEY

    endpoint = "https://sfo2.digitaloceanspaces.com"
    bucket   = "palmetto"
    key      = "palmetto/all-in-one.tfstate"
  }
}

provider "digitalocean" {
  token = "${var.do_token}"
}

resource "digitalocean_ssh_key" "jhgaylor" {
  name       = "Terraform Shared"
  public_key = "${file("${path.module}/jhgaylor.pub")}"
}

resource "digitalocean_ssh_key" "kryptx" {
  name       = "Terraform Shared"
  public_key = "${file("${path.module}/kryptx.pub")}"
}

data template_file "user_data" {
  template = <<USER_DATA
#!/bin/bash

mkdir -p /opt/palmetto
cat << EOF > /opt/palmetto/docker-compose.yml
$${docker_compose_yaml}
EOF

mkdir -p /opt/palmetto/nginx-conf/
cat << EOF > /opt/palmetto/nginx-conf/plmto.com.conf
$${nginx_conf}
EOF

mkdir -p /opt/palmetto/nginx-conf/
cat << EOF > /opt/palmetto/nginx-conf/certbot.conf
$${nginx_certbot_conf}
EOF

cd /opt/palmetto
docker-compose up -d 
USER_DATA

  vars = {
    docker_compose_yaml = "${data.local_file.docker_compose_yaml.content}"
    nginx_conf = "${data.local_file.nginx_config.content}"
    nginx_certbot_conf = "${data.local_file.nginx_certbot_config.content}"
  }
}

data "local_file" "docker_compose_yaml" {
  filename = "${path.module}/docker-compose.yml"
}

data "local_file" "nginx_config" {
  filename = "${path.module}/nginx-config/plmto.com.conf"
}

data "local_file" "nginx_certbot_config" {
  filename = "${path.module}/nginx-config/certbot.conf"
}
