# Create a new Web Droplet in the nyc2 region
resource "digitalocean_droplet" "all_in_one" {
  image     = "docker-18-04"
  name      = "all-in-one-1"
  region    = "${var.region}"
  size      = "s-1vcpu-1gb"
  ssh_keys  = ["${digitalocean_ssh_key.jhgaylor.fingerprint}", "${digitalocean_ssh_key.kryptx.fingerprint}"]
  user_data = "${data.template_file.user_data.rendered}"

  # NOTE: enabling this code while testing helps sometimes
  # lifecycle {
  #   ignore_changes = ["user_data"]
  # }
}

resource "digitalocean_floating_ip" "all_in_one" {
  region     = "${var.region}"
}

resource "digitalocean_floating_ip_assignment" "all_in_one" {
  ip_address = "${digitalocean_floating_ip.all_in_one.id}"
  droplet_id = "${digitalocean_droplet.all_in_one.id}"
}

resource "digitalocean_certificate" "plmto" {
  name             = "plmto"

  type = "lets_encrypt"

  domains = [
    "pip.plmto.com",
    "pip1.plmto.com",
    "client.plmto.com",
    "app.plmto.com",
  ]

  lifecycle {
    create_before_destroy = true
  }
}

resource "digitalocean_loadbalancer" "all_in_one" {
  name = "plmto-public"
  region = "${var.region}"
  redirect_http_to_https = true

  forwarding_rule {
    entry_port = 443
    entry_protocol = "https"

    target_port = 80
    target_protocol = "http"

    certificate_id = "${digitalocean_certificate.plmto.id}"
  }

  healthcheck {
    port = 80
    path = "/healthz"
    protocol = "http"
  }

  droplet_ids = ["${digitalocean_droplet.all_in_one.id}"]
}

resource "digitalocean_firewall" "ssh_http_https" {
  name = "only-ssh-http-and-https"

  droplet_ids = ["${digitalocean_droplet.all_in_one.id}"]

  inbound_rule = [
    {
      protocol         = "tcp"
      port_range       = "22"
      source_addresses = ["0.0.0.0/0", "::/0"]
    },
    {
      protocol         = "tcp"
      port_range       = "80"
      source_addresses = ["0.0.0.0/0", "::/0"]
    },
    {
      protocol         = "tcp"
      port_range       = "443"
      source_addresses = ["0.0.0.0/0", "::/0"]
    },
    {
      protocol         = "tcp"
      port_range       = "4000-4001"
      source_addresses = ["0.0.0.0/0", "::/0"]
    },
    {
      protocol         = "tcp"
      port_range       = "5984"
      source_addresses = ["0.0.0.0/0", "::/0"]
    },
    {
      protocol         = "tcp"
      port_range       = "4369"
      source_addresses = ["0.0.0.0/0", "::/0"]
    },
    {
      protocol         = "tcp"
      port_range       = "9100"
      source_addresses = ["0.0.0.0/0", "::/0"]
    },
    {
      protocol         = "icmp"
      source_addresses = ["0.0.0.0/0", "::/0"]
    },
  ]

  outbound_rule = [
    {
      protocol              = "tcp"
      port_range            = "1-65535"
      destination_addresses = ["0.0.0.0/0", "::/0"]
    },
    {
      protocol              = "udp"
      port_range            = "1-65535"
      destination_addresses = ["0.0.0.0/0", "::/0"]
    },
    {
      protocol              = "icmp"
      destination_addresses = ["0.0.0.0/0", "::/0"]
    },
  ]
}
