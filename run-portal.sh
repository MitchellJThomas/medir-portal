mkdir datum  >/dev/null 2>&1
mkdir certs >/dev/null 2>&1
docker rm -f website
docker pull mitchelljthomas/medirportal_go:latest
# docker run -d --memory=256m -p 80:80 -p 443:443 --name website --volume $PWD/datum:/medir/datum --volume $PWD/certs:/medir/certs mitchelljthomas/medirportal_go:latest
docker run -d --memory=256m -p 80:80 -p 443:443 --name website --volume $PWD/datum:/medir/datum --volume $PWD/certs:/medir/certs mitchelljthomas/medir-portal:0.2.57
