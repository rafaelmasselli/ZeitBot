import { injectable, inject } from "tsyringe";
import { Message } from "whatsapp-web.js";
import {
  IRegistrationPresenter,
  RegistrationSuccessData,
} from "../interfaces/registration-presenter.interface";
import { TranslationService } from "@/modules/whatsapp/shared/services/translation.service";
import { MessageFormatterService } from "@/modules/whatsapp/shared/services/message-formatter.service";

@injectable()
export class RegistrationPresenter implements IRegistrationPresenter {
  constructor(
    @inject(TranslationService) private translator: TranslationService,
    @inject(MessageFormatterService) private formatter: MessageFormatterService
  ) {}

  async showCategoriesHelp(message: Message): Promise<void> {
    const helpText = this.formatter.formatCategoriesHelp();
    await message.reply(helpText);
  }

  async showSuccess(
    message: Message,
    data: RegistrationSuccessData
  ): Promise<void> {
    const categoriesText = this.translator.translateCategories(data.categories);
    const languageText = this.translator.translateLanguage(data.language);

    const successText = this.formatter.formatSuccessMessage({
      categories: categoriesText,
      language: languageText,
      hour: data.preferredHour,
    });

    await message.reply(successText);
  }
}

