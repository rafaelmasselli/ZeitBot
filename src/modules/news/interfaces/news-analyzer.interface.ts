import { NewsEntity } from "../entities/news.entity";
import { NewsCategory } from "@/modules/whatsapp/entities/subscriber.entity";

export interface NewsAnalysisResult {
  news: NewsEntity;
  categories: NewsCategory[];
  relevanceScore: number;
  summary: string;
  keywords: string[];
}

export interface INewsAnalyzer {
  analyzeNews(news: NewsEntity): Promise<NewsAnalysisResult>;
  analyzeBatch(newsList: NewsEntity[]): Promise<NewsAnalysisResult[]>;
  selectBestForCategories(
    analyzedNews: NewsAnalysisResult[],
    preferredCategories: NewsCategory[],
    limit: number
  ): NewsAnalysisResult[];
}

