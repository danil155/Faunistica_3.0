import asyncio
import logging
from logging.handlers import TimedRotatingFileHandler
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi.middleware import SlowAPIMiddleware

from back_api import users, info, records, gen_stats, refresh_token, check_auth, logout, suggest_taxon, autofill_taxon, get_publ, support, pers_stats, user_image, get_localion, get_records_file, get_record, del_record, edit_record
from back_api.rate_limiter import rate_limit_handler, RateLimitExceeded, limiter
from bot.bot_main import bot_start
from config.config import LOGS_DIR

logs_dir = LOGS_DIR
logs_dir.mkdir(exist_ok=True)

log_format = "%(asctime)s %(levelname)s [%(filename)s:%(lineno)d] %(message)s"


def only_warning(record):
    return record.levelno == logging.WARNING


main_handler = TimedRotatingFileHandler(
    filename=logs_dir / "service.log",
    when='midnight',
    backupCount=30,
    encoding='utf-8'
)
main_handler.setLevel(logging.WARNING)
main_handler.addFilter(only_warning)
main_handler.setFormatter(logging.Formatter(log_format))

error_handler = TimedRotatingFileHandler(
    filename=logs_dir / "errors.log",
    when='midnight',
    backupCount=90,
    encoding='utf-8'
)
error_handler.setLevel(logging.ERROR)
error_handler.setFormatter(logging.Formatter(log_format))

logging.basicConfig(
    level=logging.WARNING,
    handlers=[main_handler, error_handler],
    format=log_format,
    force=True
)

with open('requirements.txt', 'r', encoding='utf-8') as file:
    lib_names = file.read().strip().split('\n')

for lib_name in lib_names:
    lib_logger = logging.getLogger(lib_name)
    if lib_name == 'aiogram':
        lib_logger.setLevel(logging.CRITICAL)
    else:
        lib_logger.setLevel(logging.WARNING)
    lib_logger.addHandler(main_handler)
    lib_logger.addHandler(error_handler)
    lib_logger.propagate = False


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
    allow_origins=['http://localhost:3000'],    # Replace to origins later on
    allow_credentials=True,
    allow_methods=['GET', 'POST', 'PUT', 'DELETE'],
    allow_headers=["*"],
    expose_headers=["set-cookie", "Content-Disposition"]
)

app.add_exception_handler(RateLimitExceeded, rate_limit_handler)

app.include_router(users.router, prefix="/api")
app.include_router(info.router, prefix="/api")
app.include_router(records.router, prefix="/api")
app.include_router(gen_stats.router, prefix="/api")
app.include_router(refresh_token.router, prefix="/api")
app.include_router(check_auth.router, prefix="/api")
app.include_router(logout.router, prefix="/api")
app.include_router(suggest_taxon.router, prefix="/api")
app.include_router(autofill_taxon.router, prefix="/api")
app.include_router(get_publ.router, prefix="/api")
app.include_router(support.router, prefix="/api")
app.include_router(pers_stats.router, prefix="/api")
app.include_router(user_image.router, prefix="/api")
app.include_router(get_localion.router, prefix="/api")
app.include_router(get_records_file.router, prefix="/api")
app.include_router(get_record.router, prefix="/api")
app.include_router(del_record.router, prefix="/api")
app.include_router(edit_record.router, prefix="/api")

if __name__ == '__main__':
    asyncio.run(bot_start())
