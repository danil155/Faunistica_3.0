# Проект Faunistica_3.0

Проект предназначен для доработки сервиса [Faunistica 2.0](https://sozontov.cc/faunistica_2.0/).

## Функционал

«Faunistica 3.0»: Система обработки научных литературных источников и регистрации на этой основе данных о находках пауков.  
Программа предназначена для извлечения и структурирования данных из научных публикаций, содержащих упоминания о находках экземпляров пауков, и последующего формирования стандартизированной базы данных. Она ориентирована на использование биологами-исследователями и волонтерами для систематизации сведений об распространении пауков, что способствует углубленному изучению экологии и биогеографии.

## Инструкция по запуску backend

###Подготовка:

Перед запуском в корневой папке backend-a необходимо создать файл ".env", в котором будет находится переменное окружение для будущей работы проекта.

Заполнение ".env":
```
BOT_TOKEN = *YOUR_BOT_TOKEN* #Токен вашего чат-бота в Telegram
ADMIN_CHAT_ID = *YOUR_ADMIN_CHAT_ID* #ID телеграм-чата, в котором находится администрация тех.поддержки

# Данные необходимые для базы данных PostgreSQL
DB_NAME = *YOUR_DB_NAME* 
DB_HOST = *YOUR_DB_HOST*
DB_PORT = *YOUR_DB_PORT*
DB_USER = *YOUR_DB_USER*
DB_PASSWORD = *YOUR_DB_PASSWORD*

POSTGRES_USER = *YOUR_POSTGRES_USER*
POSTGRES_PASS = *YOUR_POSTGRES_PASS*
PGADMIN_DEFAULT_EMAIL = *YOUR_PGADMIN_DEFAULT_EMAIL*
PGADMIN_DEFAULT_PASSWORD=*YOUR_PGADMIN_DEFAULT_PASSWORD*

# Ключи для генерации JWT токенов
PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
*private key here*
-----END PRIVATE KEY-----"

PUBLIC_KEY="-----BEGIN PUBLIC KEY-----
*public key here*
-----END PUBLIC KEY-----"

ALGORITHM = *YOUR_ALGORITHM* #Название алгоритма для генерации JWT токенов
ACCESS_TOKEN_EXPIRE = *YOUR_ACCESS_TOKEN_EXPIRE* #Время жизни ACCESS токена в МИНУТАХ (лучше устанавливать число в диапозоне от 15 до 30)
REFRESH_TOKEN_EXPIRE = *YOUR_REFRESH_TOKEN_EXPIRE* #Время жизни REFRESH токена в МИНУТАХ (лучше устанавливать число в диапозоне от 7 до 30)
```

Далее нужно создать файл "hash.py" в директории "../database/hash.py", который будет хэшировать данные:
```python
'''

Ваш метод хэширования

'''

def register_user(user_pass):
    db_hash = ph.hash(user_pass)
    return db_hash


def check_pass(user_pass, db_hash):
    try:
        ph.verify(db_hash, user_pass)
        return True
    except VerifyMismatchError:
        return False
```
> Подробнее о JWT токенах и алгоритмах можно прочитать [здесь](https://pyjwt.readthedocs.io/en/latest/usage.html)
---

**Запуск:**

> Убедитесь, что у вас установлен Docker и Docker Compose.
> Если нет, то [здесь](https://docs.docker.com/compose/install/) ссылка на скачивание.

В корневой папке backend через терминал прописываем:
`docker-compose up -d --build`

---

>Если у вас не появились ошибки в терминале, создалась база данных в PGadmin и чат-бот в Telegram функционируте, то поздравляю! Полдела сделано, backend запущен!

## Инструкция по запуску frontend-a

> Перед началом убедитесь, что у вас установлен Node.js, если нет, то его можно установить [здесь](https://nodejs.org/en/download).

## Локальный запуск

В корневой папке frontend через терминал прописываем:

`npm install`

`npm start`

Если в вашем браузере открылся сайт, то вы мощно потрудились и запустили frontend!

## Запуск на сервере

> Убедитесь, что у вас установлен nginx
> Если нет, прочитать о нем и установить его можно [здесь](https://nginx.org/)

В корневой папке frontend через терминал прописываем:

`npm install`

`npm run build`

Далее перенесите содержимое папки build на сервер.
После создайте конфигурационный файл nginx:
```
server {
    listen 80;
    server_name faunistica.ru;
    return 301 https://$host$request_uri; #Редирект на HTTPS
}

server {
    listen 443 ssl;
    server_name *YOUR_DOMEN*; /

    # SSL сертификаты
    ssl_certificate     /..;
    ssl_certificate_key /..;

    # Настройки SSL
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;

    # Корневая директория фронтенда
    root /var/www/frontend;
    index index.html;

    # Обработка статики фронтенда
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Проксирование API на бэкенд
    location /api/ {
        proxy_pass http:// YOUR_BACKEND_API_PORT;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Для WebSocket (если используется)
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    # Кэширование статики
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        access_log off;
        add_header Cache-Control "public";
    }
}
```

После сохранения перезапустите nginx и если все сделано правильно, то в браузере откроется сайт - победа!

---

Команда Rock & Stone, 2025

---

Здесь могла быть ваша реклама :)
