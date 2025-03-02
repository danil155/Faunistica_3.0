from geopy.geocoders import Nominatim


def get_location_info(lat: float, long: float) -> dict:
    geolocator = Nominatim(user_agent='agent_rock_stone')
    location = geolocator.reverse((lat, long))

    if location.raw:
        return location.raw

    return {}


if __name__ == '__main__':
    data = get_location_info()
    print(data['address'])
    print(data['display_name'])
