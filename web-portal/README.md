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
