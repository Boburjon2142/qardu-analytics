# Serverga yuklash — stat.qarshidu.uz

Bu qo'llanma QarDU Analytics'ni bitta Ubuntu serverga (Nginx + systemd + PostgreSQL, Docker'siz)
yuklash uchun. Barcha buyruqlar serverda `sudo` bilan bajariladi.

```text
Internet ──HTTPS──> Nginx :443 ──/api/──> gunicorn (Django)  127.0.0.1:8100 ──> PostgreSQL
                                 └──/────> Next.js standalone 127.0.0.1:3100
```

| Fayl | Vazifasi |
|---|---|
| `scripts/server-setup.sh` | Bir martalik: paketlar, `qardu` foydalanuvchisi, kataloglar, DB roli va bazasi, systemd |
| `scripts/obtain-cert.sh` | Let's Encrypt sertifikati va to'liq Nginx sayti |
| `scripts/deploy.sh` | Har bir yangilanish: build, tekshiruv, backup, migratsiya, almashtirish, health-check |
| `scripts/rollback.sh` | Oldingi relizga qaytish (faqat kod) |
| `scripts/manage.sh` | Serverda `manage.py` buyruqlari (foydalanuvchi yaratish, rol berish) |
| `nginx/stat.qarshidu.uz.conf` | HTTPS, xavfsizlik sarlavhalari, login rate-limit |
| `systemd/*.service` | API va web xizmatlari |
| `api.env.example` | `/etc/qardu/api.env` namunasi (sirlarsiz) |

## 0. Talablar

- Ubuntu 22.04/24.04, Python ≥ 3.12, Node.js ≥ 20 (tavsiya 24 LTS), 2 GB+ RAM (Next build uchun).
- DNS: `stat.qarshidu.uz` uchun **A yozuvi** server IP manziliga yo'naltirilgan (tekshirish:
  `dig +short stat.qarshidu.uz`).
- Firewall: 80 va 443 portlar ochiq; 8100, 3100 va 5432 tashqariga **ochilmaydi**.
- Serverda GitHub repozitoriyasiga o'qish huquqi (repo private bo'lsa — deploy key).
- Yuklanadigan kod GitHub'ga push qilingan bo'lishi kerak: `deploy.sh` `origin/main` ni oladi.

## 1. Birinchi o'rnatish (bir marta)

```bash
# 1) Kodni olish
sudo git clone https://github.com/Boburjon2142/qardu-analytics.git /var/www/qardu/src
cd /var/www/qardu/src

# 2) Tizimni tayyorlash. Birinchi ishga tushirishda /etc/qardu/api.env yaratadi va to'xtaydi.
sudo bash deploy/scripts/server-setup.sh

# 3) Sirlarni yaratib, api.env ichidagi har bir <generate> o'rniga qo'ying
python3 -c "import secrets; print(secrets.token_urlsafe(50))"   # DJANGO_SECRET_KEY uchun
python3 -c "import secrets; print(secrets.token_urlsafe(32))"   # POSTGRES_PASSWORD uchun
sudo nano /etc/qardu/api.env

# 4) Qayta ishga tushirish: DB roli/bazasi va systemd xizmatlari yaratiladi
sudo bash deploy/scripts/server-setup.sh

# 5) HTTPS sertifikati (email — sertifikat muddati haqida xabar olish uchun)
sudo bash deploy/scripts/obtain-cert.sh <admin-email>

# 6) Birinchi reliz
sudo bash deploy/scripts/deploy.sh
```

`deploy.sh` kutilmagan migratsiyalarni ko'rsatadi, avval `pg_dump` backup oladi va `y` tasdig'ingizni
so'raydi. Birinchi relizda barcha migratsiyalar qo'llanadi.

### Birinchi administrator

Ro'yxatdan o'tish yo'q, standart akkaunt ham yo'q:

