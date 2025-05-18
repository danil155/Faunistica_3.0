from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
import httpx
import io
from config.config import BOT_TOKEN

router = APIRouter()


async def fetch_telegram_photo(user_id: int):
    async with httpx.AsyncClient() as client:
        url = f"https://api.telegram.org/bot{BOT_TOKEN}/getUserProfilePhotos"
        resp = await client.get(url, params={"user_id": user_id, "limit": 1})
        data = resp.json()
        photos = data.get("result", {}).get("photos", [])
        if not photos:
            return None

        file_id = photos[0][-1]["file_id"]
        file_info_url = f"https://api.telegram.org/bot{BOT_TOKEN}/getFile"
        file_info_resp = await client.get(file_info_url, params={"file_id": file_id})
        file_info = file_info_resp.json()
        file_path = file_info["result"]["file_path"]

        file_url = f"https://api.telegram.org/file/bot{BOT_TOKEN}/{file_path}"
        file_resp = await client.get(file_url)
        return io.BytesIO(file_resp.content)


@router.get("/user_photo")
async def stream_photo(user_id: int):
    photo = await fetch_telegram_photo(user_id)
    if not photo:
        raise HTTPException(404, detail="No photo found")
    return StreamingResponse(photo, media_type="image/jpeg")
