import { useTranslation } from 'react-i18next';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng)
      .then(() => {
        console.log('Language changed to', lng);
      })
      .catch((err) => {
        console.error('Error changing language:', err);
      });
  };

  return (
    <div className="language-switcher">
      <button 
        onClick={() => changeLanguage('ru')} 
        className={i18n.language === 'ru' ? 'active' : ''}
      >
        RU
      </button>
      <button 
        onClick={() => changeLanguage('en')} 
        className={i18n.language === 'en' ? 'active' : ''}
      >
        EN
      </button>
    </div>
  );
};

export default LanguageSwitcher;