from aiogram.types import ReplyKeyboardMarkup, KeyboardButton, ReplyKeyboardRemove


class Keyboards:
    @staticmethod
    def main_menu() -> ReplyKeyboardMarkup:
        return ReplyKeyboardMarkup(
            keyboard=[
                [KeyboardButton(text="Вход в веб-приложение")],
                [KeyboardButton(text="Регистрация в проекте")],
                [KeyboardButton(text="Обратиться в поддержку")],
                [KeyboardButton(text="Статистика проекта")]
            ],
            resize_keyboard=True,
            one_time_keyboard=True
        )

    @staticmethod
    def remove() -> ReplyKeyboardRemove:
        return ReplyKeyboardRemove()

    @staticmethod
    def language_selection() -> ReplyKeyboardMarkup:
        return ReplyKeyboardMarkup(
            keyboard=[
                [KeyboardButton(text="1 - Оба языка")],
                [KeyboardButton(text="2 - Только английский")],
                [KeyboardButton(text="3 - Только русский")]
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
