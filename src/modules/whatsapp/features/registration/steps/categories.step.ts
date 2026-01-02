import { injectable, inject } from "tsyringe";
import { Message } from "whatsapp-web.js";
import { UserEntity } from "@/shared/entities/user.entity";
import { IRegistrationStep } from "../interfaces/registration-step.interface";
import { ICategoriesValidator } from "../interfaces/categories-validator.interface";
import { IRegistrationPresenter } from "../interfaces/registration-presenter.interface";
import { IRegistrationPersister } from "../interfaces/registration-persister.interface";
import { CategoriesAIService } from "../../categories/services/categories-ai.service";
import { ILogger } from "@/shared/logger/logger.interface";

@injectable()
export class CategoriesStep implements IRegistrationStep {
  constructor(
    @inject(CategoriesAIService) private extractor: CategoriesAIService,
    @inject("ICategoriesValidator") private validator: ICategoriesValidator,
    @inject("IRegistrationPresenter") private presenter: IRegistrationPresenter,
    @inject("IRegistrationPersister") private persister: IRegistrationPersister,
    @inject("ILogger") private logger: ILogger
  ) {}

  async execute(message: Message, user: UserEntity): Promise<void> {
    this.logger.debug(`Processing categories for user: ${user.phone_number}`);
    const result = await this.extractor.extractCategoriesAndLanguage(
      message.body.trim()
    );

    if (!this.validator.isValid(result.categories)) {
      await this.presenter.showCategoriesHelp(message);
      return;
    }

    await this.persister.saveCategories(user, {
      categories: result.categories,
      language: result.language,
    });

    await this.presenter.showSuccess(message, {
      categories: result.categories,
      language: result.language,
      preferredHour: user.preferred_hour || 8,
    });
  }
}
