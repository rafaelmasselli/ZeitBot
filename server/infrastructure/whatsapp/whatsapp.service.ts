import { injectable, inject } from "tsyringe";
import { Client, LocalAuth, Message } from "whatsapp-web.js";
import qrcode from "qrcode-terminal";
import { ILogger } from "@shared/logger/logger.interface";
import { IWhatsAppService } from "@domain/whatsapp";

@injectable()
export class WhatsAppService implements IWhatsAppService {
  private client: Client;
  private isReady = false;

  constructor(@inject("ILogger") private readonly logger: ILogger) {
    this.client = new Client({
      authStrategy: new LocalAuth({ clientId: "zeitbot" }),
      puppeteer: {
        args: ["--no-sandbox"],
      },
    });

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    this.client.on("qr", (qr) => {
      this.logger.info("QR Code received, scan to authenticate:");
      qrcode.generate(qr, { small: true });
    });

    this.client.on("ready", () => {
      this.isReady = true;
      this.logger.info("✅ WhatsApp client is ready!");
    });

    this.client.on("authenticated", () => {
      this.logger.info("WhatsApp client authenticated!");
    });

    this.client.on("auth_failure", (msg) => {
      this.logger.error(`Authentication failure: ${msg}`);
    });

    this.client.on("disconnected", (reason) => {
      this.isReady = false;
      this.logger.info(`WhatsApp client disconnected: ${reason}`);
    });
  }

  async initialize(): Promise<void> {
    try {
      this.logger.info("Initializing WhatsApp client...");
      await this.client.initialize();
    } catch (error) {
      this.logger.error(`Error initializing WhatsApp client: ${error}`);
      throw error;
    }
  }

  async sendMessage(to: string, message: string): Promise<void> {
    if (!this.isReady) {
      throw new Error("WhatsApp client is not ready");
    }

    try {
      const formattedNumber = to.includes("@c.us") ? to : `${to}@c.us`;
      await this.client.sendMessage(formattedNumber, message);
    } catch (error) {
      this.logger.error(`Error sending message: ${error}`);
      throw error;
    }
  }

  onMessage(callback: (message: Message) => void): void {
    this.client.on("message", callback);
  }
}

