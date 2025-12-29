import "reflect-metadata";
import { setupContainer } from "@/config/container/container.config";
import { container } from "tsyringe";
import { DatabaseService } from "@/config/database/connect";
import { INewsRepository } from "@/modules/news/interfaces/news.repository.interface";
import { ISubscriberRepository } from "@/modules/whatsapp/interfaces/subscriber.repository.interface";
import { NewsRecommendationService } from "@/shared/services/news-recommendation.service";
import { ILogger } from "@/shared/logger/logger.interface";
import {
  SubscriberEntity,
  NewsCategory,
} from "@/modules/whatsapp/entities/subscriber.entity";

async function testAIRecommendations() {
  try {
    console.log("AI Recommendations System Test");
    console.log("========================================");
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
    const subscriberRepository = container.resolve<ISubscriberRepository>(
      "ISubscriberRepository"
    );
    const recommendationService = container.resolve(NewsRecommendationService);

    console.log("[2] Creating test subscriber...");
    const testSubscriber: SubscriberEntity = {
      phone_number: "5511999999999",
      name: "Test User",
      preferred_categories: [NewsCategory.TECHNOLOGY],
      preferences_description:
        "Gosto de notícias sobre política, justiça, governo, STF, Alexandre de Moraes, Donald Trump, e acontecimentos do Brasil e do mundo.",
      is_active: true,
      preferred_hour: 8,
      similarity_threshold: 0.5,
      created_at: new Date(),
      updated_at: new Date(),
    };

    console.log("   Generating embedding for preferences...");
    const embedding = await recommendationService.generatePreferencesEmbedding(
      testSubscriber.preferences_description!
    );
    testSubscriber.preferences_embedding = embedding;
    console.log(`   [OK] Embedding generated (${embedding.length} dimensions)`);
    console.log("");

    console.log("[3] Fetching news with embeddings...");
    const allNews = await newsRepository.findAll();
    const newsWithEmbeddings = allNews.filter(
      (news) => news.content_embedding && news.content_embedding.length > 0
    );

    if (newsWithEmbeddings.length === 0) {
      console.log("   [!] No news with embeddings found!");
      console.log("   [i] Run the news embeddings job first:");
      console.log("       npm run dev");
      process.exit(0);
    }

    console.log(
      `   [OK] Found ${newsWithEmbeddings.length} news with embeddings`
    );
    console.log("");

    console.log("[4] Calculating recommendations...");
    const startTime = Date.now();
    const recommendations =
      await recommendationService.recommendNewsForSubscriber(
        testSubscriber,
        newsWithEmbeddings
      );
    const duration = Date.now() - startTime;

    console.log(`   [OK] Processed in ${duration}ms`);
    console.log(
      `   [OK] Found ${recommendations.length} recommendations (threshold: ${testSubscriber.similarity_threshold})`
    );
    console.log("");

    console.log("[5] Top Recommendations:");
    console.log("========================================");
    console.log("");

    const topRecommendations = recommendations.slice(0, 5);

    if (topRecommendations.length === 0) {
      console.log("   [!] No recommendations match the threshold");
      console.log("   [i] Try lowering the similarity_threshold");
    } else {
      topRecommendations.forEach((rec, index) => {
        const scorePercent = (rec.similarityScore * 100).toFixed(1);
        console.log(`${index + 1}. ${rec.news.title}`);
        console.log(`   Match: ${scorePercent}%`);
        console.log(`   Link: ${rec.news.link}`);
        if (rec.news.news_summary) {
          console.log(
            `   Summary: ${rec.news.news_summary.substring(0, 80)}...`
          );
        }
        console.log("");
      });
    }

    console.log("========================================");
    console.log("[6] Formatted WhatsApp Message:");
    console.log("========================================");
    console.log("");

    const message =
      recommendationService.formatRecommendationMessage(recommendations);
    console.log(message);

    console.log("========================================");
    console.log("[OK] Test completed successfully!");
    console.log("========================================");

    await databaseService.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("[ERROR] Test failed:", error);
    process.exit(1);
  }
}

testAIRecommendations();
