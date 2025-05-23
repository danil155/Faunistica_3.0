from jose import jwt, JWTError, ExpiredSignatureError
from fastapi import Request, HTTPException, status
from datetime import datetime, timedelta, UTC
import logging

from config.config import ACCESS_TOKEN_EXPIRE, REFRESH_TOKEN_EXPIRE, PRIVATE_KEY, PUBLIC_KEY, ALGORITHM

logger = logging.getLogger(__name__)


def create_access_token(data: dict) -> str:
    expires = datetime.now(UTC) + timedelta(seconds=ACCESS_TOKEN_EXPIRE)
    data.update({'exp': expires, 'type': 'access'})
    return jwt.encode(data, PRIVATE_KEY, algorithm=ALGORITHM)


def create_refresh_token(data: dict) -> str:
    expires = datetime.now(UTC) + timedelta(seconds=REFRESH_TOKEN_EXPIRE)
    data.update({'exp': expires, 'type': 'refresh'})
    return jwt.encode(data, PRIVATE_KEY, algorithm=ALGORITHM)


def verify_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, PUBLIC_KEY, algorithms=[ALGORITHM])
        return payload
    except ExpiredSignatureError:
        logger.warning('Token expired')
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail='Token expired'
        )
    except JWTError:
        logger.warning('Invalid token')
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail='Invalid token'
        )


def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        logger.warning('Missing access token')
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Missing access token")
    payload = verify_token(token)
    if payload.get("type") != "access":
        logger.warning('Invalid token type')
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid token type")
    return payload
