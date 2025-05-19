import httpx

from config.config import BOT_TOKEN, ADMIN_CHAT_ID


async def send_support_message(data, user_id) -> None:
    message = (
        f"📢 Новое сообщение в поддержку из веб-формы 📢\n"
        f"🔗 Ссылка на Telegram: {data.link}\n"
        f"👤 Username в боте: {data.user_name if data.user_name else 'Не указан'}\n"
        f"🪪 ID: {user_id if user_id != -1 else 'Не найден'}\n"
        f"📋 Тип проблемы: {get_issue_type(data.issue_type)}\n"
        f"\n"
        f"📝 Сообщение:\n"
        f"{data.text}\n"
    )

    message_payload = {
        "chat_id": ADMIN_CHAT_ID,
        "text": message,
        "parse_mode": "HTML"
    }

    async with httpx.AsyncClient() as client:
        url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage"
        response = await client.post(url, json=message_payload)
        response.raise_for_status()


def get_issue_type(issue_type):
    issue_types = {
        "authorisation-website": "Проблемы с авторизацией на сайте",
        "authorisation-tg": "Проблемы с авторизацией в боте",
        "registration": "Проблемы с регистрацией в боте",
        "get-publication": "Проблемы с получением статьи",
        "autofill": "Проблемы с автозаполнением",
        "fill-by-hand": "Проблемы с заполнением вручную",
        "confirmation": "Проблемы с отправкой формы",
        "other": "Другая проблема"
    }
    return issue_types.get(issue_type, issue_type)
