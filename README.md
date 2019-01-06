# Medir-portal: an internet application for gathering IoT temperature data

This is the repository for the Medir portal, an "internet application"
for gathering, archiving, processesing and displaying sensor data.
The current implementation harvests temperature and humidity data.

Contained within this repository are the Docker containers and scripts
for setting up the [portal](web-portal).

Medir is a process which harvests temperature and (when available)
humidity data from Particle.io devices running the
[DHT22 program](src/dht22-sensor.ino) or the
[DS18x20 program](src/ds18x20-sensor.ino) which requires a DHT22 or
DS18x20 chip to be connected to the Particle.io device.

Note: a DS18x20 sensor does NOT measure humidity, however the DHT22 does.

## Usage

To start collecting data, you need to:

1. buy a [Particle core](https://www.particle.io/store)
2. buy either
   1. a [DHT22](http://www.adafruit.com/products/385) tempurature and humidity sensor
   2. a [OneWire DS18B20](https://www.sparkfun.com/products/245) temperature sensor
3. Get the sensor circuit up and running with the datum collection
code, either program depending on what sensor you bought
  1.   [DHT22 program](src/dht22-sensor.ino)
  2.   [DS18x20 program](src/ds18x20-sensor.ino)
4.
5.
