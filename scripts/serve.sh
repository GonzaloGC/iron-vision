#!/usr/bin/env bash
set -e

BACKEND_PORT=${1:-8000}
FRONTEND_PORT=${2:-3000}

ROOT="$(dirname "$0")/.."

# Detect local IP
IP=$(ipconfig 2>/dev/null | grep -i "IPv4" | head -n1 | awk '{print $NF}' || \
     hostname -I 2>/dev/null | awk '{print $1}' || \
     ip addr 2>/dev/null | grep -oP 'inet \K192\.168\.\d+\.\d+' | head -n1)

if [ -z "$IP" ]; then
  echo "No se pudo detectar la IP local"
  exit 1
fi

echo "========================================"
echo "  IronVision - Servidor de red local"
echo "========================================"
echo ""
echo "IP local: $IP"
echo ""

# Start backend
echo "[1/2] Iniciando backend en http://${IP}:${BACKEND_PORT} ..."
cd "$ROOT/backend"
uvicorn app.main:app --host 0.0.0.0 --port "$BACKEND_PORT" --reload &
BACKEND_PID=$!

sleep 3

# Start frontend
echo "[2/2] Iniciando frontend en http://${IP}:${FRONTEND_PORT} ..."
cd "$ROOT/web"
NEXT_PUBLIC_API_URL="http://${IP}:${BACKEND_PORT}" npx next dev -H 0.0.0.0 -p "$FRONTEND_PORT" &
FRONTEND_PID=$!

sleep 5

echo ""
echo "========================================"
echo "  Servidores listos!"
echo "========================================"
echo ""
echo "  Frontend: http://${IP}:${FRONTEND_PORT}"
echo "  Backend:  http://${IP}:${BACKEND_PORT}"
echo ""
echo "  Abrí http://${IP}:${FRONTEND_PORT} desde tu celu"
echo ""
echo "  Presioná Ctrl+C para detener ambos servidores"
echo ""

trap "echo 'Deteniendo...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM
wait
