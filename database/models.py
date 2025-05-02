from sqlalchemy import Column, Integer, String, Text, ForeignKey, Boolean, TIMESTAMP, Double, BigInteger
from sqlalchemy.orm import declarative_base

Base = declarative_base()


class User(Base):
    __tablename__ = 'users'
    id = Column(BigInteger, primary_key=True)
    publ_id = Column(Integer, ForeignKey('publs.id', ondelete='CASCADE'))
    tlg_name = Column(String(255))
    tlg_username = Column(String(255))
    name = Column(String(255))
    reg_stat = Column(Integer)
    hash = Column(String(255))
    hash_date = Column(TIMESTAMP)
    items = Column(Text)
    age = Column(Integer)
    lng = Column(String)
    comm = Column(Text)
    reg_run = Column(TIMESTAMP)
    reg_end = Column(TIMESTAMP)
    sex = Column(String(3))
    rating = Column(Integer)
    email = Column(Text)
    region = Column(Text)


class Publ(Base):
    __tablename__ = 'publs'
    id = Column(Integer, primary_key=True)
    type = Column(Text)
    author = Column(Text)
    year = Column(Integer)
    name = Column(Text)
    external = Column(Text)
    language = Column(Text)
    resume = Column(Text)
    ural = Column(Boolean)
    coords = Column(Boolean)
    occs = Column(Boolean)
    spec = Column(Boolean)
    pdf_file = Column(Text)


class Action(Base):
    __tablename__ = 'actions'
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'))
    action = Column(Text)
    object = Column(Text)
    datetime = Column(TIMESTAMP)


class Record(Base):
    __tablename__ = 'records'
    id = Column(Integer, primary_key=True)
    publ_id = Column(Integer, ForeignKey('publs.id', ondelete='CASCADE'))
    user_id = Column(BigInteger, ForeignKey('users.id', ondelete='CASCADE'))
    datetime = Column(TIMESTAMP)
    ip = Column(Text)
    errors = Column(Text)
    type = Column(Text)
    adm_country = Column(Text)
    adm_region = Column(Text)
    adm_district = Column(Text)
    adm_loc = Column(Text)
    geo_nn = Column(Double)
    geo_ee = Column(Double)
    geo_nn_raw = Column(String(255))
    geo_ee_raw = Column(String(255))
    geo_origin = Column(Text)
    geo_REM = Column(Text)
    eve_YY = Column(Integer)
    eve_MM = Column(Integer)
    eve_DD = Column(Integer)
    eve_day_def = Column(Boolean)
    eve_habitat = Column(Text)
    eve_effort = Column(Text)
    abu_coll = Column(Text)
    eve_REM = Column(Text)
    tax_fam = Column(Text)
    tax_gen = Column(Text)
    tax_sp = Column(Text)
    tax_sp_def = Column(Boolean)
    tax_nsp = Column(Boolean)
    type_status = Column(Text)
    tax_REM = Column(Text)
    abu = Column(Integer)
    abu_details = Column(Text)
    abu_ind_rem = Column(Text)
    geo_uncert = Column(Double)
    eve_YY_end = Column(Integer)
    eve_MM_end = Column(Integer)
    eve_DD_end = Column(Integer)
    adm_verbatim = Column(Text)
