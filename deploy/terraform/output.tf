output "fqdn_pip" {
  value = "${digitalocean_record.pip.fqdn}"
}

output "fqdn_client" {
  value = "${digitalocean_record.client.fqdn}"
}
