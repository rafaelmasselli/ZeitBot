import { PingCommand } from "../../commands/ping.command";
import { Message } from "whatsapp-web.js";

describe("PingCommand", () => {
  let pingCommand: PingCommand;
  let mockMessage: jest.Mocked<Message>;

  beforeEach(() => {
    pingCommand = new PingCommand();

    mockMessage = {
      reply: jest.fn(),
    } as any;
  });

  it("should have correct name and description", () => {
    expect(pingCommand.name).toBe("ping");
    expect(pingCommand.description).toBe("Check if the bot is online");
  });

  it("should reply with pong message", async () => {
    await pingCommand.execute(mockMessage);

    expect(mockMessage.reply).toHaveBeenCalledWith(
      "Pong! The bot is online and working!"
    );
  });

  it("should handle multiple executions", async () => {
    await pingCommand.execute(mockMessage);
    await pingCommand.execute(mockMessage);

    expect(mockMessage.reply).toHaveBeenCalledTimes(2);
  });
});

