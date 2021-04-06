#!/bin/sh
access_token=abc123

echo "$(date -Iseconds) front off $(curl -s -XPOST -H "Authorization: Bearer $access_token" https://api.particle.io/v1/devices/1e003d000d47343233323032/relayOff -d arg="3")" >> /var/log/lights.log

echo "$(date -Iseconds) wreath off $(curl -s -XPOST -H "Authorization: Bearer $access_token" https://api.particle.io/v1/devices/1e003d000d47343233323032/relayOff -d arg="4")" >> /var/log/lights.log
