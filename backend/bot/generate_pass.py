import secrets
import string
from random import randint


def generate_secure_password():
    alphabet = string.ascii_letters + string.digits + string.punctuation
    password = ''.join(secrets.choice(alphabet) for _ in range(randint(14, 20)))
    return password
