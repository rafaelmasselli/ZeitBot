import { Message } from "whatsapp-web.js";

export interface IWhatsAppService {
  initialize(): Promise<void>;
  sendMessage(to: string, message: string): Promise<void>;
  onMessage(callback: (message: Message) => void): void;
}

