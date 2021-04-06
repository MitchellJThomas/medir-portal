#!/bin/sh
access_token=abc123

front_lights_on=$(curl -s --connect-timeout 10 -m 10 -XPOST -H "Authorization: Bearer $access_token" https://api.particle.io/v1/devices/1e003d000d47343233323032/relayOn -d arg="3") 
echo "$(date -Iseconds) front on $front_lights_on" >> /var/log/lights.log

wreath_lights_on=$(curl -s --connect-timeout 10 -m 10 -XPOST -H "Authorization: Bearer $access_token" https://api.particle.io/v1/devices/1e003d000d47343233323032/relayOn -d arg="4")
echo "$(date -Iseconds) wreath on $wreath_lights_on" >> /var/log/lights.log
