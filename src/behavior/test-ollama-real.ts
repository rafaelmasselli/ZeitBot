import "reflect-metadata";
import { setupContainer } from "@/config/container/container.config";
import { container } from "tsyringe";
import { DatabaseService } from "@/config/database/connect";
import { INewsRepository } from "@/modules/news/interfaces/news.repository.interface";
import { OllamaNewsAnalyzer } from "@/modules/news/services/ollama-news-analyzer.service";
import { ILogger } from "@/shared/logger/logger.interface";

async function testOllamaWithRealNews() {
  try {
    console.log("Ollama/LLama3 Real Test");
    console.log("════════════════════════════════════════");
    console.log("");

    setupContainer();

    const logger = container.resolve<ILogger>("ILogger");
    const databaseService = container.resolve(DatabaseService);

    console.log("[1] Connecting to MongoDB...");
    await databaseService.connect();
    console.log("   [OK] Connected!");
    console.log("");

    const newsRepository =
      container.resolve<INewsRepository>("INewsRepository");

    console.log("[2] Fetching latest news from database...");
    const allNews = await newsRepository.findAll();

    if (allNews.length === 0) {
      console.log("   [!] No news found in database!");
      console.log("   [i] Run the news job first: npm run dev");
      process.exit(0);
    }

    const latestNews = allNews.slice(0, 3);
    console.log(`   [OK] ${latestNews.length} news found!`);
    console.log("");

    console.log("[3] Analyzing with Ollama/LLama3...");
    console.log("   (This may take a few seconds...)");
    console.log("");

    const analyzer = new OllamaNewsAnalyzer(logger);

    for (let i = 0; i < latestNews.length; i++) {
      const news = latestNews[i];

      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`News ${i + 1}/${latestNews.length}`);
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log("");
      console.log(`Title:`);
      console.log(`   ${news.title}`);
      console.log("");
      console.log(`Description:`);
      console.log(`   ${news.description?.substring(0, 150)}...`);
      console.log("");
      console.log(`Link: ${news.link}`);
      console.log("");

      console.log("Sending to LLama3...");

      const startTime = Date.now();
      const result = await analyzer.analyzeNews(news);
      const duration = Date.now() - startTime;

      console.log(
        `   Time: ${duration}ms (${(duration / 1000).toFixed(1)}s)`
      );
      console.log("");

      console.log("Analysis Result:");
      console.log("");
      console.log(`   Categories:`);
      console.log(`      ${result.categories.join(", ")}`);
      console.log("");
      console.log(`   Relevance Score:`);
      console.log(`      ${(result.relevanceScore * 100).toFixed(1)}%`);
      console.log("");
      console.log(`   Summary:`);
      console.log(`      ${result.summary}`);
      console.log("");
      console.log(`   Keywords:`);
      console.log(`      ${result.keywords.join(", ")}`);
      console.log("");
    }

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("[OK] Test completed successfully!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    await databaseService.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("[ERROR] Test error:", error);
    process.exit(1);
  }
}

testOllamaWithRealNews();
