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
  value    = "pip1"
}

resource "digitalocean_record" "ssh" {
  domain = "${digitalocean_domain.plmto_com.name}"
  type   = "A"
  name   = "ssh"
  value  = "${digitalocean_floating_ip.all_in_one.id}"
}

resource "digitalocean_record" "pip1" {
  domain = "${digitalocean_domain.plmto_com.name}"
  type   = "A"
  name   = "pip1"
  value  = "${digitalocean_loadbalancer.all_in_one.ip}"
}

resource "digitalocean_record" "app" {
  domain = "${digitalocean_domain.plmto_com.name}"
  type   = "A"
  name   = "app"
  value  = "${digitalocean_loadbalancer.all_in_one.ip}"
}

resource "digitalocean_record" "pip" {
  domain = "${digitalocean_domain.plmto_com.name}"
  type   = "A"
  name   = "pip"
  value  = "${digitalocean_loadbalancer.all_in_one.ip}"
}

resource "digitalocean_record" "client" {
  domain = "${digitalocean_domain.plmto_com.name}"
  type   = "A"
  name   = "client"
  value  = "${digitalocean_loadbalancer.all_in_one.ip}"
}