import { injectable, inject } from "tsyringe";
import { ILogger } from "@/shared/logger/logger.interface";
import { INewsAnalyzer, NewsAnalysisResult } from "@/modules/news/interfaces/news-analyzer.interface";
import { NewsEntity } from "@/modules/news/entities/news.entity";
import { NewsCategory } from "@/shared/entities/user.entity";

@injectable()
export class SimpleNewsAnalyzer implements INewsAnalyzer {
  private categoryKeywordsPT: Map<NewsCategory, string[]>;
  private categoryKeywordsEN: Map<NewsCategory, string[]>;

  constructor(@inject("ILogger") private readonly logger: ILogger) {
    this.categoryKeywordsPT = this.initializeCategoryKeywordsPT();
    this.categoryKeywordsEN = this.initializeCategoryKeywordsEN();
  }

  async analyzeNews(news: NewsEntity): Promise<NewsAnalysisResult> {
    this.logger.info(`Analyzing news with simple analyzer: ${news.title}`);

    const text = `${news.title} ${news.description || ""}`.toLowerCase();
    const language = this.detectLanguage(text);
    
    const categories = this.detectCategories(text, language);
    const relevanceScore = this.calculateRelevance(text, categories, language);
    const summary = this.generateSummary(news);
    const keywords = this.extractKeywords(text, language);

    return {
      news,
      categories: categories.length > 0 ? categories : [NewsCategory.WORLD],
      relevanceScore,
      summary,
      keywords,
    };
  }

