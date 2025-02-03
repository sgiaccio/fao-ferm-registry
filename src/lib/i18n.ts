import { nextTick } from 'vue'
import { createI18n } from 'vue-i18n';


let i18n: any;

export function getI18n() {
    return i18n;
}

export const SUPPORT_LOCALES = ['en', 'es', 'fr', 'pt']

export function setupI18n(defaultOptions = { locale: 'en' }) {
    const options = { ...defaultOptions };
    if (process.env.NODE_ENV === 'development') {
        options.postTranslation = (str: any, key: string) => {
            if (typeof str === 'string') {
                return str ? `${str} (i18n)` : key;
            }
            return str;
        }
    }

    i18n = createI18n(options);
    setI18nLanguage(options.locale);

    return i18n;
}

export function setI18nLanguage(locale: string) {
    i18n.global.locale = locale;

    /**
     * NOTE:
     * If you need to specify the language setting for headers, such as the `fetch` API, set it here.
     * The following is an example for axios.
     *
     * axios.defaults.headers.common['Accept-Language'] = locale
     */
    document.querySelector('html')!.setAttribute('lang', locale);
}

export async function loadLocaleMessages(locale: string) {
    try {
        // const fetchPromise = fetch(`/locales/${locale}.json`);
        const fetchPromise = fetch(`https://cdn.tolg.ee/1f21497d5e2085ba6c2a858e2647bc02/${locale}.json`);
        const response = await fetchPromise;
        const messages = await response.json();
        i18n.global.setLocaleMessage(locale, messages);
    } catch (e) {
        console.error(e);
    }

    return nextTick();
}
