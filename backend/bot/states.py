from aiogram.fsm.state import StatesGroup, State


class RegistrationStates(StatesGroup):
    waiting_for_agreement = State()
    waiting_for_name = State()
    waiting_for_age = State()
    waiting_for_preferences = State()
    waiting_for_language = State()


class SupportStates(StatesGroup):
    waiting_for_question = State()


class RenameStates(StatesGroup):
    waiting_for_new_name = State()


class SociologyStates(StatesGroup):
    waiting_for_age = State()
    waiting_for_language = State()
    waiting_for_comments = State()
    waiting_for_gender = State()
    waiting_for_rating_agreement = State()
    waiting_for_region = State()
    waiting_for_email = State()
