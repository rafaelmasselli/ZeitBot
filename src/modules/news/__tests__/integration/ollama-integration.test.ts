import "reflect-metadata";
import { OllamaNewsAnalyzer } from "../../services/ollama-news-analyzer.service";
import { ILogger } from "@/shared/logger/logger.interface";
import { NewsEntity, NewsPlatform } from "../../entities/news.entity";
import axios from "axios";

const mockLogger: ILogger = {
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
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
      console.log("✅ Ollama está rodando!");
    } catch (error) {
      isOllamaRunning = false;
      console.log("⚠️ Ollama NÃO está rodando. Testes serão pulados.");
      console.log("💡 Para rodar testes: ollama serve");
    }
  });

  describe("Análise Real com LLama3", () => {
    it.skipIf(!isOllamaRunning)(
      "deve analisar notícia de tecnologia em português",
      async () => {
        const news = createTestNews({
          title: "Nova tecnologia de inteligência artificial revoluciona diagnóstico médico",
          description: "Pesquisadores da universidade desenvolveram um sistema de IA capaz de detectar doenças com 95% de precisão em imagens médicas. A tecnologia promete revolucionar a medicina e salvar milhares de vidas.",
          link: "https://example.com/news/1",
        });

        const result = await analyzer.analyzeNews(news);

        console.log("\n📊 Resultado da Análise:");
        console.log("Categorias:", result.categories);
        console.log("Relevância:", result.relevanceScore);
        console.log("Resumo:", result.summary);
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

    it.skipIf(!isOllamaRunning)(
      "deve analisar notícia de política em português",
      async () => {
        const news = createTestNews({
          title: "Governo anuncia nova reforma tributária com mudanças no imposto",
          description: "O presidente anunciou hoje uma reforma tributária que deve simplificar o sistema de impostos no país. A proposta será enviada ao congresso na próxima semana.",
          link: "https://example.com/news/2",
        });

        const result = await analyzer.analyzeNews(news);

        console.log("\n📊 Resultado da Análise (Política):");
        console.log("Categorias:", result.categories);
        console.log("Relevância:", result.relevanceScore);

        expect(result.categories).toContain("politics");
        expect(result.summary).toBeTruthy();
      },
      60000
    );

    it.skipIf(!isOllamaRunning)(
      "deve analisar notícia em inglês",
      async () => {
        const news = createTestNews({
          title: "New AI breakthrough in cancer detection announced by researchers",
          description: "Scientists at MIT have developed a groundbreaking AI system that can detect cancer in medical scans with unprecedented accuracy. The system uses deep learning algorithms.",
          link: "https://example.com/news/3",
        });

        const result = await analyzer.analyzeNews(news);

        console.log("\n📊 Resultado da Análise (Inglês):");
        console.log("Categorias:", result.categories);
        console.log("Relevância:", result.relevanceScore);

        expect(result.categories).toBeDefined();
        expect(result.summary).toBeTruthy();
      },
      60000
    );

    it.skipIf(!isOllamaRunning)(
      "deve analisar múltiplas notícias em batch",
      async () => {
        const newsList = [
          createTestNews({
            title: "Time brasileiro vence campeonato mundial de futebol",
            description: "Brasil sagra-se campeão...",
            link: "https://example.com/1",
          }),
          createTestNews({
            title: "Bolsa de valores atinge recorde histórico",
            description: "Mercado financeiro registra alta...",
            link: "https://example.com/2",
          }),
        ];

        const results = await analyzer.analyzeBatch(newsList);

        console.log("\n📊 Análise em Batch:");
        results.forEach((result, i) => {
          console.log(`\nNotícia ${i + 1}:`);
          console.log("Categorias:", result.categories);
          console.log("Relevância:", result.relevanceScore);
        });

        expect(results).toHaveLength(2);
        expect(results[0].categories).toBeDefined();
        expect(results[1].categories).toBeDefined();
      },
      120000
    );
  });

  describe("Performance e Timeout", () => {
    it.skipIf(!isOllamaRunning)(
      "deve completar análise em menos de 30 segundos",
      async () => {
        const news = createTestNews({
          title: "Test news for performance",
          description: "Simple test description",
          link: "https://test.com",
        });

        const startTime = Date.now();
        await analyzer.analyzeNews(news);
        const duration = Date.now() - startTime;

        console.log(`\n⏱️ Tempo de análise: ${duration}ms`);

        expect(duration).toBeLessThan(30000);
      },
      35000
    );
  });

  describe("Seleção de Melhores Notícias", () => {
    it.skipIf(!isOllamaRunning)(
      "deve selecionar as melhores notícias por categoria",
      async () => {
        const newsList = [
          createTestNews({
            title: "Avanço tecnológico em inteligência artificial",
            description: "Nova IA desenvolvida...",
            link: "https://example.com/1",
          }),
          createTestNews({
            title: "Atleta brasileiro ganha medalha de ouro",
            description: "Competição olímpica...",
            link: "https://example.com/2",
          }),
          createTestNews({
            title: "Startup de tecnologia recebe investimento",
            description: "Empresa tech...",
            link: "https://example.com/3",
          }),
        ];

        const analyzed = await analyzer.analyzeBatch(newsList);
        const selected = analyzer.selectBestForCategories(
          analyzed,
          ["technology"],
          2
        );

        console.log("\n🎯 Notícias Selecionadas (Technology):");
        selected.forEach((result, i) => {
          console.log(`${i + 1}. ${result.news.title}`);
          console.log("   Categorias:", result.categories);
          console.log("   Score:", result.relevanceScore);
        });

        expect(selected.length).toBeLessThanOrEqual(2);
        expect(selected.every((s) => s.categories.includes("technology"))).toBe(
          true
        );
      },
      120000
    );
  });
});

if (!isOllamaRunning) {
  console.log("\n════════════════════════════════════════════");
  console.log("⚠️  OLLAMA NÃO ESTÁ RODANDO");
  console.log("════════════════════════════════════════════");
  console.log("\nPara rodar os testes de integração:");
  console.log("1. Abra um terminal e execute: ollama serve");
  console.log("2. Rode os testes novamente: npm test");
  console.log("\nTestes unitários continuam funcionando! ✅");
  console.log("════════════════════════════════════════════\n");
}