  async analyzeBatch(newsList: NewsEntity[]): Promise<NewsAnalysisResult[]> {
    this.logger.info(`Analyzing batch of ${newsList.length} news with simple analyzer`);
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

  private detectLanguage(text: string): "pt" | "en" {
    const ptIndicators = [
      "de", "da", "do", "para", "com", "que", "não", "uma", "dos", "das",
      "em", "os", "as", "por", "mais", "é", "são", "foi", "pelo", "pela"
    ];
    const enIndicators = [
      "the", "and", "for", "are", "but", "not", "you", "all", "can", "her",
      "was", "one", "our", "out", "day", "get", "has", "him", "his", "how"
    ];

    let ptScore = 0;
    let enScore = 0;

    for (const word of ptIndicators) {
      if (text.includes(` ${word} `) || text.startsWith(`${word} `)) {
        ptScore++;
      }
    }
    for (const word of enIndicators) {
      if (text.includes(` ${word} `) || text.startsWith(`${word} `)) {
        enScore++;
      }
    }

    return ptScore >= enScore ? "pt" : "en";
  }

  private initializeCategoryKeywordsPT(): Map<NewsCategory, string[]> {
    return new Map([
      [NewsCategory.TECHNOLOGY, [
        "tecnologia", "tech", "software", "hardware", "ia", "inteligência artificial",
        "computador", "internet", "digital", "app", "aplicativo", "google",
        "microsoft", "apple", "amazon", "meta", "facebook", "whatsapp", "instagram",
        "dados", "cibersegurança", "hack", "startup", "inovação", "smartphone",
        "celular", "tablet", "notebook", "sistema", "programa", "rede", "servidor"
      ]],
      [NewsCategory.POLITICS, [
        "política", "governo", "presidente", "ministro", "senado", "congresso",
        "deputado", "eleição", "votação", "lei", "justiça", "supremo", "stf",
        "partido", "candidato", "prefeitura", "prefeito", "governador", "reforma",
        "câmara", "tribunal", "vereador", "poder", "federal", "estadual", "municipal"
      ]],
      [NewsCategory.SPORTS, [
        "esporte", "futebol", "jogo", "campeonato", "time", "jogador", "gol",
        "vitória", "derrota", "copa", "mundial", "olimpíadas", "atleta", "corrida",
        "basquete", "vôlei", "tênis", "fórmula", "natação", "campeão", "técnico",
        "treinador", "partida", "torneio", "medalha", "recorde", "competição"
      ]],
      [NewsCategory.ECONOMY, [
        "economia", "dólar", "real", "mercado", "bolsa", "ações", "investimento",
        "banco", "juros", "inflação", "pib", "fiscal", "tributária", "imposto",
        "financeiro", "negócio", "empresa", "lucro", "prejuízo", "crise", "crescimento",
        "renda", "salário", "emprego", "desemprego", "crédito", "dívida", "comércio"
      ]],
      [NewsCategory.HEALTH, [
        "saúde", "medicina", "doença", "tratamento", "hospital", "médico", "vacina",
        "covid", "pandemia", "vírus", "bacteria", "sus", "paciente", "cirurgia",
        "remédio", "medicamento", "sintoma", "diagnóstico", "câncer", "diabetes",
        "gripe", "febre", "clínica", "enfermagem", "exame", "terapia", "farmácia"
      ]],
      [NewsCategory.ENTERTAINMENT, [
        "entretenimento", "cinema", "filme", "série", "tv", "música", "show",
        "festival", "artista", "ator", "atriz", "cantor", "cantora", "celebridade",
        "famoso", "estreia", "oscar", "grammy", "netflix", "streaming", "novela",
        "teatro", "banda", "álbum", "concerto", "programa", "apresentador"
      ]],
      [NewsCategory.WORLD, [
        "mundo", "internacional", "país", "guerra", "conflito", "paz", "onu",
        "europa", "ásia", "áfrica", "américa", "china", "eua", "rússia", "ukraine",
        "nações", "embaixada", "fronteira", "tratado", "diplomacia", "exterior"
      ]],
    ]);
  }

  private initializeCategoryKeywordsEN(): Map<NewsCategory, string[]> {
    return new Map([
      [NewsCategory.TECHNOLOGY, [
        "technology", "tech", "software", "hardware", "ai", "artificial intelligence",
        "computer", "internet", "digital", "app", "application", "google",
        "microsoft", "apple", "amazon", "meta", "facebook", "whatsapp", "instagram",
        "data", "cybersecurity", "hack", "hacker", "startup", "innovation", "smartphone",
        "mobile", "tablet", "laptop", "system", "program", "network", "server", "cloud"
      ]],
      [NewsCategory.POLITICS, [
        "politics", "political", "government", "president", "minister", "senate",
        "congress", "representative", "election", "vote", "voting", "law", "justice",
        "supreme", "court", "party", "candidate", "mayor", "governor", "reform",
        "parliament", "tribunal", "councilor", "power", "federal", "state", "local"
      ]],
      [NewsCategory.SPORTS, [
        "sports", "sport", "football", "soccer", "game", "match", "championship",
        "team", "player", "goal", "victory", "defeat", "cup", "world", "olympics",
        "athlete", "race", "basketball", "volleyball", "tennis", "formula", "swimming",
        "champion", "coach", "trainer", "tournament", "medal", "record", "competition"
      ]],
      [NewsCategory.ECONOMY, [
        "economy", "economic", "dollar", "market", "stock", "shares", "investment",
        "bank", "banking", "interest", "inflation", "gdp", "fiscal", "tax", "taxation",
        "financial", "business", "company", "profit", "loss", "crisis", "growth",
        "income", "salary", "wage", "employment", "unemployment", "credit", "debt", "trade"
      ]],
      [NewsCategory.HEALTH, [
        "health", "medicine", "medical", "disease", "treatment", "hospital", "doctor",
        "vaccine", "vaccination", "covid", "pandemic", "virus", "bacteria", "patient",
        "surgery", "drug", "medication", "symptom", "diagnosis", "cancer", "diabetes",
        "flu", "fever", "clinic", "nursing", "exam", "test", "therapy", "pharmacy"
      ]],
      [NewsCategory.ENTERTAINMENT, [
        "entertainment", "cinema", "movie", "film", "series", "tv", "television",
        "music", "show", "concert", "festival", "artist", "actor", "actress", "singer",
        "celebrity", "famous", "premiere", "oscar", "grammy", "netflix", "streaming",
        "theater", "theatre", "band", "album", "performance", "program", "presenter", "host"
      ]],
      [NewsCategory.WORLD, [
        "world", "international", "country", "war", "warfare", "conflict", "peace",
        "un", "united nations", "europe", "asia", "africa", "america", "china", "usa",
        "russia", "ukraine", "nations", "embassy", "border", "treaty", "diplomacy", "foreign"
      ]],
    ]);
  }

  private detectCategories(text: string, language: "pt" | "en"): NewsCategory[] {
    const detectedCategories: Map<NewsCategory, number> = new Map();
    const keywords = language === "pt" ? this.categoryKeywordsPT : this.categoryKeywordsEN;

    for (const [category, keywordList] of keywords.entries()) {
      let score = 0;
      for (const keyword of keywordList) {
        if (text.includes(keyword)) {
          score++;
        }
      }
      if (score > 0) {
        detectedCategories.set(category, score);
      }
    }

    const sortedCategories = Array.from(detectedCategories.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([category]) => category);

    return sortedCategories;
  }

  private calculateRelevance(text: string, categories: NewsCategory[], language: "pt" | "en"): number {
    let score = 0.5;

    if (categories.length > 0) {
      score += 0.2;
    }
    if (categories.length > 1) {
      score += 0.1;
    }

    const importantWordsPT = ["urgente", "importante", "exclusivo", "breaking", "novo", "nova", "primeira", "primeiro"];
    const importantWordsEN = ["urgent", "breaking", "important", "exclusive", "new", "first", "latest", "major"];
    const importantWords = language === "pt" ? importantWordsPT : importantWordsEN;

    for (const word of importantWords) {
      if (text.includes(word)) {
        score += 0.05;
      }
    }

    return Math.min(1, score);
  }

  private generateSummary(news: NewsEntity): string {
    const description = news.description || news.title;
    if (description.length <= 150) {
      return description;
    }
    return description.substring(0, 147) + "...";
  }

  private extractKeywords(text: string, language: "pt" | "en"): string[] {
    const stopWordsPT = new Set([
      "de", "a", "o", "que", "e", "do", "da", "em", "um", "para", "é", "com",
      "não", "uma", "os", "no", "se", "na", "por", "mais", "as", "dos", "como",
      "mas", "foi", "ao", "ele", "das", "tem", "à", "seu", "sua", "ou", "ser",
      "são", "pela", "pelo", "esta", "este", "essa", "esse", "sido", "ter", "seus"
    ]);
    const stopWordsEN = new Set([
      "the", "and", "for", "are", "but", "not", "you", "all", "can", "her",
      "was", "one", "our", "out", "day", "get", "has", "him", "his", "how",
      "had", "have", "this", "that", "they", "from", "with", "what", "were",
      "been", "have", "their", "said", "will", "would", "there", "about"
    ]);
    const stopWords = language === "pt" ? stopWordsPT : stopWordsEN;

    const words = text
      .toLowerCase()
      .replace(/[^\w\sáéíóúâêôãõç]/g, "")
      .split(/\s+/)
      .filter((word) => word.length > 3 && !stopWords.has(word));

    const wordFreq = new Map<string, number>();
    for (const word of words) {
      wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
    }

    return Array.from(wordFreq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word]) => word);
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
}

