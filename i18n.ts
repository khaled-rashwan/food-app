import {getRequestConfig} from 'next-intl/server';
 
export default getRequestConfig(async ({requestLocale}) => {
  // This typically corresponds to the `[locale]` segment
  let locale = await requestLocale;
 
  // Validate that the incoming `locale` parameter is valid
  if (!locale || !['en', 'ar'].includes(locale)) {
    locale = 'ar'; // Default to Arabic if unknown
  }
 
  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default
  };
});
