import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronDown, ChevronRight, BookOpen } from 'lucide-react';
import { useBookStore } from '../../store/bookStore';

export function Library() {
  const { books, verses, showLibrary, toggleLibrary, goToVerse, pages } = useBookStore();
  const [expandedBook, setExpandedBook] = useState<string | null>(null);

  // Compute chapter counts, names and verses per book from verses
  const chapterMap: Record<string, Set<number>> = {};
  const verseCountMap: Record<string, number> = {};
  const chapterNamesMap: Record<string, Record<number, string>> = {};
  for (const v of verses) {
    if (!chapterMap[v.bookSlug]) chapterMap[v.bookSlug] = new Set();
    chapterMap[v.bookSlug].add(v.chapter);
    verseCountMap[v.bookSlug] = (verseCountMap[v.bookSlug] ?? 0) + 1;
    if (v.chapterName) {
      if (!chapterNamesMap[v.bookSlug]) chapterNamesMap[v.bookSlug] = {};
      chapterNamesMap[v.bookSlug][v.chapter] = v.chapterName;
    }
  }

  const handleGoToChapter = (bookSlug: string, chapter: number) => {
    const firstVerse = verses.find((v) => v.bookSlug === bookSlug && v.chapter === chapter);
    if (firstVerse) {
      goToVerse(bookSlug, chapter, firstVerse.verse);
    }
  };

  return (
    <AnimatePresence>
      {showLibrary && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleLibrary}
            className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 350, damping: 35 }}
            className="drawer z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gold-800/30">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-gold-500" />
                <h2 className="font-display text-base text-gold-400 tracking-wide">Biblioteca</h2>
              </div>
              <button onClick={toggleLibrary} className="btn-icon p-1" aria-label="Fechar">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Book list */}
            <div className="flex-1 overflow-y-auto no-scrollbar py-2">
              {books.map((book) => {
                const chapters = Array.from(chapterMap[book.slug] ?? []).sort((a, b) => a - b);
                const isExpanded = expandedBook === book.slug;

                return (
                  <div key={book.slug} className="border-b border-gold-900/20">
                    {/* Book row */}
                    <button
                      onClick={() => setExpandedBook(isExpanded ? null : book.slug)}
                      className="w-full flex items-center gap-3 px-5 py-3 hover:bg-parchment-100/5 transition-colors text-left group"
                    >
                      <span className="font-display text-xs text-gold-700 w-5 text-right shrink-0">
                        {book.order}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-serif text-parchment-200 text-sm truncate group-hover:text-parchment-100 transition-colors">
                          {book.title}
                        </p>
                        <p className="font-ui text-[10px] text-parchment-600 mt-0.5">
                          {chapters.length} cap. · {verseCountMap[book.slug] ?? 0} vers.
                        </p>
                      </div>
                      {isExpanded
                        ? <ChevronDown className="w-4 h-4 text-gold-600 shrink-0" />
                        : <ChevronRight className="w-4 h-4 text-parchment-600 shrink-0" />
                      }
                    </button>

                    {/* Chapters */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="bg-black/20 px-5 py-2 flex flex-col gap-1.5">
                            {chapters.map((ch) => {
                              const chName = chapterNamesMap[book.slug]?.[ch];
                              return (
                                <button
                                  key={ch}
                                  onClick={() => handleGoToChapter(book.slug, ch)}
                                  className="px-3 py-2 rounded font-display text-xs text-left
                                             text-parchment-400 border border-parchment-700/20
                                             hover:border-gold-600/50 hover:text-gold-400
                                             transition-all duration-200 truncate w-full"
                                  title={chName ? `Capítulo ${ch}: ${chName}` : `Capítulo ${ch}`}
                                >
                                  Cap. {ch} {chName ? `— ${chName}` : ''}
                                </button>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-gold-800/20">
              <p className="font-ui text-[10px] text-parchment-700 text-center">
                {books.length} livros · {pages.length} páginas
              </p>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
