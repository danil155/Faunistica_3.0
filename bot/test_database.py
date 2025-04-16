import asyncpg
from datetime import datetime
from config import config


class Database:
    def __init__(self):
        self.pool = None

    async def connect(self):
        self.pool = await asyncpg.create_pool(
            database=config.DB_NAME,
            host=config.DB_HOST,
            port=config.DB_PORT,
            user=config.DB_USER,
            password=config.DB_PASSWORD
        )

    async def get_user(self, user_id: int):
        async with self.pool.acquire() as conn:
            return await conn.fetchrow(
                "SELECT * FROM users WHERE id = $1",
                user_id
            )

    async def create_user(self, user_id: int, reg_stat: int):
        async with self.pool.acquire() as conn:
            await conn.execute(
                """INSERT INTO users 
                (id, reg_stat, reg_run) 
                VALUES ($1, $2, $3)""",
                user_id, reg_stat, datetime.now()
            )

    async def update_user(self, user_id: int, **fields):
        async with self.pool.acquire() as conn:
            set_clause = ", ".join([f"{k} = ${i + 2}" for i, k in enumerate(fields.keys())])
            values = list(fields.values())
            await conn.execute(
                f"UPDATE users SET {set_clause} WHERE id = $1",
                user_id, *values
            )

    async def count_users_with_name(self, name: str) -> int:
        async with self.pool.acquire() as conn:
            return await conn.fetchval(
                "SELECT COUNT(*) FROM users WHERE name = $1",
                name
            )

    async def log_action(self, user_id: int, action: str, object: str):
        async with self.pool.acquire() as conn:
            await conn.execute(
                """INSERT INTO actions 
                (user_id, action, object, datetime) 
                VALUES ($1, $2, $3, $4)""",
                user_id, action, object, datetime.now()
            )

    async def get_publication(self, publ_id: int):
        async with self.pool.acquire() as conn:
            return await conn.fetchrow(
                "SELECT * FROM publs WHERE id = $1",
                publ_id
            )

    async def get_publications_for_language(self, language: str):
        async with self.pool.acquire() as conn:
            if language == "all":
                return await conn.fetch(
                    "SELECT id FROM publs WHERE ural = TRUE AND coords = TRUE AND year > 1950"
                )
            else:
                return await conn.fetch(
                    f"SELECT id FROM publs WHERE ural = TRUE AND coords = TRUE AND year > 1950 AND language ILIKE '%{language}%'"
                )

    async def get_general_stats(self):
        async with self.pool.acquire() as conn:
            stats = {}

            # Total users
            stats['total_users'] = await conn.fetchval(
                "SELECT COUNT(*) FROM users WHERE reg_stat = 1 OR reg_stat >= 7"
            )

            # Average age
            stats['avg_age'] = round(await conn.fetchval(
                "SELECT AVG(age) FROM users"
            ), 1)

            # Publications stats
            publs = await conn.fetch(
                "SELECT language FROM publs WHERE ural > 0 AND coords > 0 AND occs = 1"
            )
            stats['total_publs'] = len(publs)
            stats['rus_publs'] = sum(1 for p in publs if 'rus' in p['language'].lower())
            stats['eng_publs'] = sum(1 for p in publs if 'eng' in p['language'].lower())

            # Records stats
            records = await conn.fetch("SELECT type FROM records")
            rec_ok = sum(1 for r in records if r['type'] == 'rec_ok')
            rec_fail = sum(1 for r in records if r['type'] == 'rec_fail')
            rec_check = sum(1 for r in records if 'check' in r['type'])

            stats['rec_ok'] = rec_ok
            stats['rec_fail_ratio'] = round(rec_fail / rec_ok, 2) if rec_ok else 0
            stats['check_ratio'] = round(rec_check / rec_ok, 2) if rec_ok else 0

            # Species and families count
            stats['species_count'] = await conn.fetchval(
                "SELECT COUNT(DISTINCT CONCAT(tax_gen, '_', tax_sp)) FROM records WHERE type = 'rec_ok'"
            )
            stats['families_count'] = await conn.fetchval(
                "SELECT COUNT(DISTINCT tax_fam) FROM records WHERE type = 'rec_ok'"
            )

            return stats

    async def get_user_stats(self, user_id: int):
        async with self.pool.acquire() as conn:
            stats = {}

            # Processed publications
            publs = set()
            publs.update(await conn.fetch(
                f"SELECT DISTINCT(publ_id) FROM records WHERE user_id = {user_id}"
            ))
            publs.update(await conn.fetch(
                f"""SELECT object FROM actions 
                WHERE user_id = {user_id} AND action LIKE '%end_publ%'"""
            ))
            stats['processed_publs'] = len(publs) - 1  # minus current

            # Records stats
            records = await conn.fetch(
                f"SELECT type FROM records where user_id = {user_id}"
            )
            rec_ok = sum(1 for r in records if r['type'] == 'rec_ok')
            rec_fail = sum(1 for r in records if r['type'] == 'rec_fail')
            rec_check = sum(1 for r in records if 'check' in r['type'])

            stats['rec_ok'] = rec_ok
            stats['check_ratio'] = round(rec_check / rec_ok, 1) if rec_ok else 0

            # Species count
            stats['species_count'] = await conn.fetchval(
                f"""SELECT COUNT(DISTINCT CONCAT(tax_gen, '_', tax_sp)) 
                FROM records WHERE type = 'rec_ok' and user_id = {user_id}"""
            )

            # Most common species
            stats['most_common_species'] = await conn.fetchval(
                f"""SELECT mode() WITHIN GROUP (ORDER BY CONCAT(tax_gen, ' ', tax_sp)) 
                FROM records WHERE type = 'rec_ok' and user_id = {user_id}"""
            )

            return stats

    async def get_volunteers_achievements(self):
        async with self.pool.acquire() as conn:
            return await conn.fetch(
                """SELECT a.user_id, a.object, a.datetime, 
                u.name, u.tlg_name, u.tlg_username 
                FROM actions a INNER JOIN users u ON a.user_id = u.user_id 
                WHERE a.action = 'fau_100' ORDER BY a.datetime desc"""
            )