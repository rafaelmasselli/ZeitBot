import { SendDailyMessagesUseCase } from "../../features/notifications/use-cases/send-daily-messages.use-case";
import { WhatsAppService } from "../../services/whatsapp.service";
import { GetNewsUseCase } from "@/modules/news/features/storage/use-cases/get-news.use-case";
import { NewsEntity, NewsPlatform } from "@/modules/news/entities/news.entity";
import { createMockLogger } from "@/__tests__/mocks/logger.mock";

describe("SendDailyMessagesUseCase", () => {
  let sendDailyMessagesUseCase: SendDailyMessagesUseCase;
  let mockWhatsAppService: jest.Mocked<WhatsAppService>;
  let mockGetNewsUseCase: jest.Mocked<GetNewsUseCase>;
  const mockLogger = createMockLogger();

  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };

    mockWhatsAppService = {
      sendMessage: jest.fn(),
      initialize: jest.fn(),
      onMessage: jest.fn(),
    } as any;

    mockGetNewsUseCase = {
      execute: jest.fn(),
    } as any;

    sendDailyMessagesUseCase = new SendDailyMessagesUseCase(
      mockWhatsAppService,
      mockGetNewsUseCase,
      mockLogger
    );
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("should send messages to configured recipients", async () => {
    process.env.WHATSAPP_DAILY_RECIPIENTS = "5511999999999,5511888888888";

    const news = [createMockNews("Test News", NewsPlatform.BBC)];
    mockGetNewsUseCase.execute.mockResolvedValue(news);
    mockWhatsAppService.sendMessage.mockResolvedValue();

    await sendDailyMessagesUseCase.execute();

    expect(mockWhatsAppService.sendMessage).toHaveBeenCalledTimes(2);
    expect(mockLogger.info).toHaveBeenCalledWith(
      "Daily messages sent successfully to 2 recipient(s)"
    );
  });

  it("should handle no recipients configured", async () => {
    delete process.env.WHATSAPP_DAILY_RECIPIENTS;

    await sendDailyMessagesUseCase.execute();

    expect(mockLogger.warn).toHaveBeenCalledWith(
      "No recipients configured for daily messages"
    );
    expect(mockGetNewsUseCase.execute).not.toHaveBeenCalled();
    expect(mockWhatsAppService.sendMessage).not.toHaveBeenCalled();
  });

  it("should handle no news available", async () => {
    process.env.WHATSAPP_DAILY_RECIPIENTS = "5511999999999";
    mockGetNewsUseCase.execute.mockResolvedValue([]);

    await sendDailyMessagesUseCase.execute();

    expect(mockLogger.info).toHaveBeenCalledWith("No news available to send");
    expect(mockWhatsAppService.sendMessage).not.toHaveBeenCalled();
  });

  it("should format message correctly with multiple news", async () => {
    process.env.WHATSAPP_DAILY_RECIPIENTS = "5511999999999";

    const news = [
      createMockNews("News 1", NewsPlatform.BBC),
      createMockNews("News 2", NewsPlatform.BRAZIL_INDEED),
    ];
    mockGetNewsUseCase.execute.mockResolvedValue(news);

    await sendDailyMessagesUseCase.execute();

    expect(mockWhatsAppService.sendMessage).toHaveBeenCalledWith(
      "5511999999999",
      expect.stringContaining("🌅 Bom dia!")
    );
    expect(mockWhatsAppService.sendMessage).toHaveBeenCalledWith(
      "5511999999999",
      expect.stringContaining("News 1")
    );
    expect(mockWhatsAppService.sendMessage).toHaveBeenCalledWith(
      "5511999999999",
      expect.stringContaining("News 2")
    );
  });

  it("should limit to 5 news items", async () => {
    process.env.WHATSAPP_DAILY_RECIPIENTS = "5511999999999";

    const news = Array.from({ length: 10 }, (_, i) =>
      createMockNews(`News ${i + 1}`, NewsPlatform.BBC)
    );
    mockGetNewsUseCase.execute.mockResolvedValue(news);

    await sendDailyMessagesUseCase.execute();

    const sentMessage = mockWhatsAppService.sendMessage.mock.calls[0][1];
    const newsCount = (sentMessage.match(/\*\d+\./g) || []).length;
    expect(newsCount).toBe(5);
  });

  it("should handle errors when sending to individual recipients", async () => {
    process.env.WHATSAPP_DAILY_RECIPIENTS = "5511999999999,5511888888888";

    const news = [createMockNews("Test News", NewsPlatform.BBC)];
    mockGetNewsUseCase.execute.mockResolvedValue(news);
    mockWhatsAppService.sendMessage
      .mockRejectedValueOnce(new Error("Send error"))
      .mockResolvedValueOnce();

    await sendDailyMessagesUseCase.execute();

    expect(mockLogger.error).toHaveBeenCalledWith(
      expect.stringContaining("Error sending message")
    );
    expect(mockWhatsAppService.sendMessage).toHaveBeenCalledTimes(2);
  });

  it("should trim phone numbers", async () => {
    process.env.WHATSAPP_DAILY_RECIPIENTS = " 5511999999999 , 5511888888888 ";

    const news = [createMockNews("Test News", NewsPlatform.BBC)];
    mockGetNewsUseCase.execute.mockResolvedValue(news);

    await sendDailyMessagesUseCase.execute();

    expect(mockWhatsAppService.sendMessage).toHaveBeenCalledWith(
      "5511999999999",
      expect.any(String)
    );
    expect(mockWhatsAppService.sendMessage).toHaveBeenCalledWith(
      "5511888888888",
      expect.any(String)
    );
  });
});

function createMockNews(title: string, platform: NewsPlatform): NewsEntity {
  const news = new NewsEntity();
  news.title = title;
  news.description = "Test description for news";
  news.link = "https://test.com/news";
  news.image = "https://test.com/image.jpg";
  news.date = new Date();
  news.enterprise = platform;
  news.topics = ["test"];
  return news;
}

