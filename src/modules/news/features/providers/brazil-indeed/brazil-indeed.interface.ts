/**
 * Brasil de Fato RSS feed structure (WordPress-style).
 * See https://www.brasildefato.com.br/feed/
 */
export interface IBrasilDeFatoRssItem {
  title: string[];
  link: string[];
  "dc:creator"?: string[];
  pubDate: string[];
  category?: string[];
  "dc:subject"?: string[];
  description: string[];
  guid?: Array<{ _: string } | string>;
}

export interface IBrasilDeFatoRssChannel {
  title: string[];
  link: string[];
  description: string[];
  language: string[];
  item: IBrasilDeFatoRssItem[];
}

export interface IBrasilDeFatoRssResponse {
  rss: {
    channel: IBrasilDeFatoRssChannel[];
  };
}
