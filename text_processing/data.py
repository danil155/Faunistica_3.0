import datetime


class Data:
    country = str()
    region = str()
    district = str()
    gathering_place = str()
    coordinate_north = 0.0
    coordinate_east = 0.0
    date = str()
    family = str()
    genus = str()
    species = str()
    collector = list()
    count_females = str()
    count_males = str()

    def clear(self):
        self.country = str()
        self.region = str()
        self.district = str()
        self.gathering_place = str()
        self.coordinate_north = 0.0
        self.coordinate_east = 0.0
        self.date = str()
        self.family = str()
        self.genus = str()
        self.species = str()
        self.collector = list()
        self.count_females = str()
        self.count_males = str()

    def print(self):
        print(f'Город - {self.city}\n'
              f'Область - {self.region}\n'
              f'Район - {self.district}\n'
              f'Координаты - {self.coordinates}\n'
              f'Дата - {self.date}\n'
              f'Семейство - {self.family}\n'
              f'Род - {self.genus}\n'
              f'Вид - {self.species}\n'
              f'Сборщик - {self.person}\n')
