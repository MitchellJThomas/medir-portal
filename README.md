# Medir-portal: an internet application for gathering IoT temperature data

This is the repository for the Medir portal, an "internet application"
for gathering, archiving, processesing and displaying sensor data.
The current implementation harvests temperature and humidity data.

This project uses Particle.io sensors for harvesting and transmitting
data to the portal.  This repository contains the:
 - Particle [sensor](sensors) code for harvesing data
 - [Web interface](ui) for viewing the sensor data
 - [Web portal](web-portal) which accepts data from the Particle Cloud and servces
   the web interface

## Deploying and using the medir portal

To start collecting data, you need to:

1. Purchase a [Particle core](https://store.particle.io/) device
2. Purchase either
   1. a [DHT22](http://www.adafruit.com/products/385) tempurature and humidity sensor
   2. a [OneWire DS18B20](https://www.sparkfun.com/products/245) temperature sensor
3. Get the sensor circuit up and running with the sensor code, either program depending on what sensor you bought
  1.   [DHT22 program](src/dht22-sensor.ino)
  2.   [DS18x20 program](src/ds18x20-sensor.ino)
4. Build the [web interface](ui) and [web portal](web-portal).
   Currently CircleCi is used to build both and push an image to
   Docker hub.  This requires a CircleCi account configured with the
   appropriate permissions to pull this repository and then push an
   image into hub
5. Deploy it to a system configured for your DNS domain.  This step requires you have setup a resolvable DNS
   domain through your selected cloud provider to create a [Let's
   Encrypt](https://letsencrypt.org/) certificate.  Why?  Securing
   your sensor data transmission is important!   I've done so using an
   Ubnutu VM and run the image using the run-portal.sh script.  The
   web-portal process both logs the sensor temperature and humiditiy data it receives *and* it
   serves the user interface to the browser for viewing the current
   temparature, humidity and turning the outlet sockets on/off.
