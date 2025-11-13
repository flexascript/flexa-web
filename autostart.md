# Setup
Create a systemd service file
```bash
sudo nano /etc/systemd/system/flexa-web.service
```

Add this content:
```
[Unit]
Description=Flexa Web
After=network.target

[Service]
Type=simple
User=root
ExecStart=/full/path/to/deploy.sh
WorkingDirectory=/var/www/flexa-web
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable and start the service:
```bash
sudo systemctl daemon-reload
sudo systemctl enable flexa-web.service
sudo systemctl start flexa-web.service
```
