class Messages:

    # ========== START MESSAGE ========== #

    @staticmethod
    def start(first_name: str) -> str:
        return f'Здравствуйте, {first_name}\nЯ - телеграм-бот проекта <a href="https://vk.com/data_web">Паутина ' \
               'данных</a>, очень рад, что Вы им заинтересовались. С удовольствием зарегистрирую вас как нового ' \
               'участника и дам пароли для входа на <a href="https://sozontov.cc/faunistica_2.0">наш сайт научного ' \
               'волонтерства</a> и в <a href="https://sozontov.cc/arachnolibrary">цифровую библиотеку ' \
               'арахнологической литературы</a>. Чем могу вам помочь?'

    # ========== REGISTER MESSAGE ========== #

    @staticmethod
    def registration_start() -> str:
        return 'Давайте начнем регистрацию!\n \nНапоминаем, что регистрироваться и участвовать в нашем проекте ' \
               'могут совершеннолетние.\nНесовершеннолетние от 14 до 18 лет тоже могут участвовать, но должны ' \
               'регистрироваться с согласия и в присутствии родителей\n\n<a ' \
               'href="https://sozontov.cc/user_agreement">Пользовательское соглашение</a> принимаете?\n(да/нет)'

    @staticmethod
    def already_registered(first_name: str) -> str:
        return f'Вы уже зарегистрированы под именем {first_name}!'

    @staticmethod
    def started_registered() -> str:
        return 'Я так и не познакомился с вами 😭. Вернитесь к процессу регистрации с помощью команды /register'

    @staticmethod
    def consent_taken() -> str:
        return 'Ваше согласие учтено 👌'

    @staticmethod
    def maybe_later() -> str:
        return 'Ничего, может быть позже... 😌'

    @staticmethod
    def ask_name() -> str:
        return 'Пожалуйста, напишите как мне к вам обращаться 🙃'

    @staticmethod
    def registration_complete() -> str:
        return 'Спасибо за ответ, ваша регистрация закончена!\n\n' \
               'В дальнейшем вы можете изменить имя командой /rename\n\n' \
               'Также будет очень любезно с вашей стороны пройти небольшой опрос. ' \
               'Он поможет понять социологию и мотивацию участников-волонтёров. ' \
               'Для того, чтобы начать его, напишите "Опрос" или нажмите на ссылку: /sociology'

    @staticmethod
    def name_already_exists() -> str:
        return '🙄\nЭто имя уже занято\nПопробуйте добавить фамилию, цифру или любимое животное'

    @staticmethod
    def no_publication() -> str:
        return 'К сожалению, публикаций для выбранного языка пока нет. Я уже созваниваюсь с разработчиками, ' \
               'чтобы это исправить 🥺'

    @staticmethod
    def not_registered() -> str:
        return 'Увы, вас пока нет среди зарегистрированных пользователей.\nЖелаете зарегистрироваться?\n/register ' \
               '← Нажмите сюда'

    @staticmethod
    def greeting(name: str) -> str:
        return f'Приятно познакомиться, {name}! 🤗'

    @staticmethod
    def age_too_low() -> str:
        return 'Сожалею, участие возможно только с 14 лет 😞'

    @staticmethod
    def age_under_18_warning() -> str:
        return 'Напоминаю, что участие с 14 до 18 лет возможно только при регистрации с родителями! ' \
               'Продолжайте только если они находятся рядом.'

    @staticmethod
    def ask_password() -> str:
        return '🔐 Придумайте пароль для вашего аккаунта:\n\n' \
               'Требования:\n' \
               '- Не менее 8 символов\n' \
               '- Хотя бы одна заглавная буква\n' \
               '- Хотя бы одна цифра\n'

    @staticmethod
    def incorrect_password(key: int) -> str:
        warning = {1: '❌ Пароль должен быть не менее 8 символов!',
                   2: '❌ Пароль должен содержать хотя бы одну заглавную букву!',
                   3: '❌ Пароль должен содержать хотя бы одну цифру!',
                   4: '❌ Мне показалось, или вы пытаетесь сделать sql инъекцию?'}

        return warning.get(key, 'Что-то не так, попробуйте ввести еще раз 😬')

    # ========== AUTH MESSAGE ========== #

    @staticmethod
    def auth_success() -> str:
        return '<b>Вы успешно авторизованы!</b>\nНадеюсь, вы не забыли свой пароль для доступа на сайт 🤭'

    @staticmethod
    def auth_complete(tmp: str, time: str) -> str:
        return 'Для ресурса [Паутина данных](https://sozontov.cc/faunistica_2.0) код действует 36 часов. ' \
               'Для [арахнологической библиотеки](https://sozontov.cc/arachnolibrary) действует бессрочно. ' \
               f'Код доступа сгенерирован {time}: ' \
               f'```{tmp}```'

    @staticmethod
    def no_publications_left() -> str:
        return 'Ваша очередь публикаций подошла к концу.\nЯ уже в курсе и работаю над этим изо всех своих цифровых ' \
               'сил🥺'

    @staticmethod
    def current_publication(publ_info: str) -> str:
        return f'<b>Ваша текущая публикация</b>\n{publ_info}' \
               'Пожалуйста, не забудьте ознакомиться с инструкцией: ' \
               '<a href="https://sozontov.cc/vol_manual/">веб-страница</a>, ' \
               '<a href="https://sozontov.cc/vol_manual/vol_manual.pdf">пдф-файл</a>.'

    # ========== RENAME MESSAGE ========== #

    @staticmethod
    def rename_prompt() -> str:
        return 'Понял, вы хотите изменить имя, указанное при регистрации. ' \
               'Введите новый вариант, пожалуйста.\n👇👇👇 '

    @staticmethod
    def rename_success(name: str) -> str:
        return f'Классный выбор! Приятно познакомиться, {name}! 🤗'

    # ========== SUPPORT MESSAGE ========== #

    @staticmethod
    def support_for_admins() -> str:
        return 'Камон, люди из этого чата должны оказывать техподдержку, а не просить её 😡'

    @staticmethod
    def support_request() -> str:
        return 'Понял, вам нужна помощь.\nНапишите мне в чем ваше затруднение и я соединю вас с организаторами ' \
               'проекта\n👇👇👇'

    @staticmethod
    def support_request_received() -> str:
        return 'Ваша просьба о помощи получена. ' \
               'С вами свяжется первый освободившийся организатор / администратор проекта 🤗'

    @staticmethod
    def support_request_too_short() -> str:
        return 'Извините, но по такому короткому описанию будет трудно понять как вам помочь 😅'

    # ========== STATS MESSAGE ========== #

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

    # ========== SOCIOLOGY MESSAGE ========== #

    @staticmethod
    def any_question(missing_fields: list) -> str:
        return f'Для вас имеется вопросов: <b>{len(missing_fields)}</b>'

    @staticmethod
    def go_back_to_sociology() -> str:
        return 'Вернуться к ответам на вопросы вы можете по команде /sociology'

    @staticmethod
    def not_email() -> str:
        return 'Вы уверены, что это email? Я вот не очень 🙃'

    @staticmethod
    def ask_age() -> str:
        return 'Пожалуйста, укажите ваш возраст (цифрой).'

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
    def age_too_high() -> str:
        return '??? Вы не шутите? ' \
               'Старейший человек на Земле это [Мария Браньяс Морера](https://www.fontanka.ru/2023/01/26/72007319). ' \
               'Если вы не она, то введите корректный возраст, пожалуйста\n☺️'

    @staticmethod
    def age_accepted() -> str:
        return 'Возраст учтен, спасибо!'

    @staticmethod
    def region_accepted() -> str:
        return 'Ваш регион учтен, спасибо!'

    @staticmethod
    def email_accepted() -> str:
        return 'Теперь знаю кому писать смски (шучу), спасибо!'

    @staticmethod
    def publication_preferences_accepted(preferences: str) -> str:
        return f'Вы указали следующие пожелания: {preferences}'

    @staticmethod
    def language_selection_accepted() -> str:
        return 'Спасибо за ответ!\nВсе следующие публикации будут выданы с учетом вашего выбора'

    @staticmethod
    def sociology_question(question_num: int) -> str:
        questions = {
            1: 'Укажите ваш пол, пожалуйста (мужской/женский)',
            2: 'Согласны ли вы на отображение вашего имени в публичной таблице рейтинга?',
            3: 'В каком регионе вы живёте? Населенный пункт тоже можете указать, хоть это и не обязательно. Просто '
               'будем рады его учесть 🙂',
            4: 'Пожалуйста, сообщите свой адрес почты (предпочтительно), телефон или другие контактные данные, чтобы '
               'мы могли связаться с вами по дополнительным вопросам, в т.ч. вопросам поощрения 🙂'
        }
        return questions.get(question_num, 'Вопрос не найден 😱')

    @staticmethod
    def sociology_completed() -> str:
        return 'Вы ответили на все имеющиеся вопросы! Спасибо вам!\n\n ' \
               'Возможно, позже появятся новые. \nОставайтесь с нами!'

    # ========== REPLY MESSAGE ========== #

    @staticmethod
    def using_command_reply() -> str:
        return 'Команду /reply нужно использовать в ответ на обращение пользователя, чтобы я понял кому отвечать 🤓'

    @staticmethod
    def empty_response_to_user() -> str:
        return 'Пользователю не поможет этот ответ. Используй /reply еще раз и ответь нормально.'

    @staticmethod
    def could_not_extract_id() -> str:
        return 'Не удалось извлечь ID пользователя из сообщения.'

    @staticmethod
    def response_sent() -> str:
        return 'Ответ отправлен пользователю ✅'

    @staticmethod
    def response_from_support(reply_text: str) -> str:
        return f'🛠️ Ответ от поддержки:\n\n{reply_text}'

    @staticmethod
    def request_for_support(username: str, user_id: int, text: str) -> str:
        return f'Пользователь @{username}, ID: {user_id} обратился в поддержку:\n\n{text}'

    # ========== MENU MESSAGE ========== #

    @staticmethod
    def called_menu() -> str:
        return 'Вы вызвали меню 🥳'

    # ========== CANCEL MESSAGE ========== #

    @staticmethod
    def rollback_completed() -> str:
        return 'Понял, откат выполнен 😉'

    # ========== GENERAL MESSAGE ========== #

    @staticmethod
    def support_call_not_finished() -> str:
        return 'Вы начали обращение в поддержку 🙌. Пожалуйста, завершите его или отмените командой /cancel'

    @staticmethod
    def sociology_not_finished() -> str:
        return 'Вы не закончили прохождение опроса 🙁. Пожалуйста, завершите его или отмените командой /cancel'

    @staticmethod
    def registration_not_finished() -> str:
        return 'Извините, но вы не завершили начатую ранее регистрацию 👉🏻👈🏻\nМожет вернемся к этому?'

    @staticmethod
    def message_too_short() -> str:
        return 'Ответ слишком короткий, не могу такое принять 🙁'

    @staticmethod
    def message_too_long() -> str:
        return 'У меня плохая память, я точно не смогу запомнить такой длинный ответ 🫣'

    @staticmethod
    def message_has_punctuation() -> str:
        return 'В ответе содержатся знаки препинания, не могу такое принять 🚫'

    @staticmethod
    def message_no_digits() -> str:
        return 'Мои искусственные глаза не могут разглядеть здесь цифру 😞\nПопробуйте ещё раз'

    @staticmethod
    def message_not_only_digits() -> str:
        return 'Возможно, вы промахнулись, когда писали цифру, но в вашем сообщении есть другие символы ' \
               '🙄\nПопробуйте ещё раз'

    @staticmethod
    def no_access_to_command() -> str:
        return 'Простите, не могу позволить вам воспользоваться данной командой 😔'

    @staticmethod
    def started_unidentified_action() -> str:
        return 'Вы начали и не закончили какое-то другое действие. Завершите это действие, пожалуйста, или отмените ' \
               'его с помощью команды /cancel'

    @staticmethod
    def gratitude() -> str:
        return 'Спасибо за ответ!'

    @staticmethod
    def unknown_content() -> str:
        return 'Извините, обрабатывать контент такого типа мне пока сложно 😅\nПопробуйте вызывать меню: /menu'

    @staticmethod
    def selection_not_recognized() -> str:
        return 'Извините, не могу распознать ваш выбор 😬'

    @staticmethod
    def unexpected_error() -> str:
        return '⚠️ Мне жаль, но вы столкнулись с непредвиденной ошибкой.\nСообщите разработчику: ' \
               'https://sozontov.cc/feedback'
