#!/bin/sh
set -e

SSL_DIR="/etc/nginx/ssl"
DOMAIN=${DOMAIN:-localhost}

if [ ! -f "$SSL_DIR/cert.pem" ]; then
    echo "Generating SSL certificate for ${DOMAIN}..."

    mkdir -p "$SSL_DIR"

    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout "$SSL_DIR/key.pem" \
        -out "$SSL_DIR/cert.pem" \
        -subj "/C=FR/ST=IDF/L=Paris/O=42/CN=${DOMAIN}" \
        -addext "subjectAltName=DNS:${DOMAIN},DNS:localhost,IP:127.0.0.1"

    echo "SSL certificate generated."
fi

echo "Starting Nginx..."
exec nginx -g 'daemon off;'
