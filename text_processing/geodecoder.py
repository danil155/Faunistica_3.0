from geopy.geocoders import Nominatim
from geopy.exc import GeocoderTimedOut, GeocoderServiceError
import logging

logger = logging.getLogger(__name__)


def get_location_info(lat: float, long: float) -> dict:
    if not (-90 <= lat <= 90) or not (-180 <= long <= 180):
        logger.error(f"Invalid coordinates: lat={lat}, long={long}")
        return {}

    geolocator = Nominatim(user_agent='agent_rock_stone')

    try:
        location = geolocator.reverse((lat, long), exactly_one=True)

        if location is None:
            logger.warning(f"No location found for coordinates: lat={lat}, long={long}")
            return {}

        return location.raw if hasattr(location, 'raw') else {}

    except GeocoderTimedOut:
        logger.error("Geocoding service timed out")
        return {}
    except GeocoderServiceError as e:
        logger.error(f"Geocoding service error: {str(e)}")
        return {}
    except Exception as e:
        logger.error(f"Unexpected error in geocoding: {str(e)}")
        return {}
