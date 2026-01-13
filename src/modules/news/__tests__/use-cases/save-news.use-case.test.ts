import { SaveNewsUseCase } from "../../features/storage/use-cases/save-news.use-case";
import { INewsRepository } from "../../interfaces/news.repository.interface";
import { GetNewsUseCase } from "../../features/storage/use-cases/get-news.use-case";
import { NewsEntity, NewsPlatform } from "../../entities/news.entity";
import { createMockLogger } from "@/__tests__/mocks/logger.mock";

describe("SaveNewsUseCase", () => {
  let saveNewsUseCase: SaveNewsUseCase;
  let mockNewsRepository: jest.Mocked<INewsRepository>;
  let mockGetNewsUseCase: jest.Mocked<GetNewsUseCase>;
  const mockLogger = createMockLogger();

  beforeEach(() => {
    mockNewsRepository = {
      create: jest.fn(),
      findLastNews: jest.fn(),
      findOneByLink: jest.fn(),
      findAll: jest.fn(),
    };

    mockGetNewsUseCase = {
      execute: jest.fn(),
    } as any;

    saveNewsUseCase = new SaveNewsUseCase(
      mockNewsRepository,
      mockGetNewsUseCase,
      mockLogger
    );
  });

  it("should save news successfully", async () => {
    const news = createMockNews("Test News", NewsPlatform.BBC);
    mockGetNewsUseCase.execute.mockResolvedValue([news]);
    mockNewsRepository.create.mockResolvedValue(news);

    const result = await saveNewsUseCase.execute();

    expect(result).toHaveLength(1);
    expect(mockNewsRepository.create).toHaveBeenCalledWith(news);
    expect(mockLogger.info).toHaveBeenCalledWith(
      "1 news items saved successfully"
    );
  });

  it("should save multiple news items", async () => {
    const news1 = createMockNews("News 1", NewsPlatform.BBC);
    const news2 = createMockNews("News 2", NewsPlatform.BRAZIL_INDEED);

    mockGetNewsUseCase.execute.mockResolvedValue([news1, news2]);
    mockNewsRepository.create.mockResolvedValueOnce(news1);
    mockNewsRepository.create.mockResolvedValueOnce(news2);

    const result = await saveNewsUseCase.execute();

    expect(result).toHaveLength(2);
    expect(mockNewsRepository.create).toHaveBeenCalledTimes(2);
  });

  it("should handle repository errors", async () => {
    const news = createMockNews("Test News", NewsPlatform.BBC);
    mockGetNewsUseCase.execute.mockResolvedValue([news]);
    mockNewsRepository.create.mockRejectedValue(new Error("Database error"));

    await expect(saveNewsUseCase.execute()).rejects.toThrow("Database error");
    expect(mockLogger.error).toHaveBeenCalled();
  });

  it("should handle empty news array", async () => {
    mockGetNewsUseCase.execute.mockResolvedValue([]);

    const result = await saveNewsUseCase.execute();

    expect(result).toEqual([]);
    expect(mockNewsRepository.create).not.toHaveBeenCalled();
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

