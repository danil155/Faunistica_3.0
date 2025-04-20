from sqlalchemy import func, update, text
from sqlalchemy.exc import SQLAlchemyError, IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from datetime import datetime
from .models import User, Action, Publ, Record
import hashlib
import json
import functools


# === UTILS ===
def hash_function(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()


def handle_db_errors(func):
    @functools.wraps(func)
    async def wrapper(session: AsyncSession, *args, **kwargs):
        try:
            return await func(session, *args, **kwargs)
        except IntegrityError as e:
            await session.rollback()
            print(f"IntegrityError in {func.__name__}: {e}")
        except SQLAlchemyError as e:
            await session.rollback()
            print(f"SQLAlchemyError in {func.__name__}: {e}")
    return wrapper


# === USER ===
async def get_user_id_by_password(session: AsyncSession, password: str) -> int:
    hash_value = hash_function(password)
    stmt = select(User.id).where(User.hash == hash_value)
    result = await session.execute(stmt)
    user_id = result.scalar_one_or_none()
    return user_id if user_id else -1


async def get_user(session: AsyncSession, user_id: int):
    stmt = select(User).where(User.id == user_id)
    result = await session.execute(stmt)
    return result.scalar_one_or_none()


async def username_and_publication(session: AsyncSession, user_id: int) -> str:
    user = await get_user(session, user_id)
    if not user:
        return json.dumps({"error": "User not found"})

    data = {"user_name": user.name, "publication": None}

    if user.publ_id:
        stmt = select(Publ).where(Publ.id == user.publ_id)
        result = await session.execute(stmt)
        publication = result.scalar_one_or_none()
        if publication:
            data["publication"] = {
                "author": publication.author,
                "year": publication.year,
                "name": publication.name,
                "pdf_file": publication.pdf_file
            }

    return json.dumps(data)


@handle_db_errors
async def create_user(session: AsyncSession, user_id: int, reg_stat: int):
    user = User(id=user_id, reg_stat=reg_stat, reg_run=datetime.now())
    session.add(user)
    await session.commit()


@handle_db_errors
async def update_user(session: AsyncSession, user_id: int, **fields):
    stmt = update(User).where(User.id == user_id).values(**fields)
    await session.execute(stmt)
    await session.commit()


async def count_users_with_name(session: AsyncSession, name: str) -> int:
    stmt = select(func.count()).select_from(User).where(User.name == name)
    result = await session.execute(stmt)
    return result.scalar()


# === ACTIONS ===
@handle_db_errors
async def log_action(session: AsyncSession, user_id: int, action: str, object: str):
    act = Action(user_id=user_id, action=action, object=object, datetime=datetime.now())
    session.add(act)
    await session.commit()


# === PUBLICATIONS ===
async def get_publication(session: AsyncSession, publ_id: int):
    stmt = select(Publ).where(Publ.id == publ_id)
    result = await session.execute(stmt)
    return result.scalar_one_or_none()


async def get_publications_for_language(session: AsyncSession, language: str):
    filters = [Publ.ural.is_(True), Publ.coords.is_(True), Publ.year > 1950]
    if language != "all":
        filters.append(Publ.language.ilike(f"%{language}%"))

    stmt = select(Publ.id).where(*filters)
    result = await session.execute(stmt)
    return result.scalars().all()


@handle_db_errors
async def add_publication_from_json(session: AsyncSession, publ_json: dict):
    publ = Publ(**publ_json)
    session.add(publ)
    await session.commit()


# === GENERAL STATS ===
async def get_general_stats(session: AsyncSession):
    stats = {}

    # Total users
    stmt = select(func.count()).select_from(User).where((User.reg_stat == 1) | (User.reg_stat >= 7))
    result = await session.execute(stmt)
    stats['total_users'] = result.scalar()

    # Average age
    result = await session.execute(select(func.avg(User.age)))
    avg_age = result.scalar()
    stats['avg_age'] = round(avg_age, 1) if avg_age else 0

    # Publications
    stmt = select(Publ.language).where(Publ.ural.is_(True), Publ.coords.is_(True), Publ.occs.is_(True))
    result = await session.execute(stmt)
    langs = result.scalars().all()
    stats.update({
        'total_publs': len(langs),
        'rus_publs': sum('rus' in (lang or '').lower() for lang in langs),
        'eng_publs': sum('eng' in (lang or '').lower() for lang in langs)
    })

    # Records
    result = await session.execute(select(Record.type))
    records = result.scalars().all()
    rec_ok = records.count('rec_ok')

    stats['rec_ok'] = rec_ok
    stats['rec_fail_ratio'] = round(records.count('rec_fail') / rec_ok, 2) if rec_ok else 0
    stats['check_ratio'] = round(sum('check' in (r or '') for r in records) / rec_ok, 2) if rec_ok else 0

    # Species & families
    species_stmt = select(func.count(func.distinct(func.concat(Record.tax_gen, '_', Record.tax_sp)))).where(Record.type == 'rec_ok')
    families_stmt = select(func.count(func.distinct(Record.tax_fam))).where(Record.type == 'rec_ok')

    species_result = await session.execute(species_stmt)
    families_result = await session.execute(families_stmt)

    stats['species_count'] = species_result.scalar()
    stats['families_count'] = families_result.scalar()

    return stats


# === USER STATS ===
async def get_user_stats(session: AsyncSession, user_id: int):
    stats = {}

    # Publications processed
    publ_ids = set()
    recs_stmt = select(Record.publ_id).where(Record.user_id == user_id)
    actions_stmt = select(Action.object).where(Action.user_id == user_id, Action.action.ilike('%end_publ%'))

    for stmt in (recs_stmt, actions_stmt):
        result = await session.execute(stmt)
        publ_ids.update(result.scalars().all())

    stats['processed_publs'] = max(len(publ_ids) - 1, 0)

    # Record stats
    result = await session.execute(select(Record.type).where(Record.user_id == user_id))
    records = result.scalars().all()

    rec_ok = records.count('rec_ok')
    rec_check = sum('check' in (r or '') for r in records)

    stats.update({
        'rec_ok': rec_ok,
        'check_ratio': round(rec_check / rec_ok, 1) if rec_ok else 0,
    })

    # Species count
    species_stmt = select(func.count(func.distinct(func.concat(Record.tax_gen, '_', Record.tax_sp)))).where(
        Record.type == 'rec_ok', Record.user_id == user_id
    )
    result = await session.execute(species_stmt)
    stats['species_count'] = result.scalar()

    # Most common species
    result = await session.execute(text("""
        SELECT mode() WITHIN GROUP (ORDER BY CONCAT(tax_gen, ' ', tax_sp)) 
        FROM records 
        WHERE type = 'rec_ok' AND user_id = :user_id
    """), {"user_id": user_id})
    stats['most_common_species'] = result.scalar()

    return stats


# === VOLUNTEERS ===
async def get_volunteers_achievements(session: AsyncSession):
    stmt = text("""
        SELECT a.user_id, a.object, a.datetime, 
               u.name, u.tlg_name, u.tlg_username 
        FROM actions a 
        INNER JOIN users u ON a.user_id = u.id 
        WHERE a.action = 'fau_100' 
        ORDER BY a.datetime DESC
    """)
    result = await session.execute(stmt)
    return result.fetchall()


# === RECORDS ===
async def get_all_records(session: AsyncSession):
    stmt = select(Record)
    result = await session.execute(stmt)
    records = result.scalars().all()
    return [r.__dict__ for r in records if r]


@handle_db_errors
async def add_record_from_json(session: AsyncSession, record_json: dict):
    record = Record(**record_json)
    session.add(record)
    await session.commit()
