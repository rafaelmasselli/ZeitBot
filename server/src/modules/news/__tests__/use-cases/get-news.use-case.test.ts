import { GetNewsUseCase } from "../../use-cases/get-news.use-case";
import { INewsProvider } from "../../interfaces/news-provider.interface";
import { NewsEntity, NewsPlatform } from "../../entities/news.entity";
import { createMockLogger } from "@/__tests__/mocks/logger.mock";

describe("GetNewsUseCase", () => {
  let getNewsUseCase: GetNewsUseCase;
  let mockNewsProviders: jest.Mocked<INewsProvider>[];
  const mockLogger = createMockLogger();

  beforeEach(() => {
    const provider1: jest.Mocked<INewsProvider> = {
      fetchNews: jest.fn(),
      processNews: jest.fn(),
    };

    const provider2: jest.Mocked<INewsProvider> = {
      fetchNews: jest.fn(),
      processNews: jest.fn(),
    };

    mockNewsProviders = [provider1, provider2];
    getNewsUseCase = new GetNewsUseCase(mockNewsProviders, mockLogger);
  });

  it("should fetch news from all providers", async () => {
    const news1 = createMockNews("BBC News 1", NewsPlatform.BBC);
    const news2 = createMockNews("Brasil News 1", NewsPlatform.BRAZIL_INDEED);

    mockNewsProviders[0].processNews.mockResolvedValue([news1]);
    mockNewsProviders[1].processNews.mockResolvedValue([news2]);

    const result = await getNewsUseCase.execute();

    expect(result).toHaveLength(2);
    expect(result).toContainEqual(news1);
    expect(result).toContainEqual(news2);
    expect(mockNewsProviders[0].processNews).toHaveBeenCalledTimes(1);
    expect(mockNewsProviders[1].processNews).toHaveBeenCalledTimes(1);
  });

  it("should return empty array when no news found", async () => {
    mockNewsProviders[0].processNews.mockResolvedValue([]);
    mockNewsProviders[1].processNews.mockResolvedValue([]);

    const result = await getNewsUseCase.execute();

    expect(result).toEqual([]);
    expect(mockLogger.info).toHaveBeenCalledWith(
      "0 news items obtained in total"
    );
  });

  it("should handle provider errors", async () => {
    const error = new Error("Provider error");
    mockNewsProviders[0].processNews.mockRejectedValue(error);

    await expect(getNewsUseCase.execute()).rejects.toThrow("Provider error");
    expect(mockLogger.error).toHaveBeenCalled();
  });

  it("should flatten news from multiple providers", async () => {
    const news1 = createMockNews("News 1", NewsPlatform.BBC);
    const news2 = createMockNews("News 2", NewsPlatform.BBC);
    const news3 = createMockNews("News 3", NewsPlatform.BRAZIL_INDEED);

    mockNewsProviders[0].processNews.mockResolvedValue([news1, news2]);
    mockNewsProviders[1].processNews.mockResolvedValue([news3]);

    const result = await getNewsUseCase.execute();

    expect(result).toHaveLength(3);
    expect(mockLogger.info).toHaveBeenCalledWith(
      "3 news items obtained in total"
    );
  });
});

function createMockNews(title: string, platform: NewsPlatform): NewsEntity {
  const news = new NewsEntity();
  news.title = title;
  news.description = "Test description";
  news.link = "https://test.com";
  news.image = "https://test.com/image.jpg";
  news.date = new Date();
  news.enterprise = platform;
  news.topics = ["test"];
  return news;
}

