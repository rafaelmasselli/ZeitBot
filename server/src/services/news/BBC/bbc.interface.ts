interface IImageChanel {
  url: string[];
  title: string[];
  link: string[];
}

interface IAtomLink {
  $: {
    href: string;
    rel: string;
    type: string;
  };
}

interface IGuidChannel {
  _: string;
  $: {
    isPermaLink: boolean;
  };
}

interface IMediaThumbnail {
  $: {
    url: string;
    height: string;
    width: string;
  };
}

interface IItemChannel {
  title: string[];
  description: string[];
  link: string[];
  guid: IGuidChannel[];
  pubDate: string[];
  "media:thumbnail": IMediaThumbnail[];
}

interface IChannel {
  title: string[];
  description: string[];
  link: string[];
  image: IImageChanel[];
  generator: string[];
  lastBuildDate: string[];
  "atom:link": IAtomLink[];
  copyright: string[];
  language: string[];
  ttl: string[];
  item: IItemChannel[];
  pubDate: string[];
}

interface IRssAttributes {
  "xmlns:dc": string;
  "xmlns:content": string;
  "xmlns:atom": string;
  version: string;
  "xmlns:media": string;
}

interface IRss {
  $: IRssAttributes;
  channel: IChannel[];
}

interface IBBCNewsAPIResponse {
  rss: IRss;
}

export {
  IBBCNewsAPIResponse,
  IChannel,
  IItemChannel,
  IImageChanel,
  IMediaThumbnail,
  IGuidChannel,
  IRss,
};
