from text_processing.splitting import get_separated_parameters


def get_parameters_dict(text: str) -> dict:
    data = get_separated_parameters(text)

    return {
        'country': data.country,
        'region': data.region,
        'district': data.district,
        'gathering_place': data.gathering_place,
        'coordinate_north': data.coordinate_north,
        'coordinate_east': data.coordinate_east,
        'date': data.date,
        'family': data.family,
        'genus': data.genus,
        'species': data.species,
        'collector': data.collector,
        'count_males': data.count_males,
        'count_females': data.count_females
    }


if __name__ == '__main__':
    print(get_parameters_dict('Runcinia tarabayevi Marusik et Logunov, 1990 Материал. 1 ♂, Челябинская обл., Троицкий р-н, заказник Троицкий, березовый колок, укосы, 29.VI.2023, Устинова А.Л.'))