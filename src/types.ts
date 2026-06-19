// ─── Domain types ──────────────────────────────────────────────────────────

export interface BookMeta {
  title: string;
  slug: string;
  order: number;
  author: string;
  description: string;
  chapters: number;
}

export interface Verse {
  book: string;
  bookSlug: string;
  chapter: number;
  chapterName?: string;
  verse: number;
  text: string;
  page: number;
}

export interface Page {
  pageNumber: number;
  localPageNumber: number;
  book: string;
  bookSlug: string;
  chapter: number;
  chapterName?: string;
  verses: Verse[];
}

export interface FavoriteRef {
  book: string;
  bookSlug: string;
  chapter: number;
  verse: number;
  text: string;
  page: number;
  savedAt: string;
}

export interface ReadingHistory {
  page: number;
  book: string;
  bookSlug: string;
  chapter: number;
  savedAt: string;
}

export type SearchResult = {
  item: Verse;
  score?: number;
  refIndex: number;
};
