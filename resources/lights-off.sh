#!/bin/sh
echo "$(date -Iseconds) front off $(curl -s -XPOST -H "Authorization: Bearer de5c64bf3982dab1691a54596083ee4483c35921" https://api.particle.io/v1/devices/1e003d000d47343233323032/relayOff -d arg="4")" >> /var/log/lights.log
echo "$(date -Iseconds) wreath off $(curl -s -XPOST -H "Authorization: Bearer de5c64bf3982dab1691a54596083ee4483c35921" https://api.particle.io/v1/devices/1e003d000d47343233323032/relayOff -d arg="2")" >> /var/log/lights.log
