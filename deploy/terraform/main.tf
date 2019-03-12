# Create a new Web Droplet in the nyc2 region
resource "digitalocean_droplet" "all_in_one" {
  image     = "docker-18-04"
  name      = "all-in-one-1"
  region    = "${var.region}"
  size      = "s-2vcpu-2gb"
  ssh_keys  = ["${digitalocean_ssh_key.jhgaylor.fingerprint}", "${digitalocean_ssh_key.kryptx.fingerprint}"]
  user_data = "${data.template_file.user_data.rendered}"

  # NOTE: enabling this code while testing helps sometimes
  # lifecycle {
  #   ignore_changes = ["user_data"]
  # }
}

resource "digitalocean_domain" "plmto_com" {
  name = "plmto.com"
}

resource "digitalocean_record" "srv" {
  domain   = "${digitalocean_domain.plmto_com.name}"
  type     = "SRV"
  weight   = 65535
  priority = 65535
  name     = "_palmetto._tcp"
  port     = 443
  value    = "pip"
}

resource "digitalocean_floating_ip" "all_in_one" {
  region     = "${var.region}"
}

resource "digitalocean_floating_ip_assignment" "all_in_one" {
  ip_address = "${digitalocean_floating_ip.all_in_one.id}"
  droplet_id = "${digitalocean_droplet.all_in_one.id}"
}

resource "digitalocean_record" "pip" {
  domain = "${digitalocean_domain.plmto_com.name}"
  type   = "A"
  name   = "pip"
  value  = "${digitalocean_floating_ip.all_in_one.ip_address}"
}

resource "digitalocean_record" "client" {
  domain = "${digitalocean_domain.plmto_com.name}"
  type   = "A"
  name   = "client"
  value  = "${digitalocean_floating_ip.all_in_one.ip_address}"
}

resource "digitalocean_firewall" "ssh_http_https" {
  name = "only-ssh-http-and-https"

  # droplet_ids = ["${digitalocean_droplet.all_in_one.id}"]
  droplet_ids = []

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
