import { injectable, inject } from "tsyringe";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { ILogger } from "@/shared/logger/logger.interface";
import {
  INewsAnalyzer,
  NewsAnalysisResult,
} from "../interfaces/news-analyzer.interface";
import { NewsEntity } from "../entities/news.entity";
import { NewsCategory } from "@/modules/whatsapp/entities/subscriber.entity";

@injectable()
export class GeminiNewsAnalyzer implements INewsAnalyzer {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(@inject("ILogger") private readonly logger: ILogger) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY not configured");
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
  }

  async analyzeNews(news: NewsEntity): Promise<NewsAnalysisResult> {
    try {
      this.logger.info(`Analyzing news: ${news.title}`);

      const prompt = this.buildAnalysisPrompt(news);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const analysis = this.parseAnalysisResponse(text);

      return {
        news,
        categories: analysis.categories,
        relevanceScore: analysis.relevanceScore,
        summary: analysis.summary,
        keywords: analysis.keywords,
      };
    } catch (error) {
      this.logger.error(
        `Error analyzing news ${news.title}: ${(error as Error).message}`
      );
      return this.createFallbackAnalysis(news);
    }
  }

  async analyzeBatch(newsList: NewsEntity[]): Promise<NewsAnalysisResult[]> {
    this.logger.info(`Analyzing batch of ${newsList.length} news`);

    const analyses = await Promise.all(
      newsList.map((news) => this.analyzeNews(news))
    );

    return analyses;
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
    return `Analise a seguinte notícia e retorne APENAS um JSON válido com a estrutura especificada.

Notícia:
Título: ${news.title}
Descrição: ${news.description || "Sem descrição"}

Retorne APENAS um JSON no seguinte formato (sem markdown, sem explicações):
{
  "categories": ["technology", "politics", "sports", "economy", "health", "entertainment", "world"],
  "relevanceScore": 0.85,
  "summary": "Resumo em português com no máximo 100 palavras",
  "keywords": ["palavra1", "palavra2", "palavra3"]
}

Categorias possíveis: technology, politics, sports, economy, health, entertainment, world
Relevance score: número entre 0 e 1 indicando a importância/relevância da notícia
Summary: resumo objetivo em português
Keywords: 3-5 palavras-chave principais

Responda APENAS com o JSON, sem mais nada.`;
  }

  private parseAnalysisResponse(text: string): {
    categories: NewsCategory[];
    relevanceScore: number;
    summary: string;
    keywords: string[];
  } {
    try {
      const cleanText = text
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      const parsed = JSON.parse(cleanText);

      return {
        categories: this.validateCategories(parsed.categories || []),
        relevanceScore: Math.max(0, Math.min(1, parsed.relevanceScore || 0.5)),
        summary: parsed.summary || "Resumo não disponível",
        keywords: Array.isArray(parsed.keywords) ? parsed.keywords : [],
      };
    } catch (error) {
      this.logger.error(`Error parsing AI response: ${error}`);
      return {
        categories: [NewsCategory.WORLD],
        relevanceScore: 0.5,
        summary: "Análise automática indisponível",
        keywords: [],
      };
    }
  }

  private validateCategories(categories: string[]): NewsCategory[] {
    const validCategories = Object.values(NewsCategory);
    return categories
      .filter((cat) => validCategories.includes(cat as NewsCategory))
      .map((cat) => cat as NewsCategory);
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
