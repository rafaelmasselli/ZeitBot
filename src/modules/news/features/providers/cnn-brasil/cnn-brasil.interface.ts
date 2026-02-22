/**
 * CNN Brasil RSS feed structure (WordPress-style).
 * See https://www.cnnbrasil.com.br/feed/
 */
export interface ICnnBrasilRssItem {
  title: string[];
  link: string[];
  "dc:creator"?: string[];
  pubDate: string[];
  category?: string[];
  description: string[];
  guid?: Array<{ _: string } | string>;
}

export interface ICnnBrasilRssChannel {
  title: string[];
  link: string[];
  description: string[];
  language: string[];
  item: ICnnBrasilRssItem[];
}

export interface ICnnBrasilRssResponse {
  rss: {
    channel: ICnnBrasilRssChannel[];
  };
}
