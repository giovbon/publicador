#!/usr/bin/env bash
# Sobe o blog em modo desenvolvimento (ou gera o build) sem deixar
# processos antigos presos na porta.
#
# Uso:
#   ./run.sh              # dev server em http://localhost:8080
#   PORT=8081 ./run.sh    # outra porta
#   ./run.sh build        # build de produção em _site/
set -euo pipefail

cd "$(dirname "$0")"

PORT="${PORT:-8080}"
MODE="${1:-dev}"

log() { printf '%s\n' "$*"; }

# Encerra o que estiver escutando na porta informada.
free_port() {
  local port="$1"
  local pids="" pid="" still="" attempt=""

  if command -v lsof >/dev/null 2>&1; then
    pids="$(lsof -ti "tcp:${port}" -sTCP:LISTEN 2>/dev/null || true)"
  fi

  if [ -z "$pids" ] && command -v fuser >/dev/null 2>&1; then
    pids="$(fuser "${port}/tcp" 2>/dev/null || true)"
  fi

  if [ -z "$pids" ] && command -v ss >/dev/null 2>&1; then
    pids="$(ss -ltnp "sport = :${port}" 2>/dev/null | grep -o 'pid=[0-9]*' | cut -d= -f2 || true)"
  fi

  pids="$(printf '%s' "$pids" | tr -s '[:space:]' ' ' | xargs || true)"
  if [ -z "$pids" ]; then
    return 0
  fi

  log "→ Porta ${port} em uso por: ${pids}. Encerrando…"
  for pid in $pids; do
    if [ "$pid" != "$$" ]; then
      kill "$pid" 2>/dev/null || true
    fi
  done

  for attempt in 1 2 3 4 5 6 7 8 9 10; do
    still=""
    for pid in $pids; do
      if kill -0 "$pid" 2>/dev/null; then
        still="${still} ${pid}"
      fi
    done
    if [ -z "$still" ]; then
      return 0
    fi
    sleep 0.3
  done

  log "→ Processos resistentes:${still}. Forçando com SIGKILL."
  for pid in $still; do
    kill -9 "$pid" 2>/dev/null || true
  done
}

if ! command -v node >/dev/null 2>&1; then
  log "Node.js não encontrado. Instale o Node 20 ou superior e tente de novo."
  exit 1
fi

if [ ! -d node_modules ]; then
  log "→ Instalando dependências…"
  npm install
fi

case "$MODE" in
  dev|serve)
    free_port "$PORT"
    log "→ Eleventy em http://localhost:${PORT} (Ctrl+C para parar)"
    exec npx @11ty/eleventy --serve --port "$PORT"
    ;;
  build)
    log "→ Gerando build em _site/…"
    npm run build
    ;;
  *)
    log "Uso: ./run.sh [dev|build]"
    exit 1
    ;;
esac
