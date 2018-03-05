# The Medir web portal processes

The following is the Docker container for deploying and viewing the
medir sensor app running on [Itty Sensor](https://www.ittysensor.com),
using.

Use docker-compose,
[install that if you need to](https://www.docker.com/docker-toolbox)
to create a local instance.

Use docker-cloud to host it using a cloud provider

## Hosting the medir UI

## How to build it

1. Gotta install [Go dep](https://github.com/golang/dep) then do
```
    dep init
```

2. Build the static binary, assumes the golang package is installed
   locally
```
    CGO_ENABLED=0 GOOS=linux go build -a  -installsuffix cgo -o medir-portal-server .
```

3. Build and copy the medir user interface code found over in the
   (medir repo)[https://github.com/mitchellJThomas/medir).
   Check out the repo, build the code and copy it to the `public`
   directory.
```
    PORTAL_DIR=$PWD; cd medir/ui; lein comp*; cp -pr public $PORTAL_DIR
```

4. Build the Docker image
```
    docker-compose build
```

5. Test it
```
    docker run -ti -p 8080:80 -p 8443:443 --name medir-portal mitchelljthomas/medirportal_go
```

6. Kill the local test
```
    docker rm -f medir-portal
```

7. Login to the public docker hub if you havn't already and push to public repo
```
    docker-compose push
```


## To Renew the certificate
