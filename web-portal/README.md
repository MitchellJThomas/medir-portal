# The Medir web portal processes

The following is the Docker container for deploying and viewing the
medir sensor app running on [Itty Sensor](https://www.ittysensor.com),
using.  This webserver also serves as the data collection point by
hosting the `/datum` URI.

# Building the container

There is a [CircleCI](http://circleci.com) build that creates this
Golang webserver.

# Dev builds

Look in the circleci/config.yml file to see how CircleCi builds the
container and use the `docker build` command you find there

# URLS

1. The '/.well-known/acme-challenge' endpoint for Let's Encrypt TLS certificates
2. The '/health' endpoint reports status and imageTag.
3. The '/' endpoint for the JS user interface

The first endpoint is served over HTTP to allow bootstrapping of the
TLS certificate

The remainder of the endpoints are only available via HTTPS

# TLS Certificates and domain names

Currently the code in this repo only allows for fetching certificates
for the www.ittysensor.com domain.  If you plan on using this code to
host your own domain, you will need to change the HostPolicy found
in main.go
