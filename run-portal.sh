mkdir datum  >/dev/null 2>&1
mkdir certs >/dev/null 2>&1
docker rm -f website

RELEASE=104-master-76ffc4fe6b22819c1cb5b83bc86888ef58a3f7b6

docker run -d --memory=256m -p 80:80 -p 443:443 -u 1000 --name website --volume $PWD/datum:/medir/datum --volume $PWD/certs:/medir/certs mitchelljthomas/medir-portal:$RELEASE
