import type { Locale } from '@/types';
import enMessages from '@/messages/en.json';
import hiMessages from '@/messages/hi.json';

export interface TranslationService {
  getMessages(locale: Locale): Record<string, any>;
  translateKey(keyPath: string, locale: Locale): string;
  translateDynamicText(text: string, from: Locale, to: Locale): Promise<string>;
}

export class StaticTranslationService implements TranslationService {
  private messages: Record<Locale, Record<string, any>> = {
    en: enMessages,
    hi: hiMessages,
  };

  public getMessages(locale: Locale): Record<string, any> {
    return this.messages[locale] || this.messages.en;
  }

  public translateKey(keyPath: string, locale: Locale): string {
    const keys = keyPath.split('.');
    let current: any = this.getMessages(locale);
    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        // Fallback to English if missing in target locale
        let fallback: any = this.messages.en;
        for (const fbKey of keys) {
          if (fallback && typeof fallback === 'object' && fbKey in fallback) {
            fallback = fallback[fbKey];
          } else {
            return keyPath;
          }
        }
        return typeof fallback === 'string' ? fallback : keyPath;
      }
    }
    return typeof current === 'string' ? current : keyPath;
  }

  /**
   * Translates dynamic user generated content.
   * Can be hooked to Bhashini API or Gemini API in production.
   */
  public async translateDynamicText(text: string, from: Locale, to: Locale): Promise<string> {
    if (from === to || !text) return text;
    // Static fallback:
    return text;
  }
}

/**
 * Future Bhashini API translation connector stub
 */
export class BhashiniTranslationService extends StaticTranslationService {
  private bhashiniApiKey?: string;

  constructor(apiKey?: string) {
    super();
    this.bhashiniApiKey = apiKey;
  }

  public override async translateDynamicText(text: string, from: Locale, to: Locale): Promise<string> {
    if (from === to || !text) return text;
    // When Bhashini credentials are provided, call Bhashini NMT API pipeline
    return super.translateDynamicText(text, from, to);
  }
}

export const defaultTranslationService = new StaticTranslationService();
