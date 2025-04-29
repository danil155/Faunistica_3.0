import datetime


class Data:
    def __init__(self):
        self.country = ""
        self.region = ""
        self.district = ""
        self.gathering_place = ""
        self.coordinate_north = 0.0
        self.coordinate_east = 0.0
        self.date = ""
        self.family = ""
        self.genus = ""
        self.species = ""
        self.collector = []
        self.count_females = 0
        self.count_males = 0
        self.count_sub_females = 0
        self.count_sub_males = 0
        self.count_juveniles = 0

    def print(self):
        print(f'Country: {self.country}')
        print(f'Region: {self.region}')
        print(f'District: {self.district}')
        print(f'Gathering Place: {self.gathering_place}')
        print(f'Coordinates: {self.coordinate_north}, {self.coordinate_east}')
        print(f'Date: {self.date}')
        print(f'Family: {self.family}')
        print(f'Genus: {self.genus}')
        print(f'Species: {self.species}')
        print(f'Collectors: {self.collector}')
        print(f'Males: {self.count_males}')
        print(f'Females: {self.count_females}')
        print(f'Subadult Males: {self.count_sub_males}')
        print(f'Subadult Females: {self.count_sub_females}')
        print(f'Juveniles: {self.count_juveniles}')
