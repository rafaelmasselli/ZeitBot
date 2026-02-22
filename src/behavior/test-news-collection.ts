import "reflect-metadata";
import { setupContainer } from "@/config/container/container.config";
import { container } from "tsyringe";
import { GetNewsUseCase } from "@/modules/news/features/storage/use-cases/get-news.use-case";

async function testNewsCollection() {
  try {
    console.log("Real-time news collection test – no DB writes");
    console.log("════════════════════════════════════════════════════════");
    console.log("");

    setupContainer();

    const getNewsUseCase = container.resolve(GetNewsUseCase);

    console.log("[1] Fetching news from all providers...");
    console.log("    (BBC, Brazil Indeed, etc. – may take a few seconds)");
    console.log("");

    const news = await getNewsUseCase.execute();

    const byPlatform = news.reduce<Record<string, number>>((acc, n) => {
      const platform = n.enterprise || "UNKNOWN";
      acc[platform] = (acc[platform] || 0) + 1;
      return acc;
    }, {});

    console.log("[2] Result");
    console.log("    Total news items:", news.length);
    console.log("");
    console.log("    By provider:");
    Object.entries(byPlatform).forEach(([platform, count]) => {
      console.log(`      - ${platform}: ${count}`);
    });
    console.log("");

    if (news.length > 0) {
      const samplePerProvider = 3;
      const platforms = Object.keys(byPlatform);
      console.log("[3] Sample per provider (up to 3 items each)");
      console.log("────────────────────────────────────────────────────────");
      for (const platform of platforms) {
        const items = news.filter(
          (n) => (n.enterprise || "UNKNOWN") === platform,
        );
        console.log(`\n  --- ${platform} (${items.length} total) ---`);
        items.slice(0, samplePerProvider).forEach((n, i) => {
          console.log(`  ${i + 1}. ${n.title}`);
          console.log(`     Link: ${n.link}`);
          if (n.description) {
            const desc =
              n.description.length > 80
                ? n.description.slice(0, 80) + "..."
                : n.description;
            console.log(`     Desc: ${desc}`);
          }
          console.log("");
        });
      }
    }

    console.log("════════════════════════════════════════════════════════");
    console.log("Test completed successfully. Nothing was saved to the DB.");
    process.exit(0);
  } catch (error) {
    console.error("Collection test error:", (error as Error).message);
    console.error((error as Error).stack);
    process.exit(1);
  }
}

testNewsCollection();
