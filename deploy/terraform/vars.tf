variable "do_token" {
  description = "Token to auth with Digital Ocean"
  type        = "string"
}

# SFO2 supports "all the features" https://www.digitalocean.com/docs/platform/availability-matrix/
variable "region" {
  default     = "sfo2"
  type        = "string"
  description = "the region of DO to use for spawning resources"
}
