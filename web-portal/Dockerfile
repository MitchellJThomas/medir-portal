FROM golang:alpine as medir-build
WORKDIR /go/src/github.com/mitchelljthomas/medir-portal/web-portal
COPY main.go .
RUN apk update && apk add git && go get -u github.com/golang/dep/cmd/dep && \
    dep init && \
    go build -o medir-portal-server .

FROM alpine:latest
RUN mkdir -p /medir/certs && apk update && apk add ca-certificates && rm -rf /var/cache/apk/*
COPY --from=medir-build /go/src/github.com/mitchelljthomas/medir-portal/web-portal/medir-portal-server /medir
COPY ./public/ /medir/html/
WORKDIR /medir
EXPOSE 80/tcp 443/tcp
CMD ["/medir/medir-portal-server"]
