# systemd-run --user --on-calendar '*-*-* 23:0,3,5:0' ~/lights-off.sh 2>> ~/lights.log
# systemd-run --user --on-calendar '*-*-* 16:0,3,5:0' ~/lights-on.sh 2>> ~/lights.log
# systemd-run --user --timer-property RandomizedDelaySec=30m --on-calendar '*-*-* *:*:/2' ~/lights-on.sh 2>> ~/lights.log

sudo cp lights-on.service /etc/systemd/system
sudo cp lights-on.timer /etc/systemd/system
sudo cp lights-off.service /etc/systemd/system
sudo cp lights-off.timer /etc/systemd/system
sudo systemctl daemon-reload
sudo systemctl enable lights-on.timer
sudo systemctl enable lights-off.timer
sudo systemctl list-timers lights-*.timer
