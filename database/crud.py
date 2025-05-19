from sqlalchemy import func, update, text, and_
from sqlalchemy.exc import SQLAlchemyError, IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from datetime import datetime
import functools
import asyncio
from .hash import check_pass
from typing import List, Dict
from .models import User, Action, Publ, Record


# === UTILS ===
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
async def get_user_id_by_username(session: AsyncSession, username: str) -> int:
    stmt = select(User.id).where(User.name == username)
    result = await session.execute(stmt)
    user_id = result.scalar_one_or_none()
    return user_id if user_id else -1


async def is_pass_correct(session: AsyncSession, user_id: int, user_pass: str) -> bool:
    stmt = select(User.hash).where(User.id == user_id)
    result = await session.execute(stmt)
    user_hash = result.scalar_one_or_none()
    return check_pass(user_pass, user_hash)


async def get_user(session: AsyncSession, user_id: int):
    stmt = select(User).where(User.id == user_id)
    result = await session.execute(stmt)
    return result.scalar_one_or_none()


async def username_and_publication(session: AsyncSession, user_id: int) -> dict:
    user = await get_user(session, user_id)
    if not user:
        return {"error": "User not found"}

    data = {"user_name": user.name, "publication": None}

    if user.publ_id:
        stmt = select(Publ).filter_by(id=user.publ_id)
        result = await session.execute(stmt)
        publication = result.scalar_one_or_none()
        if publication:
            data["publication"] = {
                "author": publication.author,
                "year": str(publication.year),
                "name": publication.name,
                "pdf_file": publication.pdf_file
            }

    return data


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


async def is_publ_filled(session: AsyncSession, user_id: int, publ_id: int) -> bool:
    stmt = select(Record).where(Record.user_id == user_id, Record.publ_id == publ_id) \
        .order_by(Record.datetime.desc()) \
        .limit(1)
    result = await session.execute(stmt)
    record = result.scalar_one_or_none()

    if not record:
        return False

    return record.type == 'rec_ok'


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
@handle_db_errors
async def get_user_stats(session: AsyncSession, user_id: int):
    stats = {}

    # Publications processed
    publ_ids = set()
    publs = []
    recs_stmt = select(Record.publ_id).where(Record.user_id == user_id)

    result = await session.execute(recs_stmt)
    for publ_id in result.scalars().all():
        publs.append(publ_id)
        publ_ids.add(publ_id)

    stats['processed_publs'] = max(len(publ_ids), 0)
    total_records = len(publs)

    # Record stats
    result = await session.execute(select(Record.type).where(Record.user_id == user_id))
    records = result.scalars().all()

    rec_ok = records.count('rec_ok')
    rec_check = sum('check' in (r or '') for r in records)

    stats.update({
        'rec_ok': rec_ok,
        'check_ratio': round(rec_check / rec_ok, 2) if total_records else 0,
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


def format_event_date(yy, mm, dd, yy_end, mm_end, dd_end) -> str:
    def fmt(y, m, d):
        parts = []
        if y:
            parts.append(str(y))
            if m:
                parts.append(f"{m:02}")
                if d:
                    parts.append(f"{d:02}")
        return ".".join(parts)

    start = fmt(yy, mm, dd)
    end = fmt(yy_end, mm_end, dd_end)

    return f"{start} – {end}" if end else start


@handle_db_errors
async def get_personal_stats(session: AsyncSession, user_id: int) -> List[Dict]:
    stmt = (
        select(
            Record.publ_id,
            Record.datetime,
            Record.adm_district,
            Record.adm_region,
            Record.tax_gen,
            Record.tax_sp,
            Record.abu,
            Record.eve_YY,
            Record.eve_MM,
            Record.eve_DD,
            Record.eve_YY_end,
            Record.eve_MM_end,
            Record.eve_DD_end,
            Publ.author
        )
        .join(Publ, Publ.id == Record.publ_id)
        .where(
            and_(
                Record.user_id == user_id,
                Record.type == "rec_ok"
            )
        )
        .order_by(Record.datetime.desc())
    )

    result = await session.execute(stmt)
    rows = result.all()

    records = []
    for row in rows:
        date = format_event_date(row.eve_YY, row.eve_MM, row.eve_DD, row.eve_YY_end, row.eve_MM_end, row.eve_DD_end)
        location_parts = []
        if row.adm_district is not None:
            location_parts.append(row.adm_district)
        if row.adm_region is not None:
            location_parts.append(row.adm_region)

        location = ", ".join(location_parts) if location_parts else "Не заполнено"

        species_parts = []
        if row.tax_gen is not None:
            species_parts.append(row.tax_gen)
        if row.tax_sp is not None:
            species_parts.append(row.tax_sp)

        species = " ".join(species_parts) if species_parts else "Не заполнено"

        records.append({
            "date": str(row.datetime),
            "author": row.author,
            "species": species,
            "abundance": row.abu,
            "locality": location,
            "even_date": date
        })

    return records


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


async def get_statistics(session: AsyncSession):
    stats = {}
    # 1. Total publications
    stmt = select(func.count()).select_from(Publ)
    result = await session.execute(stmt)
    stats['total_publications'] = result.scalar()

    # 2. Amount of processed publications
    stmt = select(func.count(func.distinct(Record.publ_id)))
    result = await session.execute(stmt)
    stats['processed_publications'] = result.scalar()

    # 3. Total species count
    stmt = select(func.count()).select_from(Record).where(Record.type == 'rec_ok')
    result = await session.execute(stmt)
    stats['total_species'] = result.scalar()

    # 4. Unique species count
    stmt = select(func.count(func.distinct(func.concat(Record.tax_gen, '_', Record.tax_sp)))).where(
        Record.type == 'rec_ok')
    result = await session.execute(stmt)
    stats['unique_species'] = result.scalar()

    # 5. Top 4 species with the most spiders
    stmt = select(Record.tax_gen, Record.tax_sp, func.count(Record.id).label('spider_count')) \
        .group_by(Record.tax_gen, Record.tax_sp) \
        .order_by(func.count(Record.id).desc()) \
        .limit(4)
    result = await session.execute(stmt)
    top_species = result.fetchall()
    stats['top_species'] = [{"species": f"{row.tax_gen} {row.tax_sp}", "count": row.spider_count} for row in top_species]

    # 6. Latest 4 records
    stmt = select(
        func.date(Record.datetime).label('formatted_date'),
        Record.tax_gen,
        Record.tax_sp,
        Record.adm_district,
        Record.adm_region,
        Record.user_id
    ).order_by(Record.datetime.desc()).limit(4)
    result = await session.execute(stmt)
    latest_records = result.fetchall()

    user_ids = [record.user_id for record in latest_records]
    user_name_data = await asyncio.gather(
        *[username_and_publication(session, user_id) for user_id in user_ids]
    )

    stats['latest_records'] = [
        {
            "datetime": record.formatted_date.isoformat(),
            "species": f"{record.tax_gen} {record.tax_sp}",
            "location": f"{record.adm_district}, {record.adm_region}",
            "username": user_data['user_name'] if user_data and 'user_name' in user_data else "Unknown"
        }
        for record, user_data in zip(latest_records, user_name_data)
    ]

    return stats
