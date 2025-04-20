from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from config.config import DB_NAME, DB_HOST, DB_USER, DB_PASSWORD
from .models import Base


DATABASE_URL = f"postgresql+asyncpg://{DB_PASSWORD}:{DB_USER}@{DB_HOST}/{DB_NAME}"
engine = create_async_engine(DATABASE_URL, echo=True)
AsyncSessionLocal = sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)


async def get_session() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        yield session


async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
