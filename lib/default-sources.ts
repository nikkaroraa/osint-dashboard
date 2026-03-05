import { Source } from "./types";

export const defaultSources: Source[] = [
  // News RSS
  {
    id: "aljazeera",
    name: "Al Jazeera",
    url: "https://www.aljazeera.com/xml/rss/all.xml",
    type: "news",
    enabled: true,
  },
  {
    id: "bbc-middleeast",
    name: "BBC Middle East",
    url: "https://feeds.bbci.co.uk/news/world/middle_east/rss.xml",
    type: "news",
    enabled: true,
  },
  {
    id: "reuters-world",
    name: "Reuters World",
    url: "https://www.reutersagency.com/feed/?taxonomy=best-sectors&post_type=best",
    type: "news",
    enabled: true,
  },
  // Reddit
  {
    id: "r-worldnews",
    name: "r/worldnews",
    url: "https://www.reddit.com/r/worldnews/.rss",
    type: "reddit",
    enabled: true,
  },
  {
    id: "r-middleeast",
    name: "r/MiddleEast",
    url: "https://www.reddit.com/r/MiddleEast/.rss",
    type: "reddit",
    enabled: true,
  },
  {
    id: "r-dubai",
    name: "r/dubai",
    url: "https://www.reddit.com/r/dubai/.rss",
    type: "reddit",
    enabled: true,
  },
  {
    id: "r-iran",
    name: "r/iran",
    url: "https://www.reddit.com/r/iran/.rss",
    type: "reddit",
    enabled: true,
  },
  // Alerts
  {
    id: "liveuamap",
    name: "Liveuamap ME",
    url: "https://liveuamap.com/rss/mideast",
    type: "alert",
    enabled: true,
  },
  {
    id: "google-iran",
    name: "Google Alert: Iran",
    url: "https://www.google.com/alerts/feeds/00576525591498498498/2156498135649498131",
    type: "alert",
    enabled: false,
  },
];

export const defaultKeywords: string[] = [
  "Iran",
  "UAE",
  "missile",
  "Dubai",
  "IRGC",
  "airstrike",
  "nuclear",
  "sanctions",
  "Strait of Hormuz",
  "Hezbollah",
  "escalation",
  "Tehran",
];
