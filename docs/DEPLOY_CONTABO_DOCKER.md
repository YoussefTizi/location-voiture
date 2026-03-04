# Deploy Contabo (Docker) sans casser le site existant

Ce guide déploie cette app en Docker sur un VPS qui héberge déjà un autre site.

## 1) Prérequis sur le VPS

```bash
sudo apt update
sudo apt install -y ca-certificates curl gnupg lsb-release nginx certbot python3-certbot-nginx

curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
sudo usermod -aG docker $USER
```

Reconnecte-toi en SSH après `usermod`.

## 2) Copier le projet

```bash
sudo mkdir -p /srv/drivestyle/site2
sudo chown -R $USER:$USER /srv/drivestyle
cd /srv/drivestyle/site2
git clone <TON_REPO_GIT> .
```

## 3) Créer le `.env` Docker (IMPORTANT)

```bash
cp .env.example .env
nano .env
```

Exemple de valeurs minimales:

```env
APP_PORT=3001
POSTGRES_USER=site2_user
POSTGRES_PASSWORD=change_me_strong_password
POSTGRES_DB=site2_db
DATABASE_URL="postgresql://site2_user:change_me_strong_password@postgres:5432/site2_db?schema=public"
ADMIN_SESSION_SECRET="mets_une_longue_valeur_random"
```

Note: dans Docker, l'hôte DB est `postgres` (pas `localhost`).

## 4) Lancer les conteneurs

```bash
cd /srv/drivestyle/site2
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml ps
```

Vérifier les logs:

```bash
docker compose -f docker-compose.prod.yml logs -f app
```

## 5) Nginx: ajouter un domaine vers ce conteneur

Créer le vhost:

```bash
sudo nano /etc/nginx/sites-available/site2.conf
```

Config:

```nginx
server {
    listen 80;
    server_name site2.com www.site2.com;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Activer le site:

```bash
sudo ln -s /etc/nginx/sites-available/site2.conf /etc/nginx/sites-enabled/site2.conf
sudo nginx -t
sudo systemctl reload nginx
```

## 6) SSL Let's Encrypt

```bash
sudo certbot --nginx -d site2.com -d www.site2.com
```

## 7) Mise à jour de l'app

```bash
cd /srv/drivestyle/site2
git pull
docker compose -f docker-compose.prod.yml up -d --build
```

## 8) Dupliquer pour un autre domaine

- Copie le projet dans un autre dossier (`/srv/drivestyle/site3`)
- Mets un autre `APP_PORT` (ex: `3002`)
- Mets des credentials DB différents (`POSTGRES_*`)
- Crée un nouveau vhost Nginx qui pointe vers `127.0.0.1:3002`

## Notes de sécurité

- Garde Nginx seul exposé sur `80/443`.
- Ne publie pas Postgres en public.
- Utilise des mots de passe forts pour `POSTGRES_PASSWORD`.
