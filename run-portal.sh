mkdir datum  >/dev/null 2>&1
mkdir certs >/dev/null 2>&1
docker rm -f website

RELEASE=<docker image>

docker run -d --memory=256m -p 80:8080 -p 443:8443 -u 1000 --name website --volume $PWD/datum:/medir/datum --volume $PWD/certs:/medir/certs mitchelljthomas/medir-portal:$RELEASE
