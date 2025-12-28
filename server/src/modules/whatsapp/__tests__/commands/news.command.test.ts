import { NewsCommand } from "../../commands/news.command";
import { GetNewsUseCase } from "@/modules/news/use-cases/get-news.use-case";
import { NewsEntity, NewsPlatform } from "@/modules/news/entities/news.entity";
import { Message } from "whatsapp-web.js";

describe("NewsCommand", () => {
  let newsCommand: NewsCommand;
  let mockGetNewsUseCase: jest.Mocked<GetNewsUseCase>;
  let mockMessage: jest.Mocked<Message>;

  beforeEach(() => {
    mockGetNewsUseCase = {
      execute: jest.fn(),
    } as any;

    newsCommand = new NewsCommand(mockGetNewsUseCase);

    mockMessage = {
      reply: jest.fn(),
    } as any;
  });

  it("should have correct name and description", () => {
    expect(newsCommand.name).toBe("news");
    expect(newsCommand.description).toBe("Show the latest news");
  });

  it("should reply with latest news", async () => {
    const news = [
      createMockNews("News 1", NewsPlatform.BBC),
      createMockNews("News 2", NewsPlatform.BRAZIL_INDEED),
    ];
    mockGetNewsUseCase.execute.mockResolvedValue(news);

    await newsCommand.execute(mockMessage);

    expect(mockMessage.reply).toHaveBeenCalledWith(
      expect.stringContaining("*Latest News:*")
    );
    expect(mockMessage.reply).toHaveBeenCalledWith(
      expect.stringContaining("News 1")
    );
    expect(mockMessage.reply).toHaveBeenCalledWith(
      expect.stringContaining("News 2")
    );
  });

  it("should limit to 5 news items", async () => {
    const news = Array.from({ length: 10 }, (_, i) =>
      createMockNews(`News ${i + 1}`, NewsPlatform.BBC)
    );
    mockGetNewsUseCase.execute.mockResolvedValue(news);

    await newsCommand.execute(mockMessage);

    const replyText = String(mockMessage.reply.mock.calls[0][0]);
    const newsCount = (replyText.match(/\*\d+\./g) || []).length;
    expect(newsCount).toBe(5);
  });

  it("should handle no news available", async () => {
    mockGetNewsUseCase.execute.mockResolvedValue([]);

    await newsCommand.execute(mockMessage);

    expect(mockMessage.reply).toHaveBeenCalledWith(
      "No news available at the moment."
    );
  });

  it("should handle errors gracefully", async () => {
    mockGetNewsUseCase.execute.mockRejectedValue(new Error("API Error"));

    await newsCommand.execute(mockMessage);

    expect(mockMessage.reply).toHaveBeenCalledWith(
      "Error fetching news. Please try again later."
    );
  });

  it("should truncate long descriptions", async () => {
    const news = [createMockNews("News 1", NewsPlatform.BBC)];
    news[0].description = "A".repeat(200);
    mockGetNewsUseCase.execute.mockResolvedValue(news);

    await newsCommand.execute(mockMessage);

    const replyText = String(mockMessage.reply.mock.calls[0][0]);
    const descriptionMatch = replyText.match(/A+\.\.\./);
    expect(descriptionMatch).toBeTruthy();
    expect(descriptionMatch![0].length).toBeLessThanOrEqual(103);
  });

  it("should include news links", async () => {
    const news = [createMockNews("News 1", NewsPlatform.BBC)];
    news[0].link = "https://example.com/news1";
    mockGetNewsUseCase.execute.mockResolvedValue(news);

    await newsCommand.execute(mockMessage);

    expect(mockMessage.reply).toHaveBeenCalledWith(
      expect.stringContaining("https://example.com/news1")
    );
  });
});

function createMockNews(title: string, platform: NewsPlatform): NewsEntity {
  const news = new NewsEntity();
  news.title = title;
  news.description = "Test description for news item";
  news.link = "https://test.com/news";
  news.image = "https://test.com/image.jpg";
  news.date = new Date();
  news.enterprise = platform;
  news.topics = ["test"];
  return news;
}

