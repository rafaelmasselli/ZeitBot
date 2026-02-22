/**
 * CartaCapital RSS feed structure (WordPress-style).
 * See https://www.cartacapital.com.br/feed/
 */
export interface ICartaCapitalRssItem {
  title: string[];
  link: string[];
  "dc:creator"?: string[];
  pubDate: string[];
  category?: string[];
  description: string[];
  guid?: Array<{ _: string } | string>;
}

export interface ICartaCapitalRssChannel {
  title: string[];
  link: string[];
  description: string[];
  language: string[];
  item: ICartaCapitalRssItem[];
}

export interface ICartaCapitalRssResponse {
  rss: {
    channel: ICartaCapitalRssChannel[];
  };
}
