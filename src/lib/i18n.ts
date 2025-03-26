import { nextTick } from 'vue'
import { createI18n } from 'vue-i18n';


let i18n: any;

export function getI18n() {
    return i18n;
}

export const SUPPORT_LOCALES = ['en', 'es', 'fr', 'pt'];

const defaultLocale = 'en';

// function getNestedValue(obj: any, path: string) {
//     return path.split('.').reduce((acc, key) => acc && acc[key] ? acc[key] : null, obj);
// }

// function flatJsonResolver(obj: any, path: string) {
//     const result = obj[path] || getNestedValue(obj, path);
//     return result !== null && result !== undefined ? result : undefined;
// }

let loadingDefaultLocale = false;
let defaultLocaleLoaded = false;

export function setupI18n(defaultOptions: any = {
    locale: defaultLocale,
    fallbackLocale: defaultLocale,
    // messageResolver: flatJsonResolver,
    legacy: false,
    globalInjection: true,
    missing: (locale: string, key: string) => {
        if (locale === defaultLocale) {
            // If we're in English, just return the key (or a custom fallback)
            return key;
        }
        if (!defaultLocaleLoaded && !loadingDefaultLocale) {
            loadingDefaultLocale = true;
            // Trigger the load of English messages in the background.
            loadLocaleMessages(defaultLocale).then(() => {
                defaultLocaleLoaded = true;
                loadingDefaultLocale = false;
                console.log(`English fallback messages loaded after missing key: ${key}`);
            }).catch(err => {
                console.error('Error loading fallback locale:', err);
                loadingDefaultLocale = false;
            });
        }
        // Return the key or some fallback text synchronously
        return key;
    }
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
        // load locale messages from Tolgee (excluding menus)
        const fetchPromise = fetch(`https://cdn.tolg.ee/1f21497d5e2085ba6c2a858e2647bc02/${locale}.json`);
        const response = await fetchPromise;
        const messages = await response.json();

        // load menu labels from Tolgee
        // const responseFromTolgee = await fetch(`https://cdn.tolg.ee/fa9930d246d28584262908e4edbb5568/${locale}.json`);
        // const tMenusFromTolgee: { [key: string]: any } = await responseFromTolgee.json();

        i18n.global.setLocaleMessage(locale, { ...messages });
    } catch (e) {
        console.error(e);
    }

    return nextTick();
}
