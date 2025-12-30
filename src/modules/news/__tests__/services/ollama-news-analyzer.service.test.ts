import "reflect-metadata";
import { OllamaNewsAnalyzer } from "../../services/ollama-news-analyzer.service";
import { ILogger } from "@/shared/logger/logger.interface";
import { NewsEntity, NewsPlatform } from "../../entities/news.entity";
import { NewsCategory } from "@/modules/whatsapp/entities/subscriber.entity";
import axios from "axios";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

const createTestNews = (overrides: Partial<NewsEntity> = {}): NewsEntity => ({
  title: "Test title",
  description: "Test description",
  link: "https://test.com",
  image: "https://test.com/image.jpg",
  date: new Date(),
  enterprise: NewsPlatform.BBC,
  topics: [],
  created_at: new Date(),
  updated_at: new Date(),
  ...overrides,
});

describe("OllamaNewsAnalyzer", () => {
  let analyzer: OllamaNewsAnalyzer;
  let mockLogger: jest.Mocked<ILogger>;

  beforeEach(() => {
    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      setDefaultContext: jest.fn(),
      clearDefaultContext: jest.fn(),
    } as jest.Mocked<ILogger>;

    process.env.OLLAMA_URL = "http://localhost:11434";
    process.env.OLLAMA_MODEL = "llama3";

    analyzer = new OllamaNewsAnalyzer(mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("analyzeNews", () => {
    it("deve analisar notícia com sucesso usando Ollama", async () => {
      const news = createTestNews({
        title: "Nova tecnologia de IA revoluciona medicina",
        link: "https://example.com/news/1",
      });

      const ollamaResponse = {
        data: {
          response: JSON.stringify({
            categories: ["technology", "health"],
            relevanceScore: 0.85,
            summary:
              "Sistema de IA desenvolvido para diagnóstico médico revoluciona área da saúde",
            keywords: ["inteligência artificial", "medicina", "diagnóstico"],
          }),
        },
      };

      mockedAxios.post.mockResolvedValueOnce(ollamaResponse);

      const result = await analyzer.analyzeNews(news);

      expect(result).toEqual({
        news,
        categories: [NewsCategory.TECHNOLOGY, NewsCategory.HEALTH],
        relevanceScore: 0.85,
        summary:
          "Sistema de IA desenvolvido para diagnóstico médico revoluciona área da saúde",
        keywords: ["inteligência artificial", "medicina", "diagnóstico"],
      });

      expect(mockedAxios.post).toHaveBeenCalledWith(
        "http://localhost:11434/api/generate",
        expect.objectContaining({
          model: "llama3",
          stream: false,
          format: "json",
        }),
        { timeout: 30000 }
      );

      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining("Analyzing news with Ollama")
      );
    });

    it("deve remover markdown do JSON response", async () => {
      const news = createTestNews({
        title: "Test news",
        description: "Test description",
        link: "https://example.com/test",
      });

      const ollamaResponse = {
        data: {
          response: `\`\`\`json
{
  "categories": ["technology"],
  "relevanceScore": 0.9,
  "summary": "Test summary",
  "keywords": ["test", "keyword"]
}
\`\`\``,
        },
      };

      mockedAxios.post.mockResolvedValueOnce(ollamaResponse);

      const result = await analyzer.analyzeNews(news);

      expect(result.categories).toEqual([NewsCategory.TECHNOLOGY]);
      expect(result.relevanceScore).toBe(0.9);
    });

    it("deve extrair JSON do meio do texto", async () => {
      const news = createTestNews({
        title: "Test",
        link: "https://test.com",
      });

      const ollamaResponse = {
        data: {
          response: `Aqui está a análise: {"categories": ["sports"], "relevanceScore": 0.7, "summary": "Summary", "keywords": ["sport"]} fim da resposta`,
        },
      };

      mockedAxios.post.mockResolvedValueOnce(ollamaResponse);

      const result = await analyzer.analyzeNews(news);

      expect(result.categories).toEqual([NewsCategory.SPORTS]);
      expect(result.relevanceScore).toBe(0.7);
    });

    it("deve validar categorias removendo inválidas", async () => {
      const news = createTestNews({
        title: "Test",
        link: "https://test.com",
      });

      const ollamaResponse = {
        data: {
          response: JSON.stringify({
            categories: ["technology", "invalid_category", "all"],
            relevanceScore: 0.8,
            summary: "Test",
            keywords: ["test"],
          }),
        },
      };

      mockedAxios.post.mockResolvedValueOnce(ollamaResponse);

      const result = await analyzer.analyzeNews(news);

      expect(result.categories).toEqual([NewsCategory.TECHNOLOGY]);
      expect(result.categories).not.toContain("invalid_category");
      expect(result.categories).not.toContain(NewsCategory.ALL);
    });

    it("deve limitar relevanceScore entre 0 e 1", async () => {
      const news = createTestNews({
        title: "Test",
        link: "https://test.com",
      });

      const ollamaResponse = {
        data: {
          response: JSON.stringify({
            categories: ["technology"],
            relevanceScore: 1.5,
            summary: "Test",
            keywords: ["test"],
          }),
        },
      };

      mockedAxios.post.mockResolvedValueOnce(ollamaResponse);

      const result = await analyzer.analyzeNews(news);

      expect(result.relevanceScore).toBe(1);
    });

    it("deve limitar keywords a 5 itens", async () => {
      const news = createTestNews({
        title: "Test",
        link: "https://test.com",
      });

      const ollamaResponse = {
        data: {
          response: JSON.stringify({
            categories: ["technology"],
            relevanceScore: 0.8,
            summary: "Test",
            keywords: ["k1", "k2", "k3", "k4", "k5", "k6", "k7"],
          }),
        },
      };

      mockedAxios.post.mockResolvedValueOnce(ollamaResponse);

      const result = await analyzer.analyzeNews(news);

      expect(result.keywords).toHaveLength(5);
      expect(result.keywords).toEqual(["k1", "k2", "k3", "k4", "k5"]);
    });

    it("deve usar fallback quando Ollama falha", async () => {
      const news = createTestNews({
        title: "Test news",
        description: "Test description with content",
        link: "https://test.com",
      });

      mockedAxios.post.mockRejectedValueOnce(new Error("Connection failed"));

      const result = await analyzer.analyzeNews(news);

      expect(result).toEqual({
        news,
        categories: [NewsCategory.WORLD],
        relevanceScore: 0.5,
        summary: "Test description with content",
        keywords: [],
      });

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining("Error analyzing news with Ollama")
      );
    });

    it("deve usar fallback quando JSON é inválido", async () => {
      const news = createTestNews({
        title: "Test",
        link: "https://test.com",
      });

      const ollamaResponse = {
        data: {
          response: "Invalid JSON response without brackets",
        },
      };

      mockedAxios.post.mockResolvedValueOnce(ollamaResponse);

      const result = await analyzer.analyzeNews(news);

      expect(result.categories).toEqual([NewsCategory.WORLD]);
      expect(result.relevanceScore).toBe(0.5);
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it("deve usar categoria WORLD quando nenhuma categoria válida", async () => {
      const news = createTestNews({
        title: "Test",
        link: "https://test.com",
      });

      const ollamaResponse = {
        data: {
          response: JSON.stringify({
            categories: [],
            relevanceScore: 0.6,
            summary: "Test",
            keywords: ["test"],
          }),
        },
      };

      mockedAxios.post.mockResolvedValueOnce(ollamaResponse);

      const result = await analyzer.analyzeNews(news);

      expect(result.categories).toEqual([NewsCategory.WORLD]);
    });
  });

  describe("analyzeBatch", () => {
    it("deve analisar múltiplas notícias em paralelo", async () => {
      const newsList = [
        createTestNews({
          title: "News 1",
          link: "https://test.com/1",
        }),
        createTestNews({
          title: "News 2",
          link: "https://test.com/2",
        }),
      ];

      const response1 = {
        data: {
          response: JSON.stringify({
            categories: ["technology"],
            relevanceScore: 0.8,
            summary: "Summary 1",
            keywords: ["tech"],
          }),
        },
      };

      const response2 = {
        data: {
          response: JSON.stringify({
            categories: ["sports"],
            relevanceScore: 0.7,
            summary: "Summary 2",
            keywords: ["sport"],
          }),
        },
      };

      mockedAxios.post
        .mockResolvedValueOnce(response1)
        .mockResolvedValueOnce(response2);

      const results = await analyzer.analyzeBatch(newsList);

      expect(results).toHaveLength(2);
      expect(results[0].categories).toEqual([NewsCategory.TECHNOLOGY]);
      expect(results[1].categories).toEqual([NewsCategory.SPORTS]);
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining("Analyzing batch of 2 news")
      );
    });
  });

  describe("selectBestForCategories", () => {
    it("deve selecionar notícias que batem com categorias preferidas", () => {
      const analyzedNews = [
        {
          news: { title: "Tech news" } as NewsEntity,
          categories: [NewsCategory.TECHNOLOGY],
          relevanceScore: 0.9,
          summary: "Tech",
          keywords: ["tech"],
        },
        {
          news: { title: "Sports news" } as NewsEntity,
          categories: [NewsCategory.SPORTS],
          relevanceScore: 0.8,
          summary: "Sports",
          keywords: ["sport"],
        },
        {
          news: { title: "Health news" } as NewsEntity,
          categories: [NewsCategory.HEALTH],
          relevanceScore: 0.85,
          summary: "Health",
          keywords: ["health"],
        },
      ];

      const result = analyzer.selectBestForCategories(
        analyzedNews,
        [NewsCategory.TECHNOLOGY, NewsCategory.HEALTH],
        3
      );

      expect(result).toHaveLength(2);
      expect(result[0].categories).toContain(NewsCategory.TECHNOLOGY);
      expect(result[1].categories).toContain(NewsCategory.HEALTH);
    });

    it("deve ordenar por match score quando não é ALL", () => {
      const analyzedNews = [
        {
          news: { title: "Low relevance" } as NewsEntity,
          categories: [NewsCategory.TECHNOLOGY],
          relevanceScore: 0.5,
          summary: "Low",
          keywords: ["low"],
        },
        {
          news: { title: "High relevance" } as NewsEntity,
          categories: [NewsCategory.TECHNOLOGY],
          relevanceScore: 0.95,
          summary: "High",
          keywords: ["high"],
        },
      ];

      const result = analyzer.selectBestForCategories(
        analyzedNews,
        [NewsCategory.TECHNOLOGY],
        2
      );

      expect(result[0].relevanceScore).toBeGreaterThan(
        result[1].relevanceScore
      );
    });

    it("deve retornar todas notícias quando categoria é ALL", () => {
      const analyzedNews = [
        {
          news: { title: "Tech" } as NewsEntity,
          categories: [NewsCategory.TECHNOLOGY],
          relevanceScore: 0.8,
          summary: "Tech",
          keywords: ["tech"],
        },
        {
          news: { title: "Sports" } as NewsEntity,
          categories: [NewsCategory.SPORTS],
          relevanceScore: 0.9,
          summary: "Sports",
          keywords: ["sport"],
        },
      ];

      const result = analyzer.selectBestForCategories(
        analyzedNews,
        [NewsCategory.ALL],
        5
      );

      expect(result).toHaveLength(2);
    });

    it("deve limitar resultado ao número especificado", () => {
      const analyzedNews = Array.from({ length: 10 }, (_, i) => ({
        news: { title: `News ${i}` } as NewsEntity,
        categories: [NewsCategory.TECHNOLOGY],
        relevanceScore: 0.8,
        summary: `Summary ${i}`,
        keywords: [`keyword${i}`],
      }));

      const result = analyzer.selectBestForCategories(
        analyzedNews,
        [NewsCategory.TECHNOLOGY],
        3
      );

      expect(result).toHaveLength(3);
    });
  });
});

