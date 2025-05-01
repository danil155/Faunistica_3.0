from jose import jwt, JWTError, ExpiredSignatureError
from fastapi import Request, HTTPException, status
from config.config import ACCESS_TOKEN_EXPIRE, REFRESH_TOKEN_EXPIRE, PRIVATE_KEY, PUBLIC_KEY, ALGORITHM
from datetime import datetime, timedelta, UTC


def create_access_token(data: dict) -> str:
    expires = datetime.now(UTC) + timedelta(minutes=ACCESS_TOKEN_EXPIRE)
    data.update({'exp': expires, 'type': 'access'})
    return jwt.encode(data, PRIVATE_KEY, algorithm=ALGORITHM)


def create_refresh_token(data: dict) -> str:
    expires = datetime.now(UTC) + timedelta(minutes=REFRESH_TOKEN_EXPIRE)
    data.update({'exp': expires, 'type': 'refresh'})
    return jwt.encode(data, PRIVATE_KEY, algorithm=ALGORITHM)


def verify_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, PUBLIC_KEY, algorithms=[ALGORITHM])
        return payload
    except ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail='Token expired'
        )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail='Invalid token'
        )


def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing access token")
    payload = verify_token(token)
    if payload.get("type") != "access":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token type")
    return payload
