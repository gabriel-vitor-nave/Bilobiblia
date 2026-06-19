import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Verse, Page, BookMeta, FavoriteRef, ReadingHistory } from '../types';

// ─── Paginator ─────────────────────────────────────────────────────────────

const CHARS_PER_PAGE = 700;

function buildPages(verses: Verse[]): Page[] {
  if (verses.length === 0) return [];

  const pages: Page[] = [];
  let currentPage: Page | null = null;
  let charCount = 0;
  const bookPageCounts: Record<string, number> = {};

  for (const verse of verses) {
    const verseLength = verse.text.length + 20;

    // Start a new page if:
    // - No current page
    // - Adding this verse would overflow AND this page already has content
    // - The book or chapter changed (always start new page on chapter boundary)
    const needsNewPage =
      !currentPage ||
      (charCount + verseLength > CHARS_PER_PAGE && currentPage.verses.length > 0) ||
      (currentPage.chapter !== verse.chapter && currentPage.verses.length > 0);

    if (needsNewPage) {
      const slug = verse.bookSlug;
      bookPageCounts[slug] = (bookPageCounts[slug] ?? 0) + 1;

      currentPage = {
        pageNumber: pages.length + 1,
        localPageNumber: bookPageCounts[slug],
        book: verse.book,
        bookSlug: slug,
        chapter: verse.chapter,
        chapterName: verse.chapterName,
        verses: [],
      };
      pages.push(currentPage);
      charCount = 0;
    }

    currentPage!.verses.push(verse);
    charCount += verseLength;

    // Update page metadata to reflect current content
    currentPage!.book = verse.book;
    currentPage!.bookSlug = verse.bookSlug;
    currentPage!.chapter = verse.chapter;
    currentPage!.chapterName = verse.chapterName;
  }

  return pages;
}

// ─── Store interfaces ───────────────────────────────────────────────────────

interface BookState {
  // Content
  verses: Verse[];
  pages: Page[];
  books: BookMeta[];

  // Reader state
  isOpen: boolean;
  currentPage: number;
  isLoading: boolean;
  loadError: string | null;

  // UI state
  showLibrary: boolean;
  showSearch: boolean;
  showFavorites: boolean;

  // Persistent
  favorites: FavoriteRef[];
  history: ReadingHistory | null;
}

interface BookActions {
  // Init
  loadContent: () => Promise<void>;

  // Navigation
  openBook: () => void;
  closeBook: () => void;
  goToPage: (page: number) => void;
  goToVerse: (bookSlug: string, chapter: number, verse: number) => void;
  nextPage: () => void;
  prevPage: () => void;

  // UI toggles
  toggleLibrary: () => void;
  toggleSearch: () => void;
  toggleFavorites: () => void;
  closeAllPanels: () => void;

  // Favorites
  addFavorite: (verse: Verse) => void;
  removeFavorite: (bookSlug: string, chapter: number, verse: number) => void;
  isFavorite: (bookSlug: string, chapter: number, verse: number) => boolean;

  // History
  saveHistory: () => void;
}

// ─── Store ─────────────────────────────────────────────────────────────────

