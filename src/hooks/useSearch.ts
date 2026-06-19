import { useMemo, useState, useCallback } from 'react';
import Fuse from 'fuse.js';
import { useBookStore } from '../store/bookStore';
import type { Verse, SearchResult } from '../types';

// Regex patterns for reference-style queries
const VERSE_REF   = /^(.+?)\s+(\d+):(\d+)$/;   // "Boingênesis 1:3"
const CHAPTER_REF = /^(.+?)\s+(\d+)$/;          // "Boingênesis 3"
const BOOK_REF    = /^([^\d]+)$/;                // "Boingênesis"

export function useSearch() {
  const verses = useBookStore((s) => s.verses);
  const books  = useBookStore((s) => s.books);

  const [query, setQuery] = useState('');

  // Build Fuse index once when verses load
  const fuse = useMemo(() => {
    if (verses.length === 0) return null;
    const index = Fuse.createIndex<Verse>(
      [
        { name: 'text', weight: 0.7 },
        { name: 'book', weight: 0.2 },
      ],
      verses
    );
    return new Fuse<Verse>(
      verses,
      {
        keys: [
          { name: 'text', weight: 0.7 },
          { name: 'book', weight: 0.2 },
        ],
        threshold: 0.35,
        includeScore: true,
        minMatchCharLength: 2,
        ignoreLocation: true,
      },
      index
    );
  }, [verses]);

  const results: SearchResult[] = useMemo(() => {
    if (!query.trim() || !fuse) return [];

    const q = query.trim();

    // ── Reference parsing ─────────────────────────────────────────────────

    // Try "Book Chapter:Verse" e.g. "Boingênesis 1:3"
    const verseMatch = q.match(VERSE_REF);
    if (verseMatch) {
      const [, bookQuery, chStr, vStr] = verseMatch;
      const ch = parseInt(chStr, 10);
      const v  = parseInt(vStr, 10);
      const bookTitle = resolveBook(bookQuery, books);
      return verses
        .filter((verse) =>
          bookTitle
            ? verse.book.toLowerCase().includes(bookTitle.toLowerCase())
            : true
        )
        .filter((verse) => verse.chapter === ch && verse.verse === v)
        .map((item, refIndex) => ({ item, refIndex }));
    }

    // Try "Book Chapter" e.g. "Boingênesis 3"
    const chapterMatch = q.match(CHAPTER_REF);
    if (chapterMatch) {
      const [, bookQuery, chStr] = chapterMatch;
      const ch = parseInt(chStr, 10);
      const bookTitle = resolveBook(bookQuery, books);
      if (bookTitle) {
        return verses
          .filter(
            (verse) =>
              verse.book.toLowerCase().includes(bookTitle.toLowerCase()) &&
              verse.chapter === ch
          )
          .map((item, refIndex) => ({ item, refIndex }));
      }
    }

    // Try exact book name
    const bookMatch = q.match(BOOK_REF);
    if (bookMatch) {
      const bookTitle = resolveBook(q, books);
      if (bookTitle) {
        return verses
          .filter((verse) => verse.book.toLowerCase().includes(bookTitle.toLowerCase()))
          .slice(0, 30)
          .map((item, refIndex) => ({ item, refIndex }));
      }
    }

    // Default: fuzzy full-text search
    return fuse.search(q, { limit: 30 }) as SearchResult[];
  }, [query, fuse, verses, books]);

  const clearSearch = useCallback(() => setQuery(''), []);

  return { query, setQuery, results, clearSearch };
}

// Helper: find book title that matches a query string
function resolveBook(query: string, books: { title: string; slug: string }[]): string | null {
  const q = query.toLowerCase().trim();
  const match = books.find(
    (b) =>
      b.title.toLowerCase().includes(q) ||
      b.slug.toLowerCase().includes(q) ||
      q.includes(b.title.toLowerCase())
  );
  return match?.title ?? null;
}
