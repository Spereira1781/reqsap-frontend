#!/usr/bin/env bash
set -e

cd "$(dirname "$0")"

echo "[ReqSAP] Instalando dependências..."
npm install

echo "[ReqSAP] Iniciando aplicação e abrindo no navegador..."
npm run dev -- --host 0.0.0.0 --open
