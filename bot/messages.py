class Messages:
    @staticmethod
    def start(first_name: str) -> str:
        return f'Здравствуйте, {first_name}\nЯ - телеграм-бот проекта <a href="https://vk.com/data_web">Паутина ' \
               'данных</a>, очень рад, что Вы им заинтересовались. С удовольствием зарегистрирую вас как нового ' \
               'участника и дам пароли для входа на <a href="https://sozontov.cc/faunistica_2.0">наш сайт научного ' \
               'волонтерства</a> и в <a href="https://sozontov.cc/arachnolibrary">цифровую библиотеку ' \
               'арахнологической литературы</a>. Чем могу вам помочь?'

    @staticmethod
    def registration_start() -> str:
        return 'Давайте начнем регистрацию!\n \nНапоминаем, что регистрироваться и участвовать в нашем проекте ' \
               'могут совершеннолетние.\nНесовершеннолетние от 14 до 18 лет тоже могут участвовать, но должны ' \
               'регистрироваться с согласия и в присутствии родителей\n\n<a ' \
               'href="https://sozontov.cc/user_agreement">Пользовательское соглашение</a> принимаете?\n(да/нет)'

    @staticmethod
    def ask_name() -> str:
        return "Пожалуйста, напишите как вас зовут🙃"

    @staticmethod
    def ask_age() -> str:
        return "Пожалуйста, укажите ваш возраст (цифрой)"

    @staticmethod
    def ask_publication_preferences() -> str:
        return 'Какие публикации вы хотели бы получать и в каком порядке?\n' \
               'Быть может у вас есть какие-то предпочтения по региону, автору или семейству? ' \
               'По сложности, объему, по наличию описаний новых для науки видов? ' \
               'Сообщите о них и мы постараемся это учесть.\n\n' \
               'В противном случае напишите случайную цифру от 0 до 9 и мы поймём, что вы предпочитаете сюрпризы🥳'

    @staticmethod
    def ask_language() -> str:
        return 'Значительная часть публикаций написана на английском языке. Вы владеете им и готовы обрабатывать ' \
               'такие публикации?\n\n' \
               'Ответьте цифрой, пожалуйста (1/2/3):\n' \
               '1 - Владею, хочу получать публикации на обоих языках\n' \
               '2 - Владею, хочу получать публикации только на английском языке\n' \
               '3 - Не владею, хочу получать публикации только на русском языке\n'

    @staticmethod
    def registration_complete() -> str:
        return 'Спасибо за ответ, ваша регистрация закончена!\n\n' \
               'В дальнейшем вы можете изменить имя командой /rename\n\n' \
               'Также будет очень любезно с вашей стороны пройти небольшой опрос. ' \
               'Он поможет понять социологию и мотивацию участников-волонтёров. ' \
               'Для того, чтобы начать его, напишите "Опрос" или нажмите на ссылку: /sociology'

    @staticmethod
    def auth_complete(tmp: str, tm: str) -> str:
        return 'Для ресурса [Паутина данных](https://sozontov.cc/faunistica_2.0) код действует 36 часов. ' \
               'Для [арахнологической библиотеки](https://sozontov.cc/arachnolibrary) действует бессрочно. ' \
               f'Код доступа сгенерирован {tm}: ' \
               f'```{tmp}```'

    @ staticmethod
    def support_request() -> str:
        return 'Понял, вам нужна помощь.\nНапишите мне в чем ваше затруднение и я соединю вас с организаторами ' \
               'проекта\n👇👇👇'

    @staticmethod
    def support_request_sent() -> str:
        return 'Ваша просьба о помощи получена. С вами свяжется первый освободившийся организатор проекта🤗 Если ' \
               'вопрос не срочный, но важный, оставьте обратную связь через <a href="https://sozontov.cc/feedback"> ' \
               'эту форму</a>.'

    @staticmethod
    def unknown_content() -> str:
        return "Извините, обрабатывать контент такого типа мне пока сложно🫣\nпопробуйте вызывать меню: /menu"

    @staticmethod
    def unknown_command() -> str:
        return "Ваше сообщение не распознано как команда\nпопробуйте вызывать меню: /menu"

    @staticmethod
    def name_already_exists() -> str:
        return "🙄\nЭто имя уже занято\nПопробуйте добавить фамилию, цифру или любимое животное"

    @staticmethod
    def name_too_short() -> str:
        return "Ответ слишком короткий, не могу такое принять \n🙄\nПопробуйте добавить фамилию"

    @staticmethod
    def name_too_long() -> str:
        return "Ответ слишком длинный, не могу такое принять \n🙄🙄🙄"

    @staticmethod
    def name_has_punctuation() -> str:
        return "В ответе содержатся знаки препинания, не могу такое принять \n🚫"

    @staticmethod
    def greeting(name: str) -> str:
        return f"Приятно познакомиться, {name}!\n🤗"

    @staticmethod
    def age_too_long() -> str:
        return "Ответ слишком длинный, не могу такое принять \n🙄🙄🙄"

    @staticmethod
    def age_no_digits() -> str:
        return "В сообщении нет цифр, не могу такое принять \n🙄\nПопробуйте ещё раз"

    @staticmethod
    def age_not_only_digits() -> str:
        return "В сообщении не только цифры, не могу такое принять \n🙄\nПопробуйте ещё раз"

    @staticmethod
    def age_too_high() -> str:
        return '??? Вы не шутите? ' \
               'Старейший человек на Земле это [Мария Браньяс Морера](https://www.fontanka.ru/2023/01/26/72007319). ' \
               'Если вы не она, то введите корректный возраст, пожалуйста\n☺️'

    @staticmethod
    def age_too_low() -> str:
        return "Сожалею, участие возможно только с 14 лет"

    @staticmethod
    def age_under_18_warning() -> str:
        return 'Напоминаю, что участие с 14 до 18 лет возможно только при регистрации с родителями! ' \
               'Продолжайте только если они находятся рядом.'

    @staticmethod
    def age_accepted() -> str:
        return "Возраст учтён, спасибо!"

    @staticmethod
    def publication_preferences_accepted(preferences: str) -> str:
        return f"Вы указали следующие пожелания: {preferences}"

    @staticmethod
    def language_selection_invalid() -> str:
        return "Ответ слишком длинный, не могу распознать \n🙄🙄🙄"

    @staticmethod
    def language_selection_not_recognized() -> str:
        return "Извините, не могу распознать ваш выбор \n🙄🙄🙄"

    @staticmethod
    def language_selection_accepted() -> str:
        return "Спасибо за ответ!\nВсе следующие публикации будут выданы с учетом вашего выбора"

    @staticmethod
    def registration_not_finished() -> str:
        return "Извините, но вы не завершили начатую ранее регистрацию.\nМожет вернемся к этому?"

    @staticmethod
    def not_registered() -> str:
        return 'Увы, вас пока нет среди зарегистрированных пользователей.\nЖелаете зарегистрироваться?\n/register ' \
               '← Нажмите сюда'

    @staticmethod
    def auth_success() -> str:
        return "Вы успешно авторизованы!"

    @staticmethod
    def no_publications_left() -> str:
        return "Ваша очередь публикаций подошла к концу. \nЯ уже в курсе и работаю над этим изо всех своих цифровых " \
               "сил🥺"

    @staticmethod
    def current_publication(publ_info: str) -> str:
        return f'<b>Ваша текущая публикация</b>\n{publ_info}' \
               'Пожалуйста, не забудьте ознакомиться с инструкцией: ' \
               '<a href="https://sozontov.cc/vol_manual/">веб-страница</a>, ' \
               '<a href="https://sozontov.cc/vol_manual/vol_manual.pdf">пдф-файл</a>.'

    @staticmethod
    def support_request_received() -> str:
        return 'Ваша просьба о помощи получена. ' \
               'С вами свяжется первый освободившийся организатор проекта 🤗 '

    @staticmethod
    def support_request_too_short() -> str:
        return "Извините, по такому короткому описанию будет трудно понять как вам помочь"

    @staticmethod
    def rename_prompt() -> str:
        return 'Понял, вы хотите изменить имя, указанное при регистрации. ' \
               'Введите новый вариант, пожалуйста. \n👇👇👇 '

    @staticmethod
    def rename_success(name: str) -> str:
        return f"Приятно познакомиться, {name}!\n🤗\nВ дальнейшем вы можете изменить имя командой /rename"

    @staticmethod
    def sociology_question(question_num: int) -> str:
        questions = {
            1: "Укажите ваш пол, пожалуйста (мужской/женский)",
            2: "Согласны ли вы на отображение вашего имени в публичной таблице рейтинга?",
            3: "В каком регионе вы живёте? Населенный пункт тоже можете указать.",
            4: "Пожалуйста, сообщите свой адрес почты или другие контактные данные"
        }
        return questions.get(question_num, "Вопрос не найден")

    @staticmethod
    def sociology_completed() -> str:
        return 'Вы ответили на все имеющиеся вопросы.\n\n ' \
               'Возможно, позже появятся новые. \nОставайтесь с нами!'

    @staticmethod
    def statistics(general_stats: dict, personal_stats: dict = None) -> str:
        stats_text = '<b>Общая статистика: </b>\n\n' \
                     f'Всего зарегистрированных участников: {general_stats["total_users"]} ' \
                     f'Средний возраст участника: {general_stats["avg_age"]} ' \
                     f'Всего публикаций на очереди в оцифровку: {general_stats["total_publs"]}, ' \
                     f'из них на русском языке {general_stats["rus_publs"]}, ' \
                     f'на английском языке {general_stats["eng_publs"]}.\n' \
                     f'Всего записей внесено волонтерами: {general_stats["rec_ok"]}. ' \
                     f'На одну успешную запись приходится {general_stats["rec_fail_ratio"]} ' \
                     f'неудачных попыток, а также {general_stats["check_ratio"]} проверок. ' \
                     f'Эти записи содержат информацию о {general_stats["species_count"]} видах, ' \
                     f'относящихся к {general_stats["families_count"]} семействам.\n' \
                     f'Это очень хорошая статистика! Надеемся, ваш вклад ее улучшит ^_^ '

        if personal_stats:
            stats_text += '\n\n<b>Персональная статистика:</b>\n' \
                          f'Вы полностью обработали {personal_stats["processed_publs"]} публикаций, ' \
                          'в процессе обработки: 1 публикация. ' \
                          f'Вы внесли {personal_stats["rec_ok"]} записей, ' \
                          f'на каждую успешную запись приходится {personal_stats["check_ratio"]} проверок. ' \
                          f'Вашими стараниями в базе оказалось {personal_stats["species_count"]} видов. ' \
                          f'Чаще всего вы встречали вид: <i>{personal_stats["most_common_species"]}</i>\n' \
                          'Это очень хорошая статистика! Надеемся, вы сможете сделать ещё лучше ^_^ '

        return stats_text
