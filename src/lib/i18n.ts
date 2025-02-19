import { nextTick } from 'vue'
import { createI18n } from 'vue-i18n';


let i18n: any;

export function getI18n() {
    return i18n;
}

export const SUPPORT_LOCALES = ['en', 'es', 'fr', 'pt']


function getNestedValue(obj: any, path: string) {
    return path.split('.').reduce((acc, key) => acc && acc[key] ? acc[key] : null, obj);
}

// Custom resolver to manually retrieve flat JSON keys
function flatJsonResolver(obj: any, path: string) {
    return obj[path] || getNestedValue(obj, path);
}

export function setupI18n(defaultOptions: any = {
    locale: 'en',
    fallbackLocale: 'en',
    messageResolver: flatJsonResolver,
    legacy: false,
    globalInjection: true
}) {
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
    // setI18nLanguage(options.locale);

    return i18n;
}

export function t(key: string, options?: any) {
    if (options) {
        return i18n.global.t(key, options);
    } else {
        return i18n.global.t(key);
    }
}


export async function setLocale(locale: string) {
    // use locale if paramsLocale is not in SUPPORT_LOCALES
    // if (!SUPPORT_LOCALES.includes(paramsLocale)) {
    //     return next(`/${locale}`)
    // }

    // check that the locale is already loaded - we don't use availableLocales because the locale is set before the messages are loaded
    const localeLoaded = Object.keys(i18n.global.getLocaleMessage(locale)).length > 0;
    if (!localeLoaded) {
        await loadLocaleMessages(locale);
    }

    setI18nLanguage(locale);
}

function setI18nLanguage(locale: string) {
    i18n.global.locale.value = locale;

    /**
     * NOTE:
     * If you need to specify the language setting for headers, such as the `fetch` API, set it here.
     * The following is an example for axios.
     *
     * axios.defaults.headers.common['Accept-Language'] = locale
     */
    document.querySelector('html')!.setAttribute('lang', locale);
}

async function loadLocaleMessages(locale: string) {
    try {
        const fetchPromise = fetch(`https://cdn.tolg.ee/1f21497d5e2085ba6c2a858e2647bc02/${locale}.json`);
        const response = await fetchPromise;
        const messages = await response.json();

        const responseFromTolgee = await fetch(`https://cdn.tolg.ee/fa9930d246d28584262908e4edbb5568/${locale}.json`);
        const tMenusFromTolgee: { [key: string]: any } = await responseFromTolgee.json();

        i18n.global.setLocaleMessage(locale, { ...messages, ...tMenusFromTolgee });
    } catch (e) {
        console.error(e);
    }

    return nextTick();
}
