import { useRouter } from 'next/router';

// Define the shape of our translations
export interface Translations {
  common: {
    title: string;
    subtitle: string;
    description: string;
    ai_translator: string;
    experience_power: string;
    supporting_languages: string;
    characters: string;
    error: string;
  };
  nav: {
    settings: string;
    theme_toggle: string;
  };
  translation: {
    input_placeholder: string;
    input_text: string;
    source_language: string;
    target_language: string;
    translate_button: string;
    clear_button: string;
    copy_button: string;
    swap_languages: string;
    translation_result: string;
    no_result: string;
    text_input_tab: string;
    ocr_upload_tab: string;
    ocr_disabled_vercel: string;
  };
  ocr: {
    title: string;
    description: string;
    ocr_language: string;
    ocr_language_tooltip: string;
    translate_to: string;
    translate_to_tooltip: string;
    select_language: string;
    select_target: string;
    click_drag_image: string;
    file_format_info: string;
    preview: string;
    extract_text: string;
    processing: string;
    clear: string;
    translating: string;
    translate_to_lang: string;
    extracted_text: string;
    characters: string;
    processing_image: string;
    text_extracted_success: string;
    confidence: string;
    no_text_found: string;
    no_text_detected: string;
    ocr_error: string;
    failed_extract_text: string;
  };
  settings: {
    title: string;
    description: string;
    api_key: string;
    api_key_placeholder: string;
    api_key_required: string;
    api_key_required_desc: string;
    base_url: string;
    base_url_placeholder: string;
    base_url_optional: string;
    invalid_url: string;
    invalid_url_desc: string;
    valid_url_note: string;
    base_url_note: string;
    model: string;
    model_required: string;
    model_placeholder: string;
    model_required_error: string;
    model_required_desc: string;
    save: string;
    cancel: string;
    test_connection: string;
    refresh: string;
    select_model: string;
    common_endpoints: string;
    security_note: string;
    models_count: string;
    models_note: string;
    models_loaded: string;
    models_loaded_desc: string;
    using_fallback_models: string;
    fallback_models_desc: string;
    failed_fetch_models: string;
    dynamic_loading_title: string;
    dynamic_loading_notes: {
      "0": string;
      "1": string;
      "2": string;
      "3": string;
    };
  };
  api_test: {
    title: string;
    test_button: string;
    testing: string;
    success: string;
    error: string;
    endpoint: string;
    test_successful: string;
    test_successful_desc: string;
    test_failed: string;
    connection_error: string;
    connection_error_desc: string;
    result_success: string;
    status_connected: string;
    status_failed: string;
    status_warning: string;
    status_not_tested: string;
  };
  language_switcher: {
    select_language: string;
  };
  toast: {
    copy_success: string;
    copy_failed: string;
    translate_success: string;
    translate_failed: string;
    please_enter_text: string;
    please_configure_api: string;
    settings_saved: string;
    api_test_success: string;
    api_test_failed: string;
  };
  languages: {
    auto: string;
    en: string;
    zh: string;
    'zh-cn': string;
    'zh-tw': string;
    ja: string;
    ko: string;
    es: string;
    fr: string;
    de: string;
    it: string;
    pt: string;
    ru: string;
    ar: string;
    hi: string;
    th: string;
    vi: string;
    nl: string;
    sv: string;
    no: string;
    da: string;
    fi: string;
    pl: string;
    tr: string;
  };
  ocr_languages: {
    eng: string;
    chi_sim: string;
    chi_tra: string;
    jpn: string;
    kor: string;
    spa: string;
    fra: string;
    deu: string;
    rus: string;
    ara: string;
  };
}

// Type for nested keys (e.g., "common.title")
type NestedKeyOf<ObjectType extends object> = {
  [Key in keyof ObjectType & (string | number)]: ObjectType[Key] extends object
    ? `${Key}` | `${Key}.${NestedKeyOf<ObjectType[Key]>}`
    : `${Key}`;
}[keyof ObjectType & (string | number)];

export type TranslationKey = NestedKeyOf<Translations>;

// Get value from nested object using dot notation
function getNestedValue(obj: any, path: string): string {
  return path.split('.').reduce((current, key) => current?.[key], obj) || path;
}

// Replace variables in template strings (e.g., "Hello {{name}}")
function interpolate(template: string, variables?: Record<string, string | number>): string {
  if (!variables) return template;
  
  return template.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
    return String(variables[key.trim()] || match);
  });
}

// Import translation files statically
import enTranslations from '../../locales/en.json';
import zhTranslations from '../../locales/zh.json';

const translations: Record<string, Translations> = {
  en: enTranslations,
  zh: zhTranslations,
};

export function useTranslation() {
  const router = useRouter();
  const { locale = 'en' } = router;

  const t = (
    key: TranslationKey,
    variables?: Record<string, string | number>
  ): string => {
    const currentTranslations = getTranslations(locale);
    const value = getNestedValue(currentTranslations, key);
    return interpolate(value, variables);
  };

  return {
    t,
    locale,
    isReady: router.isReady,
  };
}

function getTranslations(locale: string): Translations {
  return translations[locale] || translations.en;
} 