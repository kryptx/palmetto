output "fqdn_pip" {
  value = "${digitalocean_record.pip.fqdn}"
}

output "fqdn_client" {
  value = "${digitalocean_record.client.fqdn}"
}

output "all_in_one_lb_ip_address" {
  value = "${digitalocean_loadbalancer.all_in_one.ip}"
}

output "all_in_one_ipv4_address" {
  value = "${digitalocean_droplet.all_in_one.ipv4_address}"
}

output "all_in_one_ssh_ipv4_address" {
  value = "${digitalocean_floating_ip.all_in_one.id}"
}