export const useBookStore = create<BookState & BookActions>()(
  persist(
    (set, get) => ({
      // ── Initial state ──────────────────────────────────────────────────
      verses: [],
      pages: [],
      books: [],
      isOpen: false,
      currentPage: 0,
      isLoading: false,
      loadError: null,
      showLibrary: false,
      showSearch: false,
      showFavorites: false,
      favorites: [],
      history: null,

      // ── Content loading ────────────────────────────────────────────────
      loadContent: async () => {
        set({ isLoading: true, loadError: null });
        try {
          // Load search index (pre-built, contains all verses with page numbers)
          const indexRes = await fetch('/search-index.json');
          if (!indexRes.ok) throw new Error('Erro ao carregar índice de busca.');
          const verses: Verse[] = await indexRes.json();

          // Load book metadata
          const slugsRes = await fetch('/books/index.json');
          const slugs: string[] = await slugsRes.json();

          const bookMetas: BookMeta[] = await Promise.all(
            slugs.map(async (slug) => {
              const res = await fetch(`/books/${slug}/metadata.json`);
              return res.json() as Promise<BookMeta>;
            })
          );

          const pages = buildPages(verses);

          set({
            verses,
            pages,
            books: bookMetas.sort((a, b) => a.order - b.order),
            isLoading: false,
          });
        } catch (err) {
          set({ isLoading: false, loadError: String(err) });
        }
      },

      // ── Navigation ─────────────────────────────────────────────────────
      openBook: () => {
        const { history } = get();
        set({
          isOpen: true,
          currentPage: history ? history.page - 1 : 0,
        });
      },

      closeBook: () => {
        get().saveHistory();
        set({ isOpen: false });
      },

      goToPage: (page) => {
        const { pages } = get();
        const clamped = Math.max(0, Math.min(page, pages.length - 1));
        set({ currentPage: clamped });
        get().saveHistory();
      },

      goToVerse: (bookSlug, chapter, verse) => {
        const { pages } = get();
        const page = pages.find(
          (p) =>
            p.bookSlug === bookSlug &&
            p.chapter === chapter &&
            p.verses.some((v) => v.verse === verse)
        );
        if (page) {
          get().goToPage(page.pageNumber - 1);
          get().closeAllPanels();
        }
      },

      nextPage: () => {
        const { currentPage, pages } = get();
        if (currentPage < pages.length - 1) {
          get().goToPage(currentPage + 1);
        }
      },

      prevPage: () => {
        const { currentPage } = get();
        if (currentPage > 0) {
          get().goToPage(currentPage - 1);
        }
      },

      // ── UI toggles ─────────────────────────────────────────────────────
      toggleLibrary: () =>
        set((s) => ({
          showLibrary: !s.showLibrary,
          showSearch: false,
          showFavorites: false,
        })),

      toggleSearch: () =>
        set((s) => ({
          showSearch: !s.showSearch,
          showLibrary: false,
          showFavorites: false,
        })),

      toggleFavorites: () =>
        set((s) => ({
          showFavorites: !s.showFavorites,
          showLibrary: false,
          showSearch: false,
        })),

      closeAllPanels: () =>
        set({ showLibrary: false, showSearch: false, showFavorites: false }),

      // ── Favorites ──────────────────────────────────────────────────────
      addFavorite: (verse) => {
        const ref: FavoriteRef = {
          book: verse.book,
          bookSlug: verse.bookSlug,
          chapter: verse.chapter,
          verse: verse.verse,
          text: verse.text,
          page: verse.page,
          savedAt: new Date().toISOString(),
        };
        set((s) => ({ favorites: [...s.favorites, ref] }));
      },

      removeFavorite: (bookSlug, chapter, verse) => {
        set((s) => ({
          favorites: s.favorites.filter(
            (f) => !(f.bookSlug === bookSlug && f.chapter === chapter && f.verse === verse)
          ),
        }));
      },

      isFavorite: (bookSlug, chapter, verse) => {
        return get().favorites.some(
          (f) => f.bookSlug === bookSlug && f.chapter === chapter && f.verse === verse
        );
      },

      // ── History ────────────────────────────────────────────────────────
      saveHistory: () => {
        const { currentPage, pages } = get();
        const page = pages[currentPage];
        if (!page) return;
        set({
          history: {
            page: page.pageNumber,
            book: page.book,
            bookSlug: page.bookSlug,
            chapter: page.chapter,
            savedAt: new Date().toISOString(),
          },
        });
      },
    }),
    {
      name: 'bilobiblia-storage',
      // Only persist user data, not content (content is fetched fresh)
      partialize: (state) => ({
        favorites: state.favorites,
        history: state.history,
      }),
    }
  )
);
