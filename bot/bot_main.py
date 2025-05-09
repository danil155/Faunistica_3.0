import asyncio
from aiogram import Bot, Dispatcher
from aiogram.fsm.storage.memory import MemoryStorage
from aiogram.methods import DeleteWebhook

from config import config
from database.database import init_db, get_session
from bot.handlers import Handlers

bot_instance = None


async def bot_start():
    global bot_instance
    bot = Bot(token=config.BOT_TOKEN)
    bot_instance = bot

    dp = Dispatcher(storage=MemoryStorage())

    # Initialize database
    await init_db()

    # Initialize handlers
    handlers = Handlers(bot, get_session)
    dp.include_router(handlers.router)

    try:
        await bot(DeleteWebhook(drop_pending_updates=True))
        await dp.start_polling(bot)
    finally:
        await bot.session.close()


def get_bot_instance() -> Bot:
    return bot_instance


if __name__ == '__main__':
    asyncio.run(bot_start())
