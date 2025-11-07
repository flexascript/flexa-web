#!/bin/bash

echo "Construindo imagem do interpretador..."
docker build -t flexa-interpreter-image ./server

echo "Construindo e iniciando containers Flexa IDE..."
docker compose -f docker-compose.prod.yml up --build -d

echo "Recarregando configuração do nginx..."
sudo nginx -t && sudo systemctl reload nginx

echo "Aplicação rodando em:"
echo "Frontend: http://seu-servidor/flexa-ide"
echo "Backend API: http://seu-servidor/flexa-server"
echo "WebSocket: ws://seu-servidor/flexa-server/ws"
