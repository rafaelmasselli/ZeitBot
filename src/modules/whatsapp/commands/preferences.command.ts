import { injectable } from "tsyringe";
import { IWhatsAppCommand } from "../interfaces/whatsapp.interfaces";
import { Message } from "whatsapp-web.js";
import { UpdatePreferencesUseCase } from "../use-cases/update-preferences.use-case";

@injectable()
export class PreferencesCommand implements IWhatsAppCommand {
  name = "preferences";
  description = "Set your news preferences using AI";

  constructor(private updatePreferencesUseCase: UpdatePreferencesUseCase) {}

  async execute(message: Message): Promise<void> {
    const chat = await message.getChat();
    const contact = await message.getContact();
    const phoneNumber = contact.number;

    const args = (message.body as string).split(" ").slice(1);

    if (args.length === 0) {
      await chat.sendMessage(
        `🤖 *AI Preferences Setup*\n\n` +
          `Describe what kind of news you like, and our AI will learn your preferences!\n\n` +
          `*Example:*\n` +
          `!preferences I love technology, artificial intelligence, startups, and innovation. I'm also interested in science and space exploration.\n\n` +
          `The more detailed, the better! 🎯`
      );
      return;
    }

    const preferencesDescription = args.join(" ");

    if (preferencesDescription.length < 10) {
      await chat.sendMessage(
        `⚠️ Please provide a more detailed description of your preferences (at least 10 characters).`
      );
      return;
    }

    await chat.sendMessage(
      `🤖 Analyzing your preferences with AI...\nThis may take a few seconds...`
    );

    try {
      await this.updatePreferencesUseCase.execute(
        phoneNumber,
        preferencesDescription
      );

      await chat.sendMessage(
        `✅ *Preferences Updated!*\n\n` +
          `Your preferences have been saved:\n` +
          `"${preferencesDescription}"\n\n` +
          `Our AI will now recommend news that match your interests! 🎯\n\n` +
          `You'll receive personalized news at your preferred time.\n\n` +
          `To change your preferences, just send:\n` +
          `!preferences [new description]`
      );
    } catch (error) {
      await chat.sendMessage(
        `❌ Failed to update preferences. Please make sure you're subscribed first:\n` +
          `!subscribe`
      );
    }
  }
}

