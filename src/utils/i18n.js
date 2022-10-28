import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      OpenSessionTitle: 'You are already logged into another session.',
      OpenSessionSubtitle: 'Click "Use here" to use chat in this session.',
      OpenSessionCloseText: 'Close',
      OpenSessionUseText: 'Use here'
    }
  },
  pt: {
    translation: {
      OpenSessionTitle: 'Você já está logado em outra sessão.',
      OpenSessionSubtitle: 'Clique em "Usar aqui" para usar o chat nesta sessão.',
      OpenSessionCloseText: 'Fechar',
      OpenSessionUseText: 'Usar aqui'
    }
  },
  es: {
    translation: {
      OpenSessionTitle: 'Ya estás conectado a otra sesión.',
      OpenSessionSubtitle: 'Haga clic en "Utilizar aquí" para utilizar el chat en esta sesión.',
      OpenSessionCloseText: 'Cerrar',
      OpenSessionUseText: 'Utilizar aquí'
    }
  }
};

i18n
  .use(initReactI18next)
  .use(LanguageDetector)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['navigator', 'cookie', 'sessionStorage', 'localStorage']
    }
  });

export default i18n;
