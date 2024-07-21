## NGINX Configuration for NestJS Applications

This outlines the NGINX configuration used for routing traffic to our NestJS applications deployed on different ports and subdomains.

**Configuration Breakdown:**

The provided NGINX configuration defines four server blocks:

**1. Production Server (api-nestjs.boilerplate.hng.tech:443)**

```nginx
server {
    server_name api-nestjs.boilerplate.hng.tech;

    access_log /var/log/nginx/access.log;
    error_log /var/log/nginx/error.log;

    location / {
        proxy_pass http://localhost:3007;
    }

    listen 443 ssl;
    ssl_certificate /etc/letsencrypt/live/api-nestjs.boilerplate.hng.tech/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api-nestjs.boilerplate.hng.tech/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
}
```

- This block handles HTTPS traffic for the main application domain `api-nestjs.boilerplate.hng.tech`.
- It listens on port 443 (default HTTPS port).
- Traffic is forwarded to the NestJS application running on `http://localhost:3007` using `proxy_pass`.
- SSL is enabled using certificates obtained from Let's Encrypt.

**2. Deployment Server (deployment.api-nestjs.boilerplate.hng.tech:443)**

```nginx
server {
    listen 443 ssl;
    server_name deployment.api-nestjs.boilerplate.hng.tech;

    ssl_certificate /etc/letsencrypt/live/deployment.api-nestjs.boilerplate.hng.tech/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/deployment.api-nestjs.boilerplate.hng.tech/privkey.pem;

    access_log /var/log/nginx/access.log;
    error_log /var/log/nginx/error.log;

    location / {
        proxy_pass http://localhost:3008;
    }
}
```

- This block handles HTTPS traffic for the subdomain `deployment.api-nestjs.boilerplate.hng.tech`, likely used for a deployment preview environment.
- Traffic is forwarded to the application instance running on `http://localhost:3008`.
- Similar to the production server, SSL is enabled with Let's Encrypt certificates.

**3. Staging Server (staging.api-nestjs.boilerplate.hng.tech:443)**

```nginx
server {
    listen 443 ssl;
    server_name staging.api-nestjs.boilerplate.hng.tech;

    ssl_certificate /etc/letsencrypt/live/staging.api-nestjs.boilerplate.hng.tech/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/staging.api-nestjs.boilerplate.hng.tech/privkey.pem;

    access_log /var/log/nginx/access.log;
    error_log /var/log/nginx/error.log;

    location / {
        proxy_pass http://localhost:3009;
    }
}
```

- This block handles HTTPS traffic for the subdomain `staging.api-nestjs.boilerplate.hng.tech`, likely used for a staging environment.
- Traffic is forwarded to the application instance running on `http://localhost:3009`.
- SSL is enabled using Let's Encrypt certificates.

**4. HTTP Redirection Server (port 80)**

```nginx
server {
    listen 80;
    server_name api-nestjs.boilerplate.hng.tech staging.api-nestjs.boilerplate.hng.tech deployment.api-nestjs.boilerplate.hng.tech;

    location /.well-known/acme-challenge/ {
        allow all;
        root /var/www/certbot;
    }

    location / {
        return 301 https://$host$request_uri;
    }
}
```

- This block listens on port 80 (default HTTP port) for all defined server names.
- It handles two types of requests:
  - Requests for the Let's Encrypt ACME challenge used for certificate renewal are allowed and served from `/var/www/certbot`.
  - All other requests are redirected to their HTTPS equivalent using a 301 redirect (`return 301 https://$host$request_uri;`).
