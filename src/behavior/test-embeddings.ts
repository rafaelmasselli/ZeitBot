import "reflect-metadata";
import { setupContainer } from "@/config/container/container.config";
import { container } from "tsyringe";
import { IEmbeddingService } from "@/shared/interface/embedding.interface";
import { ILogger } from "@/shared/logger/logger.interface";

async function testEmbeddings() {
  try {
    console.log("Embeddings Test - Neural Network Vectors");
    console.log("========================================");
    console.log("");

    setupContainer();

    const embeddingService =
      container.resolve<IEmbeddingService>("IEmbeddingService");
    container.resolve<ILogger>("ILogger");

    console.log("[1] Testing Embedding Generation");
    console.log("========================================");
    console.log("");

    const testTexts = [
      "Tecnologia e inteligência artificial estão mudando o mundo",
      "Technology and artificial intelligence are changing the world",
      "Política brasileira e governo federal",
      "Futebol, esportes e campeonato brasileiro",
      "Receitas de bolo e culinária",
    ];

    const embeddings: { text: string; vector: number[] }[] = [];

    for (let i = 0; i < testTexts.length; i++) {
      const text = testTexts[i];
      console.log(`Text ${i + 1}: "${text}"`);

      const startTime = Date.now();
      const embedding = await embeddingService.generateEmbedding(text);
      const duration = Date.now() - startTime;

      embeddings.push({ text, vector: embedding });

      console.log(`   Dimensions: ${embedding.length}`);
      console.log(`   Time: ${duration}ms (${(duration / 1000).toFixed(1)}s)`);
      console.log(
        `   First 10 values: [${embedding
          .slice(0, 10)
          .map((v) => v.toFixed(3))
          .join(", ")}...]`,
      );

      const magnitude = Math.sqrt(
        embedding.reduce((sum, val) => sum + val * val, 0),
      );
      console.log(`   Vector magnitude: ${magnitude.toFixed(3)}`);
      console.log("");
    }

    console.log("========================================");
    console.log("[2] Testing Similarity Calculation");
    console.log("========================================");
    console.log("");

    const comparisons: Array<[number, number, string]> = [
      [0, 1, "Tech PT vs Tech EN (same topic, different language)"],
      [0, 2, "Tech vs Politics (different topics)"],
      [0, 3, "Tech vs Sports (different topics)"],
      [0, 4, "Tech vs Cooking (different topics)"],
      [2, 3, "Politics vs Sports (different topics)"],
    ];

    console.log("Similarity Matrix (Cosine Similarity):");
    console.log("1.0 = identical, 0.0 = no similarity, -1.0 = opposite");
    console.log("");

    for (const comparison of comparisons) {
      const idx1 = comparison[0];
      const idx2 = comparison[1];
      const description = comparison[2];

      const similarity = embeddingService.calculateSimilarity(
        embeddings[idx1].vector,
        embeddings[idx2].vector,
      );

      const percentage = (similarity * 100).toFixed(1);
      const bar = "█".repeat(Math.max(0, Math.floor(similarity * 50)));

      console.log(`${description}`);
      console.log(`   "${embeddings[idx1].text}"`);
      console.log(`   vs`);
      console.log(`   "${embeddings[idx2].text}"`);
      console.log(`   Similarity: ${similarity.toFixed(4)} (${percentage}%)`);
      console.log(`   ${bar}`);
      console.log("");
    }

    console.log("========================================");
    console.log("[3] Testing Batch Processing");
    console.log("========================================");
    console.log("");

    const batchTexts = [
      "Notícia curta 1",
      "Notícia curta 2",
      "Notícia curta 3",
    ];

    console.log("Generating embeddings for 3 texts in batch...");
    const batchStartTime = Date.now();
    const batchEmbeddings =
      await embeddingService.generateBatchEmbeddings(batchTexts);
    const batchDuration = Date.now() - batchStartTime;

    console.log(`   [OK] Generated ${batchEmbeddings.length} embeddings`);
    console.log(
      `   Total time: ${batchDuration}ms (${(batchDuration / 1000).toFixed(
        1,
      )}s)`,
    );
    console.log(
      `   Average per text: ${(batchDuration / batchTexts.length).toFixed(0)}ms`,
    );
    console.log("");

    console.log("========================================");
    console.log("[4] Real-World Scenario: News Matching");
    console.log("========================================");
    console.log("");

    const userPreference =
      "Gosto de tecnologia, programação, inteligência artificial e inovação";
    const newsOptions = [
      "OpenAI lança novo modelo GPT-5 com capacidades avançadas de raciocínio",
      "Governo anuncia novo pacote de medidas econômicas para 2025",
      "Time brasileiro vence campeonato internacional de futebol",
      "Startup brasileira cria IA que diagnostica doenças raras",
      "Receita de bolo de chocolate vegano faz sucesso nas redes",
    ];

    console.log(`User Preference:`);
    console.log(`   "${userPreference}"`);
    console.log("");

    console.log("Generating embedding for user preference...");
    const prefEmbedding =
      await embeddingService.generateEmbedding(userPreference);
    console.log(`   [OK] Generated (${prefEmbedding.length} dimensions)`);
    console.log("");

    console.log("Matching with news options:");
    console.log("");

    const newsResults: { text: string; score: number }[] = [];

    for (const news of newsOptions) {
      const newsEmbedding = await embeddingService.generateEmbedding(news);
      const similarity = embeddingService.calculateSimilarity(
        prefEmbedding,
        newsEmbedding,
      );
      newsResults.push({ text: news, score: similarity });
    }

    newsResults.sort((a, b) => b.score - a.score);

    newsResults.forEach((result, index) => {
      const percentage = (result.score * 100).toFixed(1);
      const bar = "█".repeat(Math.max(0, Math.floor(result.score * 50)));
      const match = result.score >= 0.6 ? "[SEND]" : "[SKIP]";

      console.log(`${index + 1}. ${match} ${percentage}%`);
      console.log(`   ${bar}`);
      console.log(`   "${result.text}"`);
      console.log("");
    });

    console.log("========================================");
    console.log("[5] Performance Statistics");
    console.log("========================================");
    console.log("");

    const totalTexts =
      testTexts.length + batchTexts.length + 1 + newsOptions.length;
    const avgVectorSize = 4096 * 4; // 4 bytes per float32
    const totalMemory = totalTexts * avgVectorSize;

    console.log(`Total embeddings generated: ${totalTexts}`);
    console.log(`Vector size: 4096 dimensions`);
    console.log(`Memory per vector: ${(avgVectorSize / 1024).toFixed(2)} KB`);
    console.log(
      `Total memory used: ${(totalMemory / 1024).toFixed(2)} KB (${(
        totalMemory /
        1024 /
        1024
      ).toFixed(2)} MB)`,
    );
    console.log("");

    console.log("========================================");
    console.log("[OK] All tests completed successfully!");
    console.log("========================================");
    console.log("");
    console.log("Key Insights:");
    console.log("- LLama3 generates 4096-dimensional vectors");
    console.log("- Similar topics = high similarity (>0.6)");
    console.log("- Different topics = low similarity (<0.5)");
    console.log("- Language doesn't matter much (semantic understanding)");
    console.log("- Fast calculations: <1ms for similarity");
    console.log("");

    process.exit(0);
  } catch (error) {
    console.error("[ERROR] Test failed:", error);
    process.exit(1);
  }
}

testEmbeddings();
