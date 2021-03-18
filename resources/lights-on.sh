#!/bin/sh
front_lights_on=$(curl -s -XPOST -H "Authorization: Bearer de5c64bf3982dab1691a54596083ee4483c35921" https://api.particle.io/v1/devices/1e003d000d47343233323032/relayOn -d arg="4") 
echo "$(date -Iseconds) front on $front_lights_on" >> /var/log/lights.log

wreath_lights_on=$(curl -s -XPOST -H "Authorization: Bearer de5c64bf3982dab1691a54596083ee4483c35921" https://api.particle.io/v1/devices/1e003d000d47343233323032/relayOn -d arg="2")
echo "$(date -Iseconds) wreath on $wreath_lights_on" >> /var/log/lights.log
