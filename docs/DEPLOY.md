# Production Deployment Guide

This guide details the step-by-step procedure to deploy the Hono API template (`be-kilex-mituni`) on a production Linux server (Ubuntu/Debian) using **PM2**, **Nginx**, **MySQL**, and **Let's Encrypt SSL**.

---

## 📋 Prerequisites

Before proceeding, ensure the following are installed on your production server:
1.  **Node.js** (v18.x or v20.x recommended) & **NPM**
2.  **MySQL Server** (v8.0+)
3.  **PM2** (Process Manager for Node.js: `npm install -g pm2`)
4.  **Nginx**
5.  **Certbot** (For Let's Encrypt SSL: `sudo apt install certbot python3-certbot-nginx`)

---

## 🛠️ Step-by-Step Deployment

### 1. Project Directory & Upload
Clone or upload the repository to the production directory. The standard directory configuration mapped in the configuration files is:
```bash
/srv/www/node/kilex-api.mituni.id/be-kilex-mituni
```

Set up folder permissions:
```bash
sudo mkdir -p /srv/www/node/kilex-api.mituni.id/be-kilex-mituni
sudo chown -R $USER:$USER /srv/www/node/kilex-api.mituni.id/be-kilex-mituni
```

---

### 2. Configure Environment Variables
Inside the folder, copy the environment template to `.env.production`:
```bash
cp .env.example .env.production
```

Edit the `.env.production` file to set your production credentials:
```env
PORT=8000
NODE_ENV=production

# Better Auth Secret (Generate using: npx better-auth secret)
BETTER_AUTH_SECRET=generate-a-strong-32-char-secret-here
BETTER_AUTH_URL=https://kilex-api.mituni.id

# Google OAuth Credentials
GOOGLE_CLIENT_ID=prod_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=prod_google_client_secret

# Production MySQL DB Connection
DB_USER=root
DB_PASSWORD=your_production_password
DB_NAME=db_mituni_kilex
DB_HOST=127.0.0.1
DB_PORT=3306

# Production JWT Secret
JWT_SECRET=your_production_strong_jwt_signing_key
```

Make sure the `.env.production` file is protected and not accessible publicly.

---

### 3. Build the Application
Install dependencies and build the TypeScript codebase:
```bash
npm install
npm run build
```
This generates the production JavaScript build in the `./dist/` directory.

---

### 4. Database Setup & Seeding
Apply your Drizzle database migrations and seed the initial `ADMIN` user:
```bash
# Apply SQL migrations to the MySQL database
npm run db:migrate

# Seed the initial admin user (admin@kilex.com / adminpassword123)
npm run db:seed
```

---

### 5. PM2 Process Initialization
Initialize PM2 to run the compiled application in the background:
```bash
# Start the app using ecosystem config
pm2 start ecosystem.config.cjs

# Make PM2 restart the app automatically on server reboot
pm2 save
pm2 startup
```

To monitor the process:
```bash
pm2 status                  # Check status
pm2 logs be-kilex-mituni    # Monitor log output
pm2 restart be-kilex-mituni # Restart the application
```

---

### 6. Nginx Reverse Proxy Setup
Copy the `nginx.conf` file to Nginx's sites-available:
```bash
sudo cp nginx.conf /etc/nginx/sites-available/kilex-api.mituni.id
```

Enable the configuration by creating a symbolic link to sites-enabled:
```bash
sudo ln -s /etc/nginx/sites-available/kilex-api.mituni.id /etc/nginx/sites-enabled/
```

Verify Nginx syntax and reload the server:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

### 7. Provision SSL Certificate
Obtain a free SSL certificate from Let's Encrypt using Certbot:
```bash
sudo certbot --nginx -d kilex-api.mituni.id
```
Select the option to automatically redirect all HTTP traffic to HTTPS.

---

## 📈 Common Maintenance Commands

*   **View API Logs:** `pm2 logs be-kilex-mituni`
*   **Check Nginx Status:** `sudo systemctl status nginx`
*   **Renew SSL Certificate:** SSL certificates renew automatically, but you can force renew using: `sudo certbot renew --dry-run`
*   **Restart Server:** `pm2 restart be-kilex-mituni`
