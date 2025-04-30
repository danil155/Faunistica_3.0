import asyncio
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi.middleware import SlowAPIMiddleware

from back_api import users, info, records, gen_stats, refresh_token
from back_api.rate_limiter import rate_limit_handler, RateLimitExceeded, limiter
from bot.bot_main import bot_start

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
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_exception_handler(RateLimitExceeded, rate_limit_handler)

app.include_router(users.router, prefix="/api")
app.include_router(info.router, prefix="/api")
app.include_router(records.router, prefix="/api")
app.include_router(gen_stats.router, prefix="/api")
app.include_router(refresh_token.router, prefix="/api")