```bash
sudo bash deploy/scripts/manage.sh createuser --email <email> --full-name "Ism Familiya"   # parol so'raladi
sudo bash deploy/scripts/manage.sh assignrole --email <email> --role tech_admin
```

Keyingi rollar ADMIN API orqali beriladi (`/api/v1/access/`).

## 2. Tekshirish

```bash
curl -fsS https://stat.qarshidu.uz/api/v1/health/        # {"status":"ok"}
curl -fsS https://stat.qarshidu.uz/api/v1/health/ready/  # DB bilan aloqa
curl -fsS https://stat.qarshidu.uz/api/v1/version/
curl -sI  https://stat.qarshidu.uz/ | grep -iE 'strict-transport|content-security'
systemctl status qardu-api qardu-web --no-pager
sudo certbot renew --dry-run
```

## 3. Yangilash va orqaga qaytish

```bash
cd /var/www/qardu/src
sudo bash deploy/scripts/deploy.sh               # origin/main
sudo bash deploy/scripts/deploy.sh <commit|tag>  # aniq versiya
sudo bash deploy/scripts/rollback.sh             # oldingi relizga
```

- Har bir reliz `/var/www/qardu/releases/<sana>-<commit>` papkasida saqlanadi (oxirgi 5 tasi).
  `current` havolasi esa faol relizni ko'rsatadi.
- Agar yangi reliz health-check'dan o'tmasa, kod **avtomatik** oldingi relizga qaytadi.
- **Migratsiyalar avtomatik qaytarilmaydi.** Zarur bo'lsa, `/var/backups/qardu/predeploy-*.dump`
  dan tiklang (`pg_restore --clean -d qardu_analytics <fayl>`). Bunda backup'dan keyin kiritilgan
  ma'lumotlar yo'qoladi, shuning uchun avval staging'da sinab ko'ring.
- Loglar: `journalctl -u qardu-api -u qardu-web -f`, Nginx uchun esa `/var/log/nginx/`.

## 4. Eski IP sozlamasidan o'tish

Avval `213.230.96.104` IP manzili orqali HTTP bilan ishlagan bo'lsa:

1. `sudo rm /etc/nginx/sites-enabled/qardu-ip.conf && sudo nginx -t && sudo systemctl reload nginx`.
   Production sozlamalari faqat HTTPS va `stat.qarshidu.uz` hostini qabul qiladi, shuning uchun
   IP orqali kirish ishlamaydi.
2. Eski `/var/www/qardu/api.env` ni `/etc/qardu/api.env` ga ko'chiring va yangi namunaga moslang:
   `DJANGO_SETTINGS_MODULE=config.settings.production`, domen va `https://` origin.
   Keyin eskisini o'chiring.
3. Eski `/var/www/qardu/api` va `/var/www/qardu/web` papkalarini birinchi muvaffaqiyatli
   `deploy.sh` dan keyin o'chirish mumkin. Mavjud DB va ma'lumotlar saqlanib qoladi.

## 5. Xavfsizlik bo'yicha eslatmalar

- `/etc/qardu/api.env` (`root:qardu`, 640) va `/var/backups/qardu` (700) Git'ga kirmaydi.
  Ularni hech kimga yubormang.
- Kod `qardu` xizmat foydalanuvchisi uchun faqat o'qish uchun ochiq. Xizmatlar faqat
  `127.0.0.1` da tinglaydi.
- HSTS 1 kundan boshlanadi. HTTPS bir necha hafta barqaror ishlagach, uni
  `nginx/stat.qarshidu.uz.conf` da `31536000` ga oshiring.
- Saytda hozir **mock (sinov) ma'lumotlar** ko'rsatiladi. `X-Robots-Tag: noindex` yoqilgan.
  Haqiqiy ma'lumot bo'lmaguncha saytni parol bilan yopish uchun conf'dagi `auth_basic`
  qatorlarini oching (`sudo htpasswd -c /etc/nginx/qardu.htpasswd <login>`, `apache2-utils`
  paketi kerak).
