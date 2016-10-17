# Script for inserting data into a influxdb instance
echo "Running insert script"
cd /logs
mkdir ./inserted 2>&1 >/dev/null
for f in ./datum-*.log.gz; do
    if [ -f $f ]; then
	echo "Processing file $f"
	gzip -d -c $f | curl --fail -XPOST 'http://influxdbhost:8086/write?db=medir' --data-binary @-
	if [ $? -eq 0 ]; then
	    mv $f ./inserted
	fi
    fi
done
