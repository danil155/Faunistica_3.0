import logging
import asyncio
from fastapi import FastAPI
from back_api import users, info, records, gen_stats, refresh_token
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address
from bot.bot_main import bot_start


logging.basicConfig(
    level=logging.INFO,
    filename='service_log.log', filemode='w',
    format="%(asctime)s %(levelname)s %(filename)s:%(lineno)d %(funcName)s() %(message)s",
    force=True
)

app = FastAPI()

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.include_router(users.router, prefix="/api")
app.include_router(info.router, prefix="/api")
app.include_router(records.router, prefix="/api")
app.include_router(gen_stats.router, prefix="/api")
app.include_router(refresh_token.router, prefix="/api")

if __name__ == '__main__':
    asyncio.run(bot_start())
