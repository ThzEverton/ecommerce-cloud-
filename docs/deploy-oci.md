# Deploy na OCI

## VM, Nginx e PM2

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install nodejs npm nginx git ufw netfilter-persistent -y

sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable

sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT
sudo netfilter-persistent save
```

## Projeto

```bash
cd ~/ecommerce-cloud-
rm -rf node_modules
rm -f package-lock.json
npm install
cp .env.example .env
nano .env
npm start
```

## Nginx

```nginx
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo nginx -t
sudo systemctl restart nginx
```

## PM2

```bash
sudo npm install -g pm2
pm2 start npm --name ecommerce -- start
pm2 start workers/emailConsumer.js --name email-consumer
pm2 save
```
