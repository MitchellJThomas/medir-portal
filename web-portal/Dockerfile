FROM alpine:latest
RUN apk update && apk add ca-certificates && rm -rf /var/cache/apk/*
RUN mkdir -p /medir/certs
ADD public /medir/html
ADD medir-portal-server /medir
WORKDIR /medir
EXPOSE 80/tcp 443/tcp
CMD ["/medir/medir-portal-server"]
