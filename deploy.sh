#!/bin/bash

echo "Building ant starting Flexa Web containers..."
docker compose -f docker-compose.yml up --build -d

echo "Reloading nginx..."
sudo nginx -t && sudo systemctl reload nginx

echo "Deployment complete."
