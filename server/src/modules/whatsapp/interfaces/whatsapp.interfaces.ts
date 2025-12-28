import { Message } from "whatsapp-web.js";

export interface IWhatsAppCommand {
  name: string;
  description: string;
  execute: (message: Message, args: string[]) => Promise<void>;
}

export interface IWhatsAppService {
  initialize(): Promise<void>;
  sendMessage(to: string, message: string): Promise<void>;
  onMessage(callback: (message: Message) => void): void;
}

export interface ICommandHandler {
  registerCommand(command: IWhatsAppCommand): void;
  handleMessage(message: Message): Promise<void>;
  getCommands(): IWhatsAppCommand[];
}

