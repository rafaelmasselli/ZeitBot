import { NewsEntity, NewsPlatform } from "../../entities/news.entity";
import * as cheerio from "cheerio";

export class BrazilIndeedStrategy {
  public parse(html: string): NewsEntity[] {
    const $ = cheerio.load(html);
    const newsItems: NewsEntity[] = [];

    $("article.jeg_post").each((_, element) => {
      const article = $(element);
      const titleElement = article.find(".jeg_post_title a");
      const imageElement = article.find(".thumbnail-container img");
      const categoryElement = article.find(".jeg_post_hat .label");

      const news = new NewsEntity();
      news.title = titleElement.text().trim();
      news.link = titleElement.attr("href") || "";
      news.image = String(imageElement.data("src") || imageElement.attr("src"));
      news.description = "";
      news.date = new Date();
      news.enterprise = NewsPlatform.BRAZIL_INDEED;
      news.topics = categoryElement.length
        ? [categoryElement.text().trim()]
        : [];

      if (news.title && news.link) {
        newsItems.push(news);
      }
    });

    return newsItems;
  }

  public getDetails(html: string, news: NewsEntity): NewsEntity {
    try {
      const $ = cheerio.load(html);

      if (!news.title || news.title.trim() === "") {
        news.title = $(".jeg_post_title").text().trim();
      }

      const articleText = $(".content-inner p")
        .map((_, element) => {
          return $(element).text().trim();
        })
        .get()
        .join("\n\n");

      news.description = articleText;

      const dateText = $(".jeg_meta_date").text().trim();
      if (dateText) {
        try {
          const parts = dateText.split(" ");
          const datePart = parts[0].split(".");
          const day = parseInt(datePart[0]);
          const month = this.getMonthNumber(datePart[1]);
          const year = parseInt(datePart[2]);

          if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
            news.date = new Date(year, month - 1, day);
          }
        } catch (error) {
          console.error(`Erro ao converter data: ${error}`);
        }
      }

      if (!news.image || news.image === "") {
        news.image = String(
          $(".jeg_featured.featured_image img").data("src") ||
            $(".jeg_featured.featured_image img").attr("src")
        );
      }

      const category = $(".jeg_post_hat .label").text().trim();
      if (category && (!news.topics || news.topics.length === 0)) {
        news.topics = [category];
      }

      const author = $(".jeg_meta_author a").text().trim();
      if (author) {
        if (!news.description.includes(`Autor: ${author}`)) {
          news.description += `\n\nAutor: ${author}`;
        }
      }

      return news;
    } catch (error) {
      console.error(`Erro ao extrair detalhes da notícia: ${error}`);
      return news;
    }
  }

  private getMonthNumber(monthStr: string): number {
    const months: { [key: string]: number } = {
      jan: 1,
      fev: 2,
      mar: 3,
      abr: 4,
      mai: 5,
      jun: 6,
      jul: 7,
      ago: 8,
      set: 9,
      out: 10,
      nov: 11,
      dez: 12,
    };
    return months[monthStr.toLowerCase()] || 1;
  }
}

