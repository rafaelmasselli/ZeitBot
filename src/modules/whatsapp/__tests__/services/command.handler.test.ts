import { CommandHandler } from "../../services/command.handler";
import { IWhatsAppCommand } from "../../interfaces/whatsapp.interfaces";
import { Message } from "whatsapp-web.js";
import { createMockLogger } from "@/__tests__/mocks/logger.mock";

describe("CommandHandler", () => {
  let commandHandler: CommandHandler;
  const mockLogger = createMockLogger();
  let mockMessage: jest.Mocked<Message>;

  beforeEach(() => {
    commandHandler = new CommandHandler(mockLogger);

    mockMessage = {
      body: "",
      reply: jest.fn(),
    } as any;
  });

  it("should register commands", () => {
    const mockCommand: IWhatsAppCommand = {
      name: "test",
      description: "Test command",
      execute: jest.fn(),
    };

    commandHandler.registerCommand(mockCommand);

    expect(mockLogger.info).toHaveBeenCalledWith("Command 'test' registered");
    expect(commandHandler.getCommands()).toContain(mockCommand);
  });

  it("should execute registered command", async () => {
    const mockCommand: IWhatsAppCommand = {
      name: "ping",
      description: "Ping command",
      execute: jest.fn(),
    };

    commandHandler.registerCommand(mockCommand);
    mockMessage.body = "!ping";

    await commandHandler.handleMessage(mockMessage);

    expect(mockCommand.execute).toHaveBeenCalledWith(mockMessage, []);
    expect(mockLogger.info).toHaveBeenCalledWith("Executing command: ping");
  });

  it("should ignore messages without prefix", async () => {
    const mockCommand: IWhatsAppCommand = {
      name: "test",
      description: "Test command",
      execute: jest.fn(),
    };

    commandHandler.registerCommand(mockCommand);
    mockMessage.body = "test";

    await commandHandler.handleMessage(mockMessage);

    expect(mockCommand.execute).not.toHaveBeenCalled();
  });

  it("should ignore unknown commands", async () => {
    mockMessage.body = "!unknown";

    await commandHandler.handleMessage(mockMessage);

    expect(mockMessage.reply).not.toHaveBeenCalled();
  });

  it("should pass arguments to command", async () => {
    const mockCommand: IWhatsAppCommand = {
      name: "test",
      description: "Test command",
      execute: jest.fn(),
    };

    commandHandler.registerCommand(mockCommand);
    mockMessage.body = "!test arg1 arg2 arg3";

    await commandHandler.handleMessage(mockMessage);

    expect(mockCommand.execute).toHaveBeenCalledWith(mockMessage, [
      "arg1",
      "arg2",
      "arg3",
    ]);
  });

  it("should handle command execution errors", async () => {
    const mockCommand: IWhatsAppCommand = {
      name: "error",
      description: "Error command",
      execute: jest.fn().mockRejectedValue(new Error("Command error")),
    };

    commandHandler.registerCommand(mockCommand);
    mockMessage.body = "!error";

    await commandHandler.handleMessage(mockMessage);

    expect(mockLogger.error).toHaveBeenCalledWith(
      expect.stringContaining("Error executing command error")
    );
    expect(mockMessage.reply).toHaveBeenCalledWith(
      "An error occurred while executing this command."
    );
  });

  it("should handle case insensitive commands", async () => {
    const mockCommand: IWhatsAppCommand = {
      name: "ping",
      description: "Ping command",
      execute: jest.fn(),
    };

    commandHandler.registerCommand(mockCommand);
    mockMessage.body = "!PING";

    await commandHandler.handleMessage(mockMessage);

    expect(mockCommand.execute).toHaveBeenCalled();
  });

  it("should handle empty command name", async () => {
    mockMessage.body = "!";

    await commandHandler.handleMessage(mockMessage);

    expect(mockLogger.info).not.toHaveBeenCalled();
  });

  it("should handle multiple spaces in command", async () => {
    const mockCommand: IWhatsAppCommand = {
      name: "test",
      description: "Test command",
      execute: jest.fn(),
    };

    commandHandler.registerCommand(mockCommand);
    mockMessage.body = "!test   arg1   arg2";

    await commandHandler.handleMessage(mockMessage);

    expect(mockCommand.execute).toHaveBeenCalledWith(mockMessage, [
      "arg1",
      "arg2",
    ]);
  });

  it("should return all registered commands", () => {
    const command1: IWhatsAppCommand = {
      name: "test1",
      description: "Test 1",
      execute: jest.fn(),
    };

    const command2: IWhatsAppCommand = {
      name: "test2",
      description: "Test 2",
      execute: jest.fn(),
    };

    commandHandler.registerCommand(command1);
    commandHandler.registerCommand(command2);

    const commands = commandHandler.getCommands();
    expect(commands).toHaveLength(2);
    expect(commands).toContain(command1);
    expect(commands).toContain(command2);
  });
});

