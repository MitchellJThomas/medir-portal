docker run -t -i --rm --name cloader --link small_stallman:influxdbhost --volume /Users/mthomas/Dev/medir-portal/data-portal/cron-loader/logs:/logs cron-loader
