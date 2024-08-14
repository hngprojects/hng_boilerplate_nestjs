import { translate } from '@vitalets/google-translate-api'
export async function translateFields(
  title: string,
  content: string,
  targetLanguage: string,
): Promise<{ translatedTitle: string; translatedContent: string }> {
  try {
    const translatedTitle = await translate(title, { to: targetLanguage });
    const translatedContent = await translate(content, { to: targetLanguage });

    return {
      translatedTitle: translatedTitle.text,
      translatedContent: translatedContent.text,
    };
  } catch (err) {
    console.error('Translation error:', err);
    return {
      translatedTitle: title,
      translatedContent: content,
    };
  }
}
