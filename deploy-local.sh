#!/usr/bin/env bash
# Deploy manual de viman.cl/prueba desde tu Mac.
# Requiere: lftp  ->  brew install lftp
# Credenciales: crea un archivo .env.deploy (NO se sube a git) con:
#   FTP_HOST=...
#   FTP_USERNAME=...
#   FTP_PASSWORD=...
set -euo pipefail
cd "$(dirname "$0")"

[ -f .env.deploy ] || { echo "Falta .env.deploy (ver cabecera de este script)"; exit 1; }
set -a; . ./.env.deploy; set +a

echo "==> Compilando..."
ASTRO_BASE=/prueba \
WORDPRESS_API_URL=https://viman.cl/admin/wp-json/wp/v2 \
npm run build

echo "==> Subiendo a ${FTP_HOST}:/prueba ..."
lftp -u "$FTP_USERNAME","$FTP_PASSWORD" "$FTP_HOST" <<'LFTP'
set ssl:verify-certificate no
set ftp:ssl-allow yes
set ftp:ssl-force no
set ftp:passive-mode yes
set net:max-retries 2
set net:timeout 30
set mirror:parallel-transfer-count 1
mirror -R --delete --verbose=1 dist/ prueba/
bye
LFTP

echo "==> Listo: https://viman.cl/prueba/"
