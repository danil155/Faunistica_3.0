import os
from dotenv import load_dotenv, find_dotenv

load_dotenv(find_dotenv())

BOT_TOKEN = os.getenv('BOT_TOKEN')

ADMIN_CHAT_ID = os.getenv('ADMIN_CHAT_ID')

DB_NAME = os.getenv('DB_NAME')

DB_HOST = os.getenv('DB_HOST')

DB_PORT = os.getenv('DB_PORT')

DB_USER = os.getenv('DB_USER')

DB_PASSWORD = os.getenv('DB_PASSWORD')
