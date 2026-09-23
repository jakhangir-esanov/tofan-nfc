# NFC saytni serverga chiqarish

Backend `DEPLOYMENT.md` (Hetzner, Docker Swarm, `tofan-net`, tashqi nginx + Let's Encrypt) davomi.
Bu yerda faqat NFC saytga tegishli qadamlar. Manzil namunasi: `https://nfc.157.90.117.20.sslip.io` —
backend `tofan.env` dagi `NFC_BASE_URL` bilan **aynan bir xil** bo'lishi shart: chipga yoziladigan havola
shundan yasaladi.

## Tuzilma

```
Telefon (NFC chip) / brauzer
   |  https://nfc.157.90.117.20.sslip.io/t/<token>
   v
[ tashqi nginx ]  TLS, 50-nfc.conf
   |
   v
[ tofan-nfc:4000 ]  node:24-slim, Angular SSR (uz, ru, en)
   |-- /, /ru/, /en/ -> SSR sahifalar va statik fayllar
   |-- /api/...      -> http://tofan-api:8080/... (src/api-proxy.ts, prefiks olib tashlanadi)
   |-- /healthz      -> 200 ok
```

Sayt `apiBaseUrl: '/api'` bilan yig'iladi va API'ga o'z domeni orqali murojaat qiladi, shuning uchun
**CORS kerak emas**. API manzili image ichiga yozilmaydi.

## Image

| Fayl                | Vazifasi                                                                  |
| ------------------- | ------------------------------------------------------------------------- |
| `Dockerfile`        | `node:24-slim` da `npm ci` + `npm run build` (uch til), keyin faqat `dist` |
| `.dockerignore`     | `node_modules`, `dist`, `.git`, hujjatlar va lokal `ssr.env` ni chiqaradi  |
| `src/server.ts`     | Express + `AngularNodeAppEngine`, `/healthz`                               |
| `src/api-proxy.ts`  | `API_PROXY_TARGET` berilganda `/api` ni backend'ga uzatadi                 |

Server bundle'i o'zi yetarli: runtime image'da `node_modules` yo'q. Server `node` foydalanuvchisi
bilan ishlaydi.

Muhit o'zgaruvchilari:

| O'zgaruvchi        | Standart                | Vazifasi                                                                 |
| ------------------ | ----------------------- | ------------------------------------------------------------------------ |
| `NG_ALLOWED_HOSTS` | — (**majburiy**)        | SSR qabul qiladigan domen(lar), vergul bilan. Bo'lmasa har so'rov `400`  |
| `API_PROXY_TARGET` | `http://tofan-api:8080` | `/api` so'rovlari uzatiladigan backend                                   |
| `PORT`             | `4000`                  | Server porti                                                             |

`NG_ALLOWED_HOSTS` — Angular SSR'ning SSRF himoyasi: `Host` (va `X-Forwarded-Host`) ro'yxatda bo'lmasa
server `400 Bad Request` qaytaradi va logga `Header "host" ... is not allowed` yozadi. `angular.json`
dagi `allowedHosts` faqat lokal manzillarni sanaydi; production domeni env orqali beriladi.

Yig'ish va yuklash (o'z kompyuteringizda, repo papkasida):

```bash
docker build -t ejakhangir/tofan-nfc:v1.0 .
docker push ejakhangir/tofan-nfc:v1.0
```

Lokal tekshirish:

```bash
docker run --rm -p 4200:4000 -e NG_ALLOWED_HOSTS=localhost -e API_PROXY_TARGET=http://host.docker.internal:5179 ejakhangir/tofan-nfc:v1.0
```

## Serverda

### 1. Env

`/opt/tofan/env/tofan.env` ga qo'shing:

```bash
TOFAN_NFC_IMAGE=ejakhangir/tofan-nfc:v1.0
NFC_HOST=nfc.157.90.117.20.sslip.io
```

`NFC_BASE_URL` allaqachon bor (`https://${NFC_HOST}` bilan bir xil bo'lsin).

### 2. Stack fayli

`/opt/tofan/stacks/nfc.yml`:

```yaml
services:
  tofan-nfc:
    image: ${TOFAN_NFC_IMAGE}
    environment:
      NG_ALLOWED_HOSTS: ${NFC_HOST}
      API_PROXY_TARGET: http://tofan-api:8080
    networks:
      - tofan-net
    deploy:
      replicas: 1
      update_config:
        order: start-first
        failure_action: rollback
      restart_policy:
        condition: any
      resources:
        limits:
          memory: 256M

networks:
  tofan-net:
    external: true
```

```bash
cd /opt/tofan && set -a && . env/tofan.env && set +a \
  && docker stack deploy --with-registry-auth -c stacks/nfc.yml tofan
```

### 3. Sertifikat

Mavjud sertifikatga yangi nomni qo'shish (`--expand`, barcha eski nomlar ham qayta sanab o'tiladi):

```bash
docker run --rm \
  -v /opt/tofan/certbot/letsencrypt:/etc/letsencrypt \
  -v /opt/tofan/certbot/www:/var/www/certbot \
  certbot/certbot certonly --webroot -w /var/www/certbot --expand \
  -d api.157.90.117.20.sslip.io \
  -d id.157.90.117.20.sslip.io \
  -d portainer.157.90.117.20.sslip.io \
  -d pgadmin.157.90.117.20.sslip.io \
  -d admin.157.90.117.20.sslip.io \
  -d nfc.157.90.117.20.sslip.io
```

### 4. Tashqi nginx

`/opt/tofan/nginx/conf.d/50-nfc.conf`:

```nginx
server {
    listen 443 ssl;
    http2 on;
    server_name nfc.157.90.117.20.sslip.io;

    ssl_certificate     /etc/letsencrypt/live/api.157.90.117.20.sslip.io/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.157.90.117.20.sslip.io/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;

    client_max_body_size 1m;

    add_header Strict-Transport-Security "max-age=31536000" always;

    resolver 127.0.0.11 valid=10s;
    set $nfc http://tofan-nfc:4000;

    location / {
        include /etc/nginx/conf.d/proxy_params.inc;
        proxy_pass $nfc;
    }
}
```

`proxy_params.inc` `Host` va `X-Forwarded-Host` ni `$host` qilib yuboradi — ikkalasi ham
`NG_ALLOWED_HOSTS` dagi domen bilan mos kelishi kerak.

```bash
docker exec $(docker ps -qf name=tofan_nginx) nginx -t
docker service update --force tofan_nginx
```

### 5. Tekshirish

```bash
curl -s https://nfc.157.90.117.20.sslip.io/healthz
curl -s -o /dev/null -w "%{http_code}\n" https://nfc.157.90.117.20.sslip.io/
curl -s -o /dev/null -w "%{http_code}\n" https://nfc.157.90.117.20.sslip.io/ru/
curl -s -o /dev/null -w "%{http_code}\n" https://nfc.157.90.117.20.sslip.io/api/garments/by-token/unknown
```

Kutilgan natija: `ok`, `200`, `200`, `200` (noma'lum token `Invalid` holati bilan `200` qaytaradi).
Keyin admin paneldan futbolka yarating va uning havolasini telefonda oching.
