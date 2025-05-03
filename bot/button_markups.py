from aiogram.types import ReplyKeyboardMarkup, KeyboardButton, ReplyKeyboardRemove


class Keyboards:
    @staticmethod
    def remove() -> ReplyKeyboardRemove:
        return ReplyKeyboardRemove()

    @staticmethod
    def language_selection() -> ReplyKeyboardMarkup:
        return ReplyKeyboardMarkup(
            keyboard=[
                [KeyboardButton(text="1")],
                [KeyboardButton(text="2")],
                [KeyboardButton(text="3")]
            ],
            resize_keyboard=True,
            one_time_keyboard=True
        )

    @staticmethod
    def yes_no() -> ReplyKeyboardMarkup:
        return ReplyKeyboardMarkup(
            keyboard=[
                [KeyboardButton(text="Да"), KeyboardButton(text="Нет")]
            ],
            resize_keyboard=True,
            one_time_keyboard=True
        )
