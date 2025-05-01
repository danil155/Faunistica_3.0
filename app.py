import logging
import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi.middleware import SlowAPIMiddleware

from back_api import users, info, records, gen_stats, refresh_token, check_auth
from bot.bot_main import bot_start
from back_api.rate_limiter import rate_limit_handler, RateLimitExceeded, limiter


logging.basicConfig(
    level=logging.INFO,
    filename='service_log.log', filemode='w',
    format="%(asctime)s %(levelname)s %(filename)s:%(lineno)d %(funcName)s() %(message)s",
    force=True
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    asyncio.create_task(bot_start())
    yield

app = FastAPI(lifespan=lifespan)

app.state.limiter = limiter
app.add_middleware(SlowAPIMiddleware)

origins = [
    "http://localhost:3000",
    "https://faunistica.ru",
    "https://faunistica.online"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=['http://localhost:3000'],
    allow_credentials=True,
    allow_methods=['GET', 'POST', 'PUT', 'DELETE'],
    allow_headers=["*"],
    expose_headers=["set-cookie"]
)

app.add_exception_handler(RateLimitExceeded, rate_limit_handler)

app.include_router(users.router, prefix="/api")
app.include_router(info.router, prefix="/api")
app.include_router(records.router, prefix="/api")
app.include_router(gen_stats.router, prefix="/api")
app.include_router(refresh_token.router, prefix="/api")
app.include_router(check_auth.router, prefix="/api")

if __name__ == '__main__':
    asyncio.run(bot_start())
