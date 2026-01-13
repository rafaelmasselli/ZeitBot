import { injectable } from "tsyringe";

export interface SuccessMessageData {
  categories: string;
  language: string;
  hour: number;
}

@injectable()
export class MessageFormatterService {
  formatCategoriesHelp(): string {
    return (
      "Não consegui identificar suas categorias. Escolha entre:\n\n" +
      "• technology (tecnologia)\n" +
      "• politics (política)\n" +
      "• sports (esportes)\n" +
      "• economy (economia)\n" +
      "• health (saúde)\n" +
      "• entertainment (entretenimento)\n" +
      "• world (internacional)\n" +
      "• all (todas)\n\n" +
      "*Exemplo:* Gosto de tecnologia e esportes"
    );
  }

  formatSuccessMessage(data: SuccessMessageData): string {
    return (
      `✅ *Cadastro concluído com sucesso!*\n\n` +
      `📋 *Categorias:* ${data.categories}\n` +
      `🌍 *Idioma detectado:* ${data.language}\n` +
      `⏰ *Horário de envio:* ${data.hour}:00\n\n` +
      `Você receberá notícias diariamente!\n\n` +
      `*Comandos disponíveis:*\n` +
      `!news - Ver últimas notícias\n` +
      `!preferences - Atualizar preferências\n` +
      `!mysubscription - Ver status\n` +
      `!unsubscribe - Cancelar inscrição`
    );
  }
}

