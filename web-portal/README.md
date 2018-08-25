# The Medir web portal processes

The following is the Docker container for deploying and viewing the
medir sensor app running on [Itty Sensor](https://www.ittysensor.com),
using.  This webserver also serves as the data collection point by
hosting the `/datum` URI.

Use docker-compose,
[install that if you need to](https://www.docker.com/docker-toolbox)
to create a local instance.

Use docker-cloud to host it using a cloud provider

## Hosting the medir UI and data collection

## How to build it

1. Build and copy the medir user interface code found over in the
   (medir repo)[https://github.com/mitchellJThomas/medir).
   Check out the repo, build the code and copy it to the `public`
   directory.
```
    PORTAL_DIR=$PWD; cd medir/ui; lein comp*; cp -pr public $PORTAL_DIR
```

2. Build the Docker image
```
    docker build . -t mitchelljthomas/medirportal_go:latest
```

3. Push the new docker image to Docker hub
```
    docker push mitchelljthomas/medirportal_go:latest
```

## How to test it

This project uses Let's Encrypt to acquire TLS certificates.  This
creates an interesting challenge when testing with respect to
validating the certificate e.g. proper domain names.

For testing purpose, this uses [Let's Encrypt
Pebble](https://github.com/letsencrypt/pebble) service to issue test
certificates.

1. Get the ROOT CA test certificate from Pebble

   ```mkdir pebble-ca-certs; wget -O pebble-ca-certs/pebble.minica.pem https://raw.githubusercontent.com/letsencrypt/pebble/master/test/certs/pebble.minica.pem```

1. Start the processes
```
    docker-compose up
```

1. Send data
```
    curl -H "Content-Type: application/json" -X POST -d '{"username":"xyz","password":"xyz"}' https://localhost:9443/datum

```

4. Kill the local test
```
    docker rm -f medir-portal
```

5. Login to the public docker hub if you havn't already and push to public repo
```
    docker-compose push
```


## To Renew the certificate

1. Re-start the container and it will fetch a new certificate from
   Let's Encrypt.  Note: beware not to re-start too frequently as
   Let's Encrypt has a limit

Tip: Create a volume mount for /medir/certs to persist certificates
across image re-starts
