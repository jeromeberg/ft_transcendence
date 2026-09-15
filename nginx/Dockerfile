FROM nginx:1.31.5-alpine3.24

RUN apk add --no-cache openssl

COPY conf/nginx.conf /etc/nginx/nginx.conf
COPY tools/generate_ssl.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 80 443

ENTRYPOINT ["/docker-entrypoint.sh"]
