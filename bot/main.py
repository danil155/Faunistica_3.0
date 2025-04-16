import asyncio
from aiogram import Bot, Dispatcher
from aiogram.fsm.storage.memory import MemoryStorage
from aiogram.methods import DeleteWebhook

from config import config
from test_database import Database
from handlers import Handlers


async def main():
    bot = Bot(token=config.BOT_TOKEN)
    dp = Dispatcher(storage=MemoryStorage())

    # Initialize database
    db = Database()
    await db.connect()

    # Initialize handlers
    handlers = Handlers(bot, db)
    dp.include_router(handlers.router)

    try:
        print("Я родился")
        await bot(DeleteWebhook(drop_pending_updates=True))
        await dp.start_polling(bot)
    finally:
        await bot.session.close()
        await db.pool.close()


if __name__ == '__main__':
    asyncio.run(main())
