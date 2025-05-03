import os
from dotenv import load_dotenv, find_dotenv

load_dotenv(find_dotenv())

BOT_TOKEN = os.getenv('BOT_TOKEN')

TEST_BOT_TOKEN = os.getenv('TEST_BOT_TOKEN')

ADMIN_CHAT_ID = int(os.getenv('ADMIN_CHAT_ID'))

DB_NAME = os.getenv('DB_NAME')

DB_HOST = os.getenv('DB_HOST')

DB_PORT = os.getenv('DB_PORT')

DB_USER = os.getenv('DB_USER')

DB_PASSWORD = os.getenv('DB_PASSWORD')

PRIVATE_KEY = os.getenv('PRIVATE_KEY')

PUBLIC_KEY = os.getenv('PUBLIC_KEY')

ALGORITHM = os.getenv('ALGORITHM')

ACCESS_TOKEN_EXPIRE = int(os.getenv('ACCESS_TOKEN_EXPIRE'))

REFRESH_TOKEN_EXPIRE = int(os.getenv('REFRESH_TOKEN_EXPIRE'))
