#!/bin/bash

echo "Construindo e iniciando containers Flexa Web"
docker compose -f docker-compose.yml up --build -d

echo "Recarregando configuração do nginx..."
sudo nginx -t && sudo systemctl reload nginx

echo "Aplicação rodando em:"
echo "Frontend: http://seu-servidor/flexa-ide"
echo "Backend API: http://seu-servidor/flexa-server"
echo "WebSocket: ws://seu-servidor/flexa-server/ws"
