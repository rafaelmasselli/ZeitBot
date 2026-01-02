import "reflect-metadata";
import { CategoriesAIService } from "../../features/categories/services/categories-ai.service";
import { ILogger } from "@/shared/logger/logger.interface";
import { PromptTemplateService } from "@/shared/services/prompt-template.service";
import { CategoriesVectorService } from "../../features/categories/services/categories-vector.service";
import { NewsCategory, UserLanguage } from "@/shared/entities/user.entity";
import axios from "axios";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("CategoriesAIService", () => {
  let service: CategoriesAIService;
  let mockLogger: jest.Mocked<ILogger>;
  let mockPromptService: jest.Mocked<PromptTemplateService>;
  let mockVectorService: jest.Mocked<CategoriesVectorService>;

  beforeEach(() => {
    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      setDefaultContext: jest.fn(),
    } as any;

    mockPromptService = {
      loadPrompt: jest.fn(),
      buildPrompt: jest.fn(),
    } as any;

    mockVectorService = {
      detectLanguage: jest.fn(),
      matchCategories: jest.fn(),
      initialize: jest.fn(),
    } as any;

    process.env.OLLAMA_URL = "http://localhost:11434";
    process.env.OLLAMA_MODEL = "llama3";
    process.env.USE_VECTOR_MATCHING = "false";

    service = new CategoriesAIService(
      mockLogger,
      mockPromptService,
      mockVectorService
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("extractCategoriesAndLanguage", () => {
    describe("when using vector matching", () => {
      beforeEach(() => {
        process.env.USE_VECTOR_MATCHING = "true";
        service = new CategoriesAIService(
          mockLogger,
          mockPromptService,
          mockVectorService
        );
      });

      it("should use vector service for category matching", async () => {
        const userMessage = "I like technology and AI";
        mockVectorService.detectLanguage.mockReturnValue(UserLanguage.ENGLISH);
        mockVectorService.matchCategories.mockResolvedValue([
          NewsCategory.TECHNOLOGY,
        ]);

        const result = await service.extractCategoriesAndLanguage(userMessage);

        expect(mockVectorService.detectLanguage).toHaveBeenCalledWith(
          userMessage
        );
        expect(mockVectorService.matchCategories).toHaveBeenCalledWith(
          userMessage,
          0.5
        );
        expect(result).toEqual({
          categories: [NewsCategory.TECHNOLOGY],
          language: UserLanguage.ENGLISH,
        });
      });

      it("should handle multiple categories", async () => {
        const userMessage = "Gosto de tecnologia, esportes e política";
        mockVectorService.detectLanguage.mockReturnValue(
          UserLanguage.PORTUGUESE
        );
        mockVectorService.matchCategories.mockResolvedValue([
          NewsCategory.TECHNOLOGY,
          NewsCategory.SPORTS,
          NewsCategory.POLITICS,
        ]);

        const result = await service.extractCategoriesAndLanguage(userMessage);

        expect(result.categories).toHaveLength(3);
        expect(result.language).toBe(UserLanguage.PORTUGUESE);
      });

      it("should return empty categories on error", async () => {
        const userMessage = "Test message";
        mockVectorService.detectLanguage.mockReturnValue(
          UserLanguage.PORTUGUESE
        );
        mockVectorService.matchCategories.mockRejectedValue(
          new Error("Vector service error")
        );

        const result = await service.extractCategoriesAndLanguage(userMessage);

        expect(result.categories).toEqual([]);
        expect(result.language).toBe(UserLanguage.PORTUGUESE);
        expect(mockLogger.error).toHaveBeenCalled();
      });
    });

    describe("when using LLM extraction", () => {
      beforeEach(() => {
        process.env.USE_VECTOR_MATCHING = "false";
        service = new CategoriesAIService(
          mockLogger,
          mockPromptService,
          mockVectorService
        );
      });

      it("should extract categories using Ollama", async () => {
        const userMessage = "I want technology news";
        const ollamaResponse = {
          data: {
            response: JSON.stringify({
              categories: ["technology"],
              language: "english",
            }),
          },
        };

        mockVectorService.detectLanguage.mockReturnValue(UserLanguage.ENGLISH);
        mockPromptService.loadPrompt.mockReturnValue({
          categories: { technology: {}, politics: {} },
          system: "System prompt",
          rules: "Rules",
        } as any);
        mockPromptService.buildPrompt.mockReturnValue("Built prompt");
        mockedAxios.post.mockResolvedValue(ollamaResponse);

        const result = await service.extractCategoriesAndLanguage(userMessage);

        expect(mockedAxios.post).toHaveBeenCalledWith(
          "http://localhost:11434/api/generate",
          expect.objectContaining({
            model: "llama3",
            prompt: "Built prompt",
            stream: false,
          }),
          expect.any(Object)
        );
        expect(result.categories).toContain(NewsCategory.TECHNOLOGY);
      });

      it("should handle JSON wrapped in markdown code blocks", async () => {
        const userMessage = "Politics and economy";
        const ollamaResponse = {
          data: {
            response: "```json\n" +
              JSON.stringify({
                categories: ["politics", "economy"],
                language: "english",
              }) +
              "\n```",
          },
        };

        mockVectorService.detectLanguage.mockReturnValue(UserLanguage.ENGLISH);
        mockPromptService.loadPrompt.mockReturnValue({
          categories: {},
          system: "",
          rules: "",
        } as any);
        mockPromptService.buildPrompt.mockReturnValue("Prompt");
        mockedAxios.post.mockResolvedValue(ollamaResponse);

        const result = await service.extractCategoriesAndLanguage(userMessage);

        expect(result.categories).toContain(NewsCategory.POLITICS);
        expect(result.categories).toContain(NewsCategory.ECONOMY);
      });

      it("should filter out invalid categories", async () => {
        const userMessage = "Test";
        const ollamaResponse = {
          data: {
            response: JSON.stringify({
              categories: ["technology", "invalid_category", "sports"],
              language: "english",
            }),
          },
        };

        mockVectorService.detectLanguage.mockReturnValue(UserLanguage.ENGLISH);
        mockPromptService.loadPrompt.mockReturnValue({
          categories: {},
        } as any);
        mockPromptService.buildPrompt.mockReturnValue("Prompt");
        mockedAxios.post.mockResolvedValue(ollamaResponse);

        const result = await service.extractCategoriesAndLanguage(userMessage);

        expect(result.categories).toContain(NewsCategory.TECHNOLOGY);
        expect(result.categories).toContain(NewsCategory.SPORTS);
        expect(result.categories).not.toContain("invalid_category");
      });

      it("should return only 'all' if present in categories", async () => {
        const userMessage = "All categories please";
        const ollamaResponse = {
          data: {
            response: JSON.stringify({
              categories: ["technology", "all", "sports"],
              language: "english",
            }),
          },
        };

        mockVectorService.detectLanguage.mockReturnValue(UserLanguage.ENGLISH);
        mockPromptService.loadPrompt.mockReturnValue({
          categories: {},
        } as any);
        mockPromptService.buildPrompt.mockReturnValue("Prompt");
        mockedAxios.post.mockResolvedValue(ollamaResponse);

        const result = await service.extractCategoriesAndLanguage(userMessage);

        expect(result.categories).toEqual([NewsCategory.ALL]);
      });

      it("should validate and normalize language", async () => {
        const testCases = [
          { input: "PORTUGUESE", expected: UserLanguage.PORTUGUESE },
          { input: "English", expected: UserLanguage.ENGLISH },
          { input: "spanish", expected: UserLanguage.SPANISH },
          { input: "invalid_lang", expected: UserLanguage.PORTUGUESE },
        ];

        for (const testCase of testCases) {
          const ollamaResponse = {
            data: {
              response: JSON.stringify({
                categories: ["technology"],
                language: testCase.input,
              }),
            },
          };

          mockVectorService.detectLanguage.mockReturnValue(
            UserLanguage.PORTUGUESE
          );
          mockPromptService.loadPrompt.mockReturnValue({
            categories: {},
          } as any);
          mockPromptService.buildPrompt.mockReturnValue("Prompt");
          mockedAxios.post.mockResolvedValue(ollamaResponse);

          const result = await service.extractCategoriesAndLanguage("Test");

          expect(result.language).toBe(UserLanguage.PORTUGUESE);
        }
      });

      it("should handle malformed JSON response", async () => {
        const userMessage = "Test";
        const ollamaResponse = {
          data: {
            response: "This is not JSON at all",
          },
        };

        mockVectorService.detectLanguage.mockReturnValue(
          UserLanguage.PORTUGUESE
        );
        mockPromptService.loadPrompt.mockReturnValue({
          categories: {},
        } as any);
        mockPromptService.buildPrompt.mockReturnValue("Prompt");
        mockedAxios.post.mockResolvedValue(ollamaResponse);

        const result = await service.extractCategoriesAndLanguage(userMessage);

        expect(result.categories).toEqual([]);
        expect(result.language).toBe(UserLanguage.PORTUGUESE);
      });

      it("should handle network errors gracefully", async () => {
        const userMessage = "Test";
        mockVectorService.detectLanguage.mockReturnValue(
          UserLanguage.PORTUGUESE
        );
        mockPromptService.loadPrompt.mockReturnValue({
          categories: {},
        } as any);
        mockPromptService.buildPrompt.mockReturnValue("Prompt");
        mockedAxios.post.mockRejectedValue(new Error("Network error"));

        const result = await service.extractCategoriesAndLanguage(userMessage);

        expect(result.categories).toEqual([]);
        expect(result.language).toBe(UserLanguage.PORTUGUESE);
        expect(mockLogger.error).toHaveBeenCalled();
      });

      it("should use correct Ollama configuration", async () => {
        process.env.OLLAMA_URL = "http://custom:8080";
        process.env.OLLAMA_MODEL = "custom-model";

        service = new CategoriesAIService(
          mockLogger,
          mockPromptService,
          mockVectorService
        );

        const userMessage = "Test";
        const ollamaResponse = {
          data: {
            response: JSON.stringify({
              categories: ["technology"],
              language: "english",
            }),
          },
        };

        mockVectorService.detectLanguage.mockReturnValue(UserLanguage.ENGLISH);
        mockPromptService.loadPrompt.mockReturnValue({
          categories: {},
        } as any);
        mockPromptService.buildPrompt.mockReturnValue("Prompt");
        mockedAxios.post.mockResolvedValue(ollamaResponse);

        await service.extractCategoriesAndLanguage(userMessage);

        expect(mockedAxios.post).toHaveBeenCalledWith(
          "http://custom:8080/api/generate",
          expect.objectContaining({
            model: "custom-model",
          }),
          expect.any(Object)
        );
      });
    });
  });

  describe("edge cases", () => {
    beforeEach(() => {
      process.env.USE_VECTOR_MATCHING = "true";
      service = new CategoriesAIService(
        mockLogger,
        mockPromptService,
        mockVectorService
      );
    });

    it("should handle empty user message", async () => {
      mockVectorService.detectLanguage.mockReturnValue(UserLanguage.PORTUGUESE);
      mockVectorService.matchCategories.mockResolvedValue([]);

      const result = await service.extractCategoriesAndLanguage("");

      expect(result.categories).toEqual([]);
      expect(result.language).toBe(UserLanguage.PORTUGUESE);
    });

    it("should handle very long user messages", async () => {
      const longMessage = "technology ".repeat(1000);
      mockVectorService.detectLanguage.mockReturnValue(UserLanguage.ENGLISH);
      mockVectorService.matchCategories.mockResolvedValue([
        NewsCategory.TECHNOLOGY,
      ]);

      const result = await service.extractCategoriesAndLanguage(longMessage);

      expect(result.categories).toContain(NewsCategory.TECHNOLOGY);
      expect(result.language).toBe(UserLanguage.ENGLISH);
    });

    it("should handle special characters in message", async () => {
      const specialMessage = "Tecnología & política! 🚀 @#$%";
      mockVectorService.detectLanguage.mockReturnValue(UserLanguage.SPANISH);
      mockVectorService.matchCategories.mockResolvedValue([
        NewsCategory.TECHNOLOGY,
        NewsCategory.POLITICS,
      ]);

      const result = await service.extractCategoriesAndLanguage(specialMessage);

      expect(result.categories).toHaveLength(2);
      expect(result.language).toBe(UserLanguage.SPANISH);
    });
  });
});

