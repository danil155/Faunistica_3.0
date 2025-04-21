from aiogram import Router
from aiogram.filters import Command
from aiogram.types import Message
from aiogram.fsm.context import FSMContext
import random
import string
from datetime import datetime
import hashlib

from config import config_vars, config
from bot.messages import Messages
from bot.button_markups import Keyboards
from database.crud import get_user, create_user, log_action, get_publication, update_user, get_user_stats,\
    get_general_stats, get_volunteers_achievements, count_users_with_name, get_publications_for_language
from bot.states import (
    RegistrationStates,
    SupportStates,
    RenameStates,
    SociologyStates
)


class Handlers:
    def __init__(self, bot, db_session_factory):
        self.bot = bot
        self.db_session_factory = db_session_factory
        self.router = Router()
        self.register_handlers()

    def register_handlers(self):
        # Command handlers
        self.router.message.register(self.start_command, Command("start"))
        self.router.message.register(self.register_command, Command("register"))
        self.router.message.register(self.auth_command, Command("auth"))
        self.router.message.register(self.menu_command, Command("menu"))
        self.router.message.register(self.stats_command, Command("stats"))
        self.router.message.register(self.rename_command, Command("rename"))
        self.router.message.register(self.support_command, Command("support"))
        self.router.message.register(self.sociology_command, Command("sociology"))
        self.router.message.register(self.cancel_command, Command("cancel"))
        self.router.message.register(self.reply_to_user_command, Command("reply"))

        # Text message handlers
        self.router.message.register(
            self.register_command,
            lambda msg: msg.text.lower() == "регистрация в проекте"
        )
        self.router.message.register(
            self.auth_command,
            lambda msg: msg.text.lower() == "вход в веб-приложение"
        )
        self.router.message.register(
            self.support_command,
            lambda msg: msg.text.lower() == "обратиться в поддержку"
        )
        self.router.message.register(
            self.stats_command,
            lambda msg: msg.text.lower() == "статистика проекта"
        )
        self.router.message.register(
            self.menu_command,
            lambda msg: "меню" in msg.text.lower()
        )
        self.router.message.register(
            self.sociology_command,
            lambda msg: "опрос" in msg.text.lower()
        )

        # Registration states handlers
        self.router.message.register(
            self.reg_accept_handler,
            lambda msg: msg.text.lower() in config_vars.YES_WORDS,
            RegistrationStates.waiting_for_agreement
        )
        self.router.message.register(
            self.reg_decline_handler,
            lambda msg: msg.text.lower() in config_vars.NO_WORDS,
            RegistrationStates.waiting_for_agreement
        )
        self.router.message.register(
            self.reg_name_handler,
            RegistrationStates.waiting_for_name
        )
        self.router.message.register(
            self.reg_age_handler,
            RegistrationStates.waiting_for_age
        )
        self.router.message.register(
            self.reg_prefs_handler,
            RegistrationStates.waiting_for_preferences
        )
        self.router.message.register(
            self.reg_lang_handler,
            RegistrationStates.waiting_for_language
        )

        # Support state handler
        self.router.message.register(
            self.support_question_handler,
            SupportStates.waiting_for_question
        )

        # Rename state handler
        self.router.message.register(
            self.rename_name_handler,
            RenameStates.waiting_for_new_name
        )

        # Sociology states handlers
        self.router.message.register(
            self.sociology_age_handler,
            SociologyStates.waiting_for_age
        )
        self.router.message.register(
            self.sociology_lang_handler,
            SociologyStates.waiting_for_language
        )
        self.router.message.register(
            self.sociology_comments_handler,
            SociologyStates.waiting_for_comments
        )
        self.router.message.register(
            self.sociology_gender_handler,
            SociologyStates.waiting_for_gender
        )
        self.router.message.register(
            self.sociology_rating_handler,
            SociologyStates.waiting_for_rating_agreement
        )
        self.router.message.register(
            self.sociology_region_handler,
            SociologyStates.waiting_for_region
        )
        self.router.message.register(
            self.sociology_email_handler,
            SociologyStates.waiting_for_email
        )

        # Other content handler
        self.router.message.register(self.other_content_handler)

    # ========== COMMAND HANDLERS ========== #

    async def start_command(self, message: Message):
        if message.chat.type == 'supergroup':
            return
        await message.answer(
            Messages.start(message.from_user.first_name),
            parse_mode="HTML",
            disable_web_page_preview=True,
            reply_markup=Keyboards.remove()
        )

    async def register_command(self, message: Message, state: FSMContext):
        if message.chat.type == 'supergroup':
            return
        async for session in self.db_session_factory():
            user = await get_user(session, message.from_user.id)

            if not user:
                await create_user(
                    session=session,
                    user_id=message.from_user.id,
                    reg_stat=2
                )
                await message.answer(
                    Messages.registration_start(),
                    reply_markup=Keyboards.yes_no(),
                    parse_mode="HTML",
                    disable_web_page_preview=True
                )
                await state.set_state(RegistrationStates.waiting_for_agreement)
            elif user.reg_stat == 1:
                await message.answer(
                    f"Вы уже зарегистрированы под именем {user.name}",
                    reply_markup=Keyboards.remove()
                )
            elif user.reg_stat == 7:
                await message.answer(
                    f"Вы начали обращение в поддержку. Пожалуйста, завершите его или отмените командой /cancel",
                )
            else:
                await self.continue_registration(message, user, state)

    async def continue_registration(self, message: Message, user, state: FSMContext):
        if message.chat.type == 'supergroup':
            return
        reg_stat = user.reg_stat

        if reg_stat == 2:
            await state.set_state(RegistrationStates.waiting_for_agreement)
            await message.answer(
                Messages.registration_start(),
                reply_markup=Keyboards.yes_no(),
                parse_mode="HTML",
                disable_web_page_preview=True
            )
        elif reg_stat == 3:
            await state.set_state(RegistrationStates.waiting_for_name)
            await message.answer(
                "Ввод имени. Напишите его, пожалуйста.",
                reply_markup=Keyboards.remove()
            )
        elif reg_stat == 4:
            await state.set_state(RegistrationStates.waiting_for_age)
            await message.answer(
                "Укажите свой возраст, пожалуйста.",
                reply_markup=Keyboards.remove()
            )
            if getattr(user, 'age', 0) < 18:
                await message.answer(
                    "Напоминаю, что участие с 14 до 18 лет возможно только при регистрации с родителями!"
                )
        elif reg_stat == 5:
            await state.set_state(RegistrationStates.waiting_for_preferences)
            await message.answer(
                Messages.ask_publication_preferences(),
                reply_markup=Keyboards.remove()
            )
        elif reg_stat == 6:
            await state.set_state(RegistrationStates.waiting_for_language)
            await message.answer(
                Messages.ask_language(),
                reply_markup=Keyboards.language_selection()
            )
        else:
            await state.clear()
            await message.answer(
                "Непредвиденная ошибка. Сообщите разработчику: https://sozontov.cc/feedback",
                reply_markup=Keyboards.remove()
            )

    async def auth_command(self, message: Message):
        if message.chat.type == 'supergroup':
            return

        async for session in self.db_session_factory():
            user = await get_user(session, message.from_user.id)

            if not user:
                await message.answer(Messages.not_registered())
                await log_action(
                    session=session,
                    user_id=message.from_user.id,
                    action="bot_auth",
                    object="not_reg_start"
                )
            elif 1 < user.reg_stat <= 7:
                await message.answer(Messages.registration_not_finished())
                await log_action(
                    session=session,
                    user_id=message.from_user.id,
                    action="bot_auth",
                    object="not_reg_end"
                )
            else:
                if not user.items:
                    await message.answer(Messages.no_publications_left())
                else:
                    publ = await get_publication(session, user.items.split('|')[0])
                    publ_text = self.format_publication(publ)
                    await message.answer(
                        Messages.current_publication(publ_text),
                        parse_mode="HTML",
                        disable_web_page_preview=True
                    )

                # Generate access code
                code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
                hashcode = hashlib.sha256(code.encode()).hexdigest()
                await update_user(
                    session=session,
                    user_id=message.from_user.id,
                    reg_stat=1,
                    hash=hashcode,
                    hash_date=datetime.now()
                )

                await message.answer(
                    Messages.auth_complete(code, datetime.now().strftime("%Y-%m-%d")),
                    parse_mode="Markdown"
                )
                await log_action(
                    session=session,
                    user_id=message.from_user.id,
                    action="bot_auth",
                    object="success"
                )

    async def menu_command(self, message: Message):
        if message.chat.type == 'supergroup':
            return
        await message.answer(
            "Вы вызвали меню",
            reply_markup=Keyboards.main_menu()
        )

    async def stats_command(self, message: Message):
        if message.chat.type == 'supergroup':
            return

        async for session in self.db_session_factory():
            general_stats = await get_general_stats(session)
            user_stats = None

            user = await get_user(session, message.from_user.id)
            if user:
                user_stats = await get_user_stats(session, user['user_id'])

            await message.answer(
                Messages.statistics(general_stats, user_stats),
                parse_mode="HTML",
                reply_markup=Keyboards.remove()
            )

            if message.chat.id == config.ADMIN_CHAT_ID:
                volunteers_data = await get_volunteers_achievements(session)
                # Здесь можно реализовать отправку файла с данными

    async def rename_command(self, message: Message, state: FSMContext):
        if message.chat.type == 'supergroup':
            return

        async for session in self.db_session_factory():
            user = await get_user(session, message.from_user.id)

            if not user:
                await message.answer(Messages.not_registered())
            elif 1 < user.reg_stat <= 6:
                await message.answer("Невозможно: ваша регистрация не закончена")
            elif user.reg_stat == 7:
                await message.answer("Невозможно: начато обращение в поддержку")
            elif user.reg_stat <= 20 and user.reg_stat != 1:
                await message.answer("Невозможно: начато прохождение опроса")
            else:
                await message.answer(
                    Messages.rename_prompt(),
                    reply_markup=Keyboards.remove()
                )
                await state.set_state(RenameStates.waiting_for_new_name)

    async def support_command(self, message: Message, state: FSMContext):
        if message.chat.type == 'supergroup':
            return
        if message.chat.id < 0:
            await message.answer("Камон, люди из этого чата должны оказывать техподдержку, а не просить её")
            return

        async for session in self.db_session_factory():
            await update_user(
                session=session,
                user_id=message.from_user.id,
                reg_stat=7
            )
        await message.answer(
            Messages.support_request(),
            reply_markup=Keyboards.remove()
        )
        await state.set_state(SupportStates.waiting_for_question)

    async def sociology_command(self, message: Message, state: FSMContext):
        if message.chat.type == 'supergroup':
            return

        async for session in self.db_session_factory():
            user = await get_user(session, message.from_user.id)

            if message.chat.id < 0:
                return
            elif not user:
                await message.answer(Messages.not_registered())
            elif 1 < user.reg_stat <= 7:
                await message.answer("Вы не закончили процесс регистрации. Вернитесь к нему, пожалуйста")
            elif user.reg_stat != 1:
                await message.answer("""Вы начали и не закончили какое-то другое действие. 
    Завершите это действие, пожалуйста, или прекратите его, 
    например, получив новый пароль: /auth""")
            elif all([getattr(user, field) is not None for field in ['age', 'lng', 'comm', 'sex', 'rating', 'email',
                                                                     'region']]):
                await message.answer(Messages.sociology_completed())
            else:
                missing_fields = [field for field in ['age', 'lng', 'comm', 'sex', 'rating', 'email', 'region']
                                  if getattr(user, field) is None]

                await message.answer(
                    f"Для вас имеется вопросов: <b>{len(missing_fields)}</b>\n"
                    "Вернуться к ответам на них вы можете по команде /sociology",
                    parse_mode="HTML"
                )

                next_question = missing_fields[0]

                if next_question == 'age':
                    await message.answer(Messages.sociology_question(1))
                    await state.set_state(SociologyStates.waiting_for_age)
                elif next_question == 'lng':
                    await message.answer(Messages.sociology_question(2))
                    await state.set_state(SociologyStates.waiting_for_language)
                elif next_question == 'comm':
                    await message.answer(Messages.sociology_question(3))
                    await state.set_state(SociologyStates.waiting_for_comments)
                elif next_question == 'sex':
                    await message.answer(Messages.sociology_question(4))
                    await state.set_state(SociologyStates.waiting_for_gender)
                elif next_question == 'rating':
                    await message.answer(Messages.sociology_question(5))
                    await state.set_state(SociologyStates.waiting_for_rating_agreement)
                elif next_question == 'region':
                    await message.answer(Messages.sociology_question(6))
                    await state.set_state(SociologyStates.waiting_for_region)
                elif next_question == 'email':
                    await message.answer(Messages.sociology_question(7))
                    await state.set_state(SociologyStates.waiting_for_email)

    async def cancel_command(self, message: Message, state: FSMContext):
        if message.chat.type == 'supergroup':
            return

        await state.clear()

        async for session in self.db_session_factory():
            await update_user(
                session=session,
                user_id=message.from_user.id,
                reg_stat=1
            )
        await message.answer(
            "Текущее действие отменено.",
            reply_markup=Keyboards.remove()
        )

    async def reply_to_user_command(self, message: Message):
        if message.chat.type == 'private':
            await message.answer("Команда доступна только в чате разработчиков.")
            return
        if not message.reply_to_message:
            await message.answer("Используйте команду /reply в ответ на сообщение пользователя.")
            return

        reply_text = message.text.replace("/reply", "").strip()
        if not reply_text:
            await message.answer("А че пустой ответ отправить захотел? Используй /reply еще раз и ответь нормально.")
            return

        original_message = message.reply_to_message.text
        try:
            print(original_message)
            user_id = int(original_message.split("ID: ")[1].split(" ")[0])
            print(user_id)
        except (IndexError, ValueError):
            await message.answer("Не удалось извлечь ID пользователя из сообщения.")
            return

        await self.bot.send_message(user_id, f"Ответ от поддержки:\n{reply_text}")
        await message.answer("Ответ отправлен пользователю.")

    # ========== STATE HANDLERS ========== #

    async def reg_accept_handler(self, message: Message, state: FSMContext):
        async for session in self.db_session_factory():
            await update_user(
                session=session,
                user_id=message.from_user.id,
                reg_stat=3
            )
        await message.answer("Ваше согласие учтено👌")
        await message.answer(Messages.ask_name())
        await state.set_state(RegistrationStates.waiting_for_name)

    async def reg_decline_handler(self, message: Message, state: FSMContext):
        await message.answer("Ничего, может быть позже.. 🙄")
        await state.clear()

    async def reg_name_handler(self, message: Message, state: FSMContext):
        name_msg = message.text

        async for session in self.db_session_factory():
            other_users = await count_users_with_name(session, name_msg)

            if other_users > 0:
                await message.answer(Messages.name_already_exists())
            elif len(name_msg) < 3:
                await message.answer(Messages.name_too_short())
            elif len(name_msg) > 20:
                await message.answer(Messages.name_too_long())
            elif any(c in name_msg for c in ".,!?;:"):
                await message.answer(Messages.name_has_punctuation())
            else:
                await update_user(
                    session=session,
                    user_id=message.from_user.id,
                    name=name_msg,
                    reg_stat=4
                )
                await message.answer(Messages.greeting(name_msg))
                await message.answer(Messages.ask_age())
                await state.set_state(RegistrationStates.waiting_for_age)

    async def reg_age_handler(self, message: Message, state: FSMContext):
        age_msg = message.text

        if len(age_msg) > 5:
            await message.answer(Messages.age_too_long())
        elif not age_msg.isdigit():
            await message.answer(Messages.age_no_digits())
        elif int(age_msg) > 99:
            await message.answer(Messages.age_too_high())
        elif int(age_msg) < 14:
            await message.answer(Messages.age_too_low())
        else:
            async for session in self.db_session_factory():
                await update_user(
                    session=session,
                    user_id=message.from_user.id,
                    age=int(age_msg),
                    reg_stat=5
                )
            await message.answer(Messages.age_accepted())

            if int(age_msg) < 18:
                await message.answer(Messages.age_under_18_warning())

            await message.answer(Messages.ask_publication_preferences())
            await state.set_state(RegistrationStates.waiting_for_preferences)

    async def reg_prefs_handler(self, message: Message, state: FSMContext):
        comm_msg = message.text.strip()

        async for session in self.db_session_factory():
            await update_user(
                session=session,
                user_id=message.from_user.id,
                comm=comm_msg,
                reg_stat=6
            )
        await message.answer(Messages.publication_preferences_accepted(comm_msg))
        await message.answer(Messages.ask_language())
        await state.set_state(RegistrationStates.waiting_for_language)

    async def reg_lang_handler(self, message: Message, state: FSMContext):
        lang_msg = message.text.strip().replace(" ", "").replace(",", "").replace(".", "")

        if len(lang_msg) > 1 or lang_msg not in ["1", "2", "3"]:
            await message.answer(Messages.language_selection_not_recognized())
            await message.answer(Messages.ask_language())
            return

        lang_map = {"1": "all", "2": "eng", "3": "rus"}
        lang_value = lang_map[lang_msg]

        async for session in self.db_session_factory():
            items = await get_publications_for_language(session, lang_value)
            items_str = "|".join(items[:5])  # Берем первые 5 публикаций

            if not items:
                await message.answer("К сожалению, публикаций для выбранного языка пока нет.")
                await update_user(
                    session=session,
                    user_id=message.from_user.id,
                    reg_stat=1,
                    reg_end=datetime.now()
                )
                return

            await update_user(
                session=session,
                user_id=message.from_user.id,
                lng=lang_value,
                items=items_str,
                reg_stat=1,
                reg_end=datetime.now()
            )

        await message.answer(Messages.registration_complete())
        await message.answer(Messages.auth_prompt())
        await state.clear()

    async def support_question_handler(self, message: Message, state: FSMContext):
        if len(message.text) < 10:
            await message.answer(Messages.support_request_too_short())

            async for session in self.db_session_factory():
                await update_user(
                    session=session,
                    user_id=message.from_user.id,
                    reg_stat=1
                )
            await state.clear()
            return

        async for session in self.db_session_factory():
            await update_user(
                session=session,
                user_id=message.from_user.id,
                reg_stat=1
            )

        await message.answer(
            Messages.support_request_received(),
            reply_markup=Keyboards.remove(),
            parse_mode="HTML"
        )

        await self.bot.send_message(
            chat_id=config.ADMIN_CHAT_ID,
            text=f"Пользователь @{message.from_user.username}, ID: {message.from_user.id} "
                 f"обратился в поддержку:\n\n{message.text}"
        )

        await state.clear()

    async def rename_name_handler(self, message: Message, state: FSMContext):
        name_msg = message.text

        async for session in self.db_session_factory():
            other_users = await count_users_with_name(session, name_msg)

            if other_users > 0:
                await message.answer(Messages.name_already_exists())
            elif len(name_msg) < 3:
                await message.answer(Messages.name_too_short())
            elif len(name_msg) > 40:
                await message.answer(Messages.name_too_long())
            elif any(c in name_msg for c in ".,!?;:"):
                await message.answer(Messages.name_has_punctuation())
            else:
                old_name = (await get_user(session, message.from_user.id)).name

                await log_action(
                    session=session,
                    user_id=message.from_user.id,
                    action="bot_rename",
                    object=f"{old_name}>{name_msg}"
                )

                await update_user(
                    session=session,
                    user_id=message.from_user.id,
                    name=name_msg,
                    reg_stat=1
                )

                await message.answer(Messages.rename_success(name_msg))
                await state.clear()

    # Sociology state handlers
    async def sociology_age_handler(self, message: Message, state: FSMContext):
        age_msg = message.text

        if len(age_msg) > 5:
            await message.answer(Messages.age_too_long())
        elif not age_msg.isdigit():
            await message.answer(Messages.age_no_digits())
        elif int(age_msg) > 99:
            await message.answer(Messages.age_too_high())
        elif int(age_msg) < 14:
            await message.answer(Messages.age_too_low())
        else:
            async for session in self.db_session_factory():
                await update_user(
                    session=session,
                    user_id=message.from_user.id,
                    age=int(age_msg),
                    reg_stat=1
                )
            await message.answer(Messages.age_accepted())

            if int(age_msg) < 18:
                await message.answer(Messages.age_under_18_warning())

            await message.answer("Вернуться к ответам на вопросы вы можете по команде /sociology")
            await state.clear()

    async def sociology_lang_handler(self, message: Message, state: FSMContext):
        lang_msg = message.text.strip().replace(" ", "").replace(",", "").replace(".", "")

        if len(lang_msg) > 1 or lang_msg not in ["1", "2", "3"]:
            await message.answer(Messages.language_selection_not_recognized())
            return

        lang_map = {"1": "all", "2": "eng", "3": "rus"}
        lang_value = lang_map[lang_msg]

        async for session in self.db_session_factory():
            await update_user(
                session=session,
                user_id=message.from_user.id,
                lng=lang_value,
                reg_stat=1
            )

        await message.answer(Messages.language_selection_accepted())
        await message.answer("Вернуться к ответам на вопросы вы можете по команде /sociology")
        await state.clear()

    async def sociology_comments_handler(self, message: Message, state: FSMContext):
        comm_msg = message.text.strip()
        async for session in self.db_session_factory():
            await update_user(
                session=session,
                user_id=message.from_user.id,
                comm=comm_msg,
                reg_stat=1
            )
        await message.answer(Messages.publication_preferences_accepted(comm_msg))
        await message.answer("Вернуться к ответам на вопросы вы можете по команде /sociology")
        await state.clear()

    async def sociology_gender_handler(self, message: Message, state: FSMContext):
        gender_msg = message.text.lower()

        if "жен" in gender_msg or "female" in gender_msg:
            gender_value = "ff"
        elif "муж" in gender_msg or "male" in gender_msg:
            gender_value = "mm"
        else:
            gender_value = "xx"

        async for session in self.db_session_factory():
            await update_user(
                session=session,
                user_id=message.from_user.id,
                sex=gender_value,
                reg_stat=1
            )

        await message.answer("Спасибо за ответ!")
        await message.answer("Вернуться к ответам на вопросы вы можете по команде /sociology")
        await state.clear()

    async def sociology_rating_handler(self, message: Message, state: FSMContext):
        answer = message.text.lower()
        print(answer)

        if answer in config_vars.YES_WORDS:
            rating_value = 1
        elif answer in config_vars.NO_WORDS:
            rating_value = 0
        else:
            rating_value = 0  # По умолчанию считаем как отказ

        async for session in self.db_session_factory():
            await update_user(
                session=session,
                user_id=message.from_user.id,
                rating=rating_value,
                reg_stat=1
            )

        await message.answer("Спасибо за ответ!")
        await message.answer("Вернуться к ответам на вопросы вы можете по команде /sociology")
        await state.clear()

    async def sociology_region_handler(self, message: Message, state: FSMContext):
        region_msg = message.text.strip()

        if len(region_msg) < 3:
            await message.answer("Слишком короткий ответ, попробуйте еще раз")
            return

        async for session in self.db_session_factory():
            await update_user(
                session=session,
                user_id=message.from_user.id,
                region=region_msg,
                reg_stat=1
            )

        await message.answer("Ваш регион учтен, спасибо!")
        await message.answer("Вернуться к ответам на вопросы вы можете по команде /sociology")
        await state.clear()

    async def sociology_email_handler(self, message: Message, state: FSMContext):
        email_msg = message.text.strip().lower()

        if "@" not in email_msg or "." not in email_msg:
            await message.answer("Это не похоже на email, попробуйте еще раз")
            return

        async for session in self.db_session_factory():
            await update_user(
                session=session,
                user_id=message.from_user.id,
                email=email_msg,
                reg_stat=1
            )

        await message.answer("Ваш email учтен, спасибо!")
        await message.answer("Вы ответили на все вопросы опроса!")
        await state.clear()

    # ========== OTHER HANDLERS ========== #

    async def other_content_handler(self, message: Message):
        if message.chat.type == 'supergroup':
            return

        async for session in self.db_session_factory():
            await log_action(
                session=session,
                user_id=message.from_user.id,
                action="bot_fun.other",
                object=message.content_type
            )
        await message.answer(
            Messages.unknown_content(),
            reply_markup=Keyboards.remove()
        )

    # ========== HELPER METHODS ========== #

    def format_publication(self, publ: dict) -> str:
        pub_type = {
            'S': "Глава книги",
            'A': "Статья",
            'B': "Книга"
        }.get(publ['type'], "Публикация")

        external_link = f'<a href="sozontov.cc/arachnolibrary/files/{publ["pdf_file"]}">{publ["external"]}</a>'

        if pub_type == "Книга":
            return f"📔\n{pub_type}: {publ['author']} {publ['year']} {publ['name']}. {external_link}"
        else:
            return f"📖\n{pub_type}: {publ['author']} {publ['year']} {publ['name']} // {external_link}"
