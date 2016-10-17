FROM debian:jessie
MAINTAINER mthomas@tripwire.com
 
# Add crontab file in the cron directory
ADD crontab /etc/cron.d/insert-data
 
# Give execution rights on the cron job
RUN chmod 0644 /etc/cron.d/insert-data
 
# Create the log file to be able to run tail
RUN touch /var/log/cron.log

# Install cron
RUN apt-get update
RUN apt-get -y install cron curl gzip

# Script cron runs to check for logs
COPY insert-to-influxdb.sh /

# Where the logs are placed
VOLUME /logs
 
# Run the command on container startup
CMD cron && tail -f /var/log/cron.log
