In order to run the automation, you need 3 secrets in your environment. Get them all from [digital ocean](https://cloud.digitalocean.com/settings/api/tokens)

```
TF_VAR_do_token - this is your digital ocean Personal access tokens
AWS_ACCESS_KEY_ID - this is your digital ocean Spaces access keys
AWS_SECRET_ACCESS_KEY - - this is your digital ocean Spaces access keys
```

Then you can run terraform using a normal terraform workflow. Change into the directory with this readme before starting.

`terraform init` is a run once command that gets your box ready to go by downloading needed plugins and modules.

`terraform apply` diffs the actual infrastructure against the desired infrastructure and offers to apply the difference. Take a look at it and decide if you want to apply it or now.