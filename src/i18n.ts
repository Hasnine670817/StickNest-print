import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      home: 'Home',
      products: 'Products',
      support: 'Support',
      welcome: 'Welcome to our store',
      shopNow: 'Shop Now',
      productDetails: 'Product Details',
      addToCart: 'Add to Cart',
    },
  },
  es: {
    translation: {
      home: 'Inicio',
      products: 'Productos',
      support: 'Soporte',
      welcome: 'Bienvenido a nuestra tienda',
      shopNow: 'Comprar ahora',
      productDetails: 'Detalles del producto',
      addToCart: 'Añadir al carrito',
    },
  },
  hi: {
    translation: {
      home: 'होम',
      products: 'उत्पाद',
      support: 'सहायता',
      welcome: 'हमारे स्टोर में आपका स्वागत है',
      shopNow: 'अभी खरीदें',
      productDetails: 'उत्पाद विवरण',
      addToCart: 'कार्ट में डालें',
    },
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
