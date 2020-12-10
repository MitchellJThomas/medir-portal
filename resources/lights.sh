# Setup script to get timer and service Systemd units in place
# systemd-run --user --on-calendar '*-*-* 23:0,3,5:0' ~/lights-off.sh 2>> ~/lights.log
# systemd-run --user --on-calendar '*-*-* 16:0,3,5:0' ~/lights-on.sh 2>> ~/lights.log
# systemd-run --user --timer-property RandomizedDelaySec=30m --on-calendar '*-*-* *:*:/2' ~/lights-on.sh 2>> ~/lights.log

sudo cp lights.system /etc/systemd/system
sudo cp lights.timer /etc/systemd/system
sudo systemctl daemon-reload
sudo systemctl enable lights.system
sudo systemctl enable lights.timer
