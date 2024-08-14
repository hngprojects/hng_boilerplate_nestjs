import { Injectable } from '@nestjs/common';
import { GenerativeModel, GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class TextService {
  private model: GenerativeModel;

  constructor() {
    const genAI = new GoogleGenerativeAI(process.env.OPENAI_API_KEY);
    this.model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }

  async translateText(text: string, targetLanguage: string): Promise<string> {
    const prompt = `Please provide a direct translation of the following text to ${targetLanguage}, without any additional context or explanations:\n\n"${text}"`;

    const result = await this.model.generateContent(prompt);
    const response = await result.response;
    let translatedText = await response.text();
    translatedText = translatedText.replace(/^"|"$/g, '').trim();

    return translatedText;
  }
}
