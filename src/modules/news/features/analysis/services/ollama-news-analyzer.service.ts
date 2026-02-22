import { injectable, inject } from "tsyringe";
import axios from "axios";
import { ILogger } from "@/shared/logger/logger.interface";
import {
  INewsAnalyzer,
  NewsAnalysisResult,
} from "@/modules/news/interfaces/news-analyzer.interface";
import { NewsEntity } from "@/modules/news/entities/news.entity";
import { NewsCategory } from "@/shared/entities/user.entity";

@injectable()
export class OllamaNewsAnalyzer implements INewsAnalyzer {
  private baseURL: string;
  private model: string;

  constructor(@inject("ILogger") private readonly logger: ILogger) {
    this.baseURL = process.env.OLLAMA_URL || "http://localhost:11434";
    this.model = process.env.OLLAMA_MODEL || "llama3";
  }

  async analyzeNews(news: NewsEntity): Promise<NewsAnalysisResult> {
    try {
      this.logger.info(`Analyzing news with Ollama: ${news.title}`);

      const prompt = this.buildAnalysisPrompt(news);

      const response = await axios.post(
        `${this.baseURL}/api/generate`,
        {
          model: this.model,
          prompt: prompt,
          stream: false,
          format: "json",
        },
        { timeout: 30000 }
      );

      const analysis = this.parseAnalysisResponse(response.data.response);

      return {
        news,
        categories: analysis.categories,
        relevanceScore: analysis.relevanceScore,
        summary: analysis.summary,
        keywords: analysis.keywords,
      };
    } catch (error) {
      this.logger.error(
        `Error analyzing news with Ollama: ${(error as Error).message}`
      );
      return this.createFallbackAnalysis(news);
    }
  }

  async analyzeBatch(newsList: NewsEntity[]): Promise<NewsAnalysisResult[]> {
    this.logger.info(`Analyzing batch of ${newsList.length} news with Ollama`);
    return Promise.all(newsList.map((news) => this.analyzeNews(news)));
  }

  selectBestForCategories(
    analyzedNews: NewsAnalysisResult[],
    preferredCategories: NewsCategory[],
    limit: number = 5
  ): NewsAnalysisResult[] {
    const hasAllCategory = preferredCategories.includes(NewsCategory.ALL);

    const filtered = analyzedNews.filter((analysis) => {
      if (hasAllCategory) return true;
      return analysis.categories.some((cat) =>
        preferredCategories.includes(cat)
      );
    });

    const sorted = filtered.sort((a, b) => {
      const aMatchScore = this.calculateMatchScore(
        a,
        preferredCategories,
        hasAllCategory
      );
      const bMatchScore = this.calculateMatchScore(
        b,
        preferredCategories,
        hasAllCategory
      );
      return bMatchScore - aMatchScore;
    });

    return sorted.slice(0, limit);
  }

  private buildAnalysisPrompt(news: NewsEntity): string {
    return `Analise a seguinte notícia e retorne APENAS um JSON válido, sem explicações adicionais.

Notícia:
Título: ${news.title}
Descrição: ${news.description || "Sem descrição"}

Retorne APENAS um JSON no seguinte formato (sem markdown, sem explicações):
{
  "categories": ["technology"],
  "relevanceScore": 0.85,
  "summary": "Resumo em português com no máximo 100 palavras",
  "keywords": ["palavra1", "palavra2", "palavra3"]
}

Regras:
- categories: Array com uma ou mais categorias: technology, politics, sports, economy, health, entertainment, world
- relevanceScore: número entre 0 e 1 (float)
- summary: resumo objetivo em português, máximo 100 palavras
- keywords: array com 3-5 palavras-chave mais importantes

Responda APENAS com o JSON, sem texto adicional.`;
  }

  private parseAnalysisResponse(text: string): {
    categories: NewsCategory[];
    relevanceScore: number;
    summary: string;
    keywords: string[];
  } {
    try {
      const cleanText = text.trim().replace(/^```json\s*|\s*```$/g, "");

      let parsed;
      try {
        parsed = JSON.parse(cleanText);
      } catch (error) {
        const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("No valid JSON found in response");
        }
      }

      return {
        categories: this.validateCategories(parsed.categories || []),
        relevanceScore: Math.max(0, Math.min(1, parsed.relevanceScore || 0.5)),
        summary: parsed.summary || "Resumo não disponível",
        keywords: Array.isArray(parsed.keywords)
          ? parsed.keywords.slice(0, 5)
          : [],
      };
    } catch (error) {
      this.logger.error(`Error parsing Ollama response: ${error}`);
      this.logger.debug(`Raw response: ${text.substring(0, 200)}`);
      return {
        categories: [NewsCategory.WORLD],
        relevanceScore: 0.5,
        summary: "Análise automática indisponível",
        keywords: [],
      };
    }
  }

  private validateCategories(categories: string[]): NewsCategory[] {
    const validCategories: string[] = [
      NewsCategory.TECHNOLOGY,
      NewsCategory.POLITICS,
      NewsCategory.SPORTS,
      NewsCategory.ECONOMY,
      NewsCategory.HEALTH,
      NewsCategory.ENTERTAINMENT,
      NewsCategory.WORLD,
    ];

    const validated = categories
      .filter((cat) => validCategories.includes(cat))
      .map((cat) => cat as NewsCategory);

    return validated.length > 0 ? validated : [NewsCategory.WORLD];
  }

  private calculateMatchScore(
    analysis: NewsAnalysisResult,
    preferredCategories: NewsCategory[],
    hasAllCategory: boolean
  ): number {
    if (hasAllCategory) {
      return analysis.relevanceScore;
    }

    const categoryMatches = analysis.categories.filter((cat) =>
      preferredCategories.includes(cat)
    ).length;

    if (categoryMatches === 0) return 0;

    const categoryScore = categoryMatches / preferredCategories.length;
    const finalScore = categoryScore * 0.6 + analysis.relevanceScore * 0.4;

    return finalScore;
  }

  private createFallbackAnalysis(news: NewsEntity): NewsAnalysisResult {
    return {
      news,
      categories: [NewsCategory.WORLD],
      relevanceScore: 0.5,
      summary: news.description?.substring(0, 150) || news.title,
      keywords: [],
    };
  }
}
