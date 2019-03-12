# Create a new Web Droplet in the nyc2 region
resource "digitalocean_droplet" "all_in_one" {
  image  = "docker-18-04"
  name   = "all-in-one-1"
  region = "${var.region}"
  size   = "s-2vcpu-2gb"
}

resource "digitalocean_domain" "plmto_com" {
  name = "plmto.com"
}

resource "digitalocean_record" "pip" {
  domain = "${digitalocean_domain.plmto_com.name}"
  type   = "A"
  name   = "pip"
  value  = "${digitalocean_droplet.all_in_one.ipv4_address}"
}

resource "digitalocean_record" "client" {
  domain = "${digitalocean_domain.plmto_com.name}"
  type   = "A"
  name   = "client"
  value  = "${digitalocean_droplet.all_in_one.ipv4_address}"
}
