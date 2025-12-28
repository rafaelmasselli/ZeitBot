import { HelpCommand } from "../../commands/help.command";
import { CommandHandler } from "../../services/command.handler";
import { IWhatsAppCommand } from "../../interfaces/whatsapp.interfaces";
import { Message } from "whatsapp-web.js";
import { createMockLogger } from "@/__tests__/mocks/logger.mock";

describe("HelpCommand", () => {
  let helpCommand: HelpCommand;
  let mockCommandHandler: jest.Mocked<CommandHandler>;
  let mockMessage: jest.Mocked<Message>;
  const mockLogger = createMockLogger();

  beforeEach(() => {
    mockCommandHandler = {
      getCommands: jest.fn(),
      registerCommand: jest.fn(),
      handleMessage: jest.fn(),
    } as any;

    helpCommand = new HelpCommand(mockCommandHandler);

    mockMessage = {
      reply: jest.fn(),
    } as any;
  });

  it("should have correct name and description", () => {
    expect(helpCommand.name).toBe("help");
    expect(helpCommand.description).toBe("Show all available commands");
  });

  it("should list all available commands", async () => {
    const mockCommands: IWhatsAppCommand[] = [
      { name: "ping", description: "Check bot status", execute: jest.fn() },
      { name: "news", description: "Get latest news", execute: jest.fn() },
      { name: "help", description: "Show commands", execute: jest.fn() },
    ];

    mockCommandHandler.getCommands.mockReturnValue(mockCommands);

    await helpCommand.execute(mockMessage);

    expect(mockMessage.reply).toHaveBeenCalledWith(
      expect.stringContaining("*Available Commands:*")
    );
    expect(mockMessage.reply).toHaveBeenCalledWith(
      expect.stringContaining("*!ping*: Check bot status")
    );
    expect(mockMessage.reply).toHaveBeenCalledWith(
      expect.stringContaining("*!news*: Get latest news")
    );
    expect(mockMessage.reply).toHaveBeenCalledWith(
      expect.stringContaining("*!help*: Show commands")
    );
  });

  it("should handle empty command list", async () => {
    mockCommandHandler.getCommands.mockReturnValue([]);

    await helpCommand.execute(mockMessage);

    expect(mockMessage.reply).toHaveBeenCalledWith(
      "*Available Commands:*\n\n"
    );
  });

  it("should format commands correctly", async () => {
    const mockCommands: IWhatsAppCommand[] = [
      {
        name: "test",
        description: "Test command description",
        execute: jest.fn(),
      },
    ];

    mockCommandHandler.getCommands.mockReturnValue(mockCommands);

    await helpCommand.execute(mockMessage);

    const expectedText = "*Available Commands:*\n\n*!test*: Test command description\n";
    expect(mockMessage.reply).toHaveBeenCalledWith(expectedText);
  });
});

