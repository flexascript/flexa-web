# Flexa Web

[![Flexa](https://img.shields.io/badge/Made_for-Flexa-purple.svg)](https://github.com/flexa-script)
[![License](https://img.shields.io/github/license/flexa-script/flexa-web-ide)](LICENSE)

## Sources

- `app/`: Flexa IDE
- `server/`: Flexa backend

## Run
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
WorkingDirectory=/var/www/
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


## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
