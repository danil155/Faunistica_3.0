import asyncio
import logging
from aiogram import Bot, Dispatcher
from aiogram.fsm.storage.memory import MemoryStorage
from aiogram.methods import DeleteWebhook
from aiogram.exceptions import TelegramAPIError

from config import config
from database.database import init_db, get_session
from bot.handlers import Handlers

logger = logging.getLogger(__name__)

bot_instance = None


async def bot_start() -> None:
    global bot_instance
    try:
        bot = Bot(token=config.TEST_BOT_TOKEN)
        bot_instance = bot

        dp = Dispatcher(storage=MemoryStorage())

        # Initialize database
        try:
            await init_db()
        except Exception as db_error:
            logger.error(f'Database initialization failed: {db_error}', exc_info=True)
            raise

        # Initialize handlers
        handlers = Handlers(bot, get_session)
        dp.include_router(handlers.router)

        try:
            await bot(DeleteWebhook(drop_pending_updates=True))
            await dp.start_polling(bot)
        except TelegramAPIError as api_error:
            logger.error(f'Telegram API error: {api_error}', exc_info=True)
            raise
        except Exception as polling_error:
            logger.error(f'Polling failed: {polling_error}', exc_info=True)
            raise
        finally:
            await bot.session.close()
    except Exception as global_error:
        logger.critical(f' Bot crashed: {global_error}', exc_info=True)
        raise
    finally:
        if bot_instance:
            await bot_instance.session.close()


def get_bot_instance() -> Bot:
    if not bot_instance:
        logger.warning('Bot instance requested but not initialized yet')

    return bot_instance


if __name__ == '__main__':
    asyncio.run(bot_start())
