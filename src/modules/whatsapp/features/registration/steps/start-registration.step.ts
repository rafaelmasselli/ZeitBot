import { injectable, inject } from "tsyringe";
import { Message } from "whatsapp-web.js";
import {
  UserEntity,
  UserRegistrationStep,
} from "@/shared/entities/user.entity";
import { CachedUserRepository } from "@/shared/repositories/cached-user.repository";
import { IRegistrationStep } from "../interfaces/registration-step.interface";

@injectable()
export class StartRegistrationStep implements IRegistrationStep {
  constructor(
    @inject(CachedUserRepository) private userRepo: CachedUserRepository
  ) {}

  async execute(message: Message, user: UserEntity): Promise<void> {
    await this.userRepo.update(user.phone_number, {
      registration_step: UserRegistrationStep.AWAITING_CATEGORIES,
    });

    await message.reply(
      "*Bem-vindo ao ZeitBot!*\n\n" +
        "Vamos configurar suas preferências de notícias.\n\n" +
        "*Passo 1: Categorias*\n\n" +
        "Nos fale que tipo de notícia você gosta de receber.\n" +
        "Quais dias você prefere receber as notícias?\n\n" +
        "Ou envie 'all' para receber todas as categorias."
    );
  }
}
