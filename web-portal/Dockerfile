FROM golang:alpine as medir-build
WORKDIR /go/src/github.com/mitchelljthomas/medir-portal/web-portal
RUN apk update && apk add git && go get -u github.com/golang/dep/cmd/dep
COPY main.go .
RUN dep init && go build -o medir-portal-server .

FROM alpine:latest
RUN apk update && apk add ca-certificates && rm -rf /var/cache/apk/*
RUN adduser -D -h /medir -u 1000 medir && mkdir -p /medir/certs
USER medir
COPY --from=medir-build /go/src/github.com/mitchelljthomas/medir-portal/web-portal/medir-portal-server /medir
COPY ./build/ /medir/html/
WORKDIR /medir
ARG circle_ci_image_tag
ENV IMAGE_TAG=$circle_ci_image_tag
EXPOSE 8080/tcp 8443/tcp
CMD ["/medir/medir-portal-server"]
