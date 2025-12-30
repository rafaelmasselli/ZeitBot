import "reflect-metadata";
import { OllamaNewsAnalyzer } from "../../services/ollama-news-analyzer.service";
import { ILogger } from "@/shared/logger/logger.interface";
import { NewsEntity, NewsPlatform } from "../../entities/news.entity";
import axios from "axios";
import { NewsCategory } from "@/modules/whatsapp/entities/subscriber.entity";

const mockLogger: ILogger = {
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  setDefaultContext: jest.fn(),
  clearDefaultContext: jest.fn(),
};

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

describe("Ollama Integration Test (Real)", () => {
  let analyzer: OllamaNewsAnalyzer;
  let isOllamaRunning: boolean;

  beforeAll(async () => {
    process.env.OLLAMA_URL = "http://localhost:11434";
    process.env.OLLAMA_MODEL = "llama3";

    analyzer = new OllamaNewsAnalyzer(mockLogger);

    try {
      await axios.get("http://localhost:11434");
      isOllamaRunning = true;
      console.log("[OK] Ollama is running!");
    } catch (error) {
      isOllamaRunning = false;
      console.log("[WARN] Ollama is NOT running. Tests will be skipped.");
      console.log("[INFO] To run tests: ollama serve");
    }
  });

  describe("Real Analysis with LLama3", () => {
    (isOllamaRunning ? it : it.skip)(
      "should analyze technology news in Portuguese",
      async () => {
        const news = createTestNews({
          title:
            "Nova tecnologia de inteligência artificial revoluciona diagnóstico médico",
          description:
            "Pesquisadores da universidade desenvolveram um sistema de IA capaz de detectar doenças com 95% de precisão em imagens médicas. A tecnologia promete revolucionar a medicina e salvar milhares de vidas.",
          link: "https://example.com/news/1",
        });

        const result = await analyzer.analyzeNews(news);

        console.log("\n[TEST] Analysis Result:");
        console.log("Categories:", result.categories);
        console.log("Relevance:", result.relevanceScore);
        console.log("Summary:", result.summary);
        console.log("Keywords:", result.keywords);

        expect(result.categories).toBeDefined();
        expect(result.categories.length).toBeGreaterThan(0);
        expect(result.relevanceScore).toBeGreaterThan(0);
        expect(result.relevanceScore).toBeLessThanOrEqual(1);
        expect(result.summary).toBeTruthy();
        expect(result.keywords).toBeDefined();
      },
      60000
    );

    (isOllamaRunning ? it : it.skip)(
      "should analyze politics news in Portuguese",
      async () => {
        const news = createTestNews({
          title:
            "Governo anuncia nova reforma tributária com mudanças no imposto",
          description:
            "O presidente anunciou hoje uma reforma tributária que deve simplificar o sistema de impostos no país. A proposta será enviada ao congresso na próxima semana.",
          link: "https://example.com/news/2",
        });

        const result = await analyzer.analyzeNews(news);

        console.log("\n[TEST] Analysis Result (Politics):");
        console.log("Categories:", result.categories);
        console.log("Relevance:", result.relevanceScore);

        expect(result.categories).toContain("politics");
        expect(result.summary).toBeTruthy();
      },
      60000
    );

    (isOllamaRunning ? it : it.skip)(
      "should analyze news in English",
      async () => {
        const news = createTestNews({
          title:
            "New AI breakthrough in cancer detection announced by researchers",
          description:
            "Scientists at MIT have developed a groundbreaking AI system that can detect cancer in medical scans with unprecedented accuracy. The system uses deep learning algorithms.",
          link: "https://example.com/news/3",
        });

        const result = await analyzer.analyzeNews(news);

        console.log("\n[TEST] Analysis Result (English):");
        console.log("Categories:", result.categories);
        console.log("Relevance:", result.relevanceScore);

        expect(result.categories).toBeDefined();
        expect(result.summary).toBeTruthy();
      },
      60000
    );

    (isOllamaRunning ? it : it.skip)(
      "should analyze multiple news in batch",
      async () => {
        const newsList = [
          createTestNews({
            title: "Brazilian team wins world football championship",
            description: "Brazil crowned champion...",
            link: "https://example.com/1",
          }),
          createTestNews({
            title: "Stock market reaches historic record",
            description: "Financial market registers high...",
            link: "https://example.com/2",
          }),
        ];

        const results = await analyzer.analyzeBatch(newsList);

        console.log("\n[TEST] Batch Analysis:");
        results.forEach((result, i) => {
          console.log(`\nNews ${i + 1}:`);
          console.log("Categories:", result.categories);
          console.log("Relevance:", result.relevanceScore);
        });

        expect(results).toHaveLength(2);
        expect(results[0].categories).toBeDefined();
        expect(results[1].categories).toBeDefined();
      },
      120000
    );
  });

  describe("Performance and Timeout", () => {
    (isOllamaRunning ? it : it.skip)(
      "should complete analysis in less than 30 seconds",
      async () => {
        const news = createTestNews({
          title: "Test news for performance",
          description: "Simple test description",
          link: "https://test.com",
        });

        const startTime = Date.now();
        await analyzer.analyzeNews(news);
        const duration = Date.now() - startTime;

        console.log(`\n[PERF] Analysis time: ${duration}ms`);

        expect(duration).toBeLessThan(30000);
      },
      35000
    );
  });

  describe("Best News Selection", () => {
    (isOllamaRunning ? it : it.skip)(
      "should select best news by category",
      async () => {
        const newsList = [
          createTestNews({
            title: "Technological advancement in artificial intelligence",
            description: "New AI developed...",
            link: "https://example.com/1",
          }),
          createTestNews({
            title: "Brazilian athlete wins gold medal",
            description: "Olympic competition...",
            link: "https://example.com/2",
          }),
          createTestNews({
            title: "Technology startup receives investment",
            description: "Tech company...",
            link: "https://example.com/3",
          }),
        ];

        const analyzed = await analyzer.analyzeBatch(newsList);
        const selected = analyzer.selectBestForCategories(
          analyzed,
          [NewsCategory.TECHNOLOGY],
          2
        );

        console.log("\n[TEST] Selected News (Technology):");
        selected.forEach((result, i) => {
          console.log(`${i + 1}. ${result.news.title}`);
          console.log("   Categories:", result.categories);
          console.log("   Score:", result.relevanceScore);
        });

        expect(selected.length).toBeLessThanOrEqual(2);
        expect(
          selected.every((s) => s.categories.includes(NewsCategory.TECHNOLOGY))
        ).toBe(true);
      },
      120000
    );
  });

  afterAll(() => {
    if (!isOllamaRunning) {
      console.log("\n════════════════════════════════════════════");
      console.log("[WARN] OLLAMA IS NOT RUNNING");
      console.log("════════════════════════════════════════════");
      console.log("\nTo run integration tests:");
      console.log("1. Open a terminal and run: ollama serve");
      console.log("2. Run tests again: npm test");
      console.log("\nUnit tests still working!");
      console.log("════════════════════════════════════════════\n");
    }
  });
});
