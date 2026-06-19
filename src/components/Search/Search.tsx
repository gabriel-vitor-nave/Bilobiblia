import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search as SearchIcon, ArrowRight } from 'lucide-react';
import { useBookStore } from '../../store/bookStore';
import { useSearch } from '../../hooks/useSearch';

export function Search() {
  const { showSearch, toggleSearch, goToVerse } = useBookStore();
  const { query, setQuery, results, clearSearch } = useSearch();
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on open
  useEffect(() => {
    if (showSearch && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
    if (!showSearch) clearSearch();
  }, [showSearch, clearSearch]);

  const handleOpen = (bookSlug: string, chapter: number, verse: number) => {
    goToVerse(bookSlug, chapter, verse);
    toggleSearch();
  };

  // Highlight matching text
  const highlight = (text: string, q: string) => {
    if (!q.trim()) return text;
    try {
      const regex = new RegExp(`(${q.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
      const parts = text.split(regex);
      return parts.map((part, i) =>
        regex.test(part)
          ? <mark key={i} className="search-highlight">{part}</mark>
          : part
      );
    } catch {
      return text;
    }
  };

  return (
    <AnimatePresence>
      {showSearch && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleSearch}
            className="fixed inset-0 bg-black/75 z-40 backdrop-blur-md"
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, y: -30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 400, damping: 35 }}
            className="fixed top-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4"
          >
            <div className="glass-panel rounded-xl overflow-hidden">
              {/* Search input */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-gold-800/30">
                <SearchIcon className="w-5 h-5 text-gold-500 shrink-0" />
                <input
                  ref={inputRef}
                  id="search-input"
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar versículos, livros, referências…"
                  className="search-input text-base py-1 border-none"
                  aria-label="Campo de busca"
                />
                {query && (
                  <button onClick={clearSearch} className="btn-icon p-1 shrink-0" aria-label="Limpar">
                    <X className="w-4 h-4" />
                  </button>
                )}
                <button onClick={toggleSearch} className="btn-icon p-1 shrink-0" aria-label="Fechar busca">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Hints */}
              {!query && (
                <div className="px-5 py-4">
                  <p className="font-ui text-xs text-parchment-600 mb-3">Exemplos de busca:</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      'Boingênesis',
                      'Boingênesis 2',
                      'Boingênesis 1:3',
                      'Furico',
                      'Boingoingoing',
                      'Bilola disse',
                    ].map((ex) => (
                      <button
                        key={ex}
                        onClick={() => setQuery(ex)}
                        className="px-3 py-1.5 rounded-full border border-gold-800/40
                                   font-ui text-xs text-parchment-400 hover:text-gold-400
                                   hover:border-gold-600/50 transition-colors"
                      >
                        {ex}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Results */}
              {query && (
                <div className="max-h-[60vh] overflow-y-auto no-scrollbar">
                  {results.length === 0 ? (
                    <div className="px-5 py-8 text-center">
                      <p className="font-serif text-parchment-500 italic">
                        Nenhum versículo encontrado para "{query}"
                      </p>
                      <p className="font-ui text-xs text-parchment-700 mt-2">
                        Tente outro termo ou referência
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="px-5 py-2 border-b border-gold-900/20">
                        <p className="font-ui text-xs text-parchment-600">
                          {results.length} resultado{results.length !== 1 ? 's' : ''} encontrado{results.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                      {results.map((result, i) => {
                        const v = result.item;
                        return (
                          <div
                            key={`${v.bookSlug}-${v.chapter}-${v.verse}-${i}`}
                            className="px-5 py-4 border-b border-gold-900/10
                                       hover:bg-parchment-100/5 transition-colors group"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <p className="font-display text-xs text-gold-600 mb-1 tracking-wide">
                                  {v.book} {v.chapter}:{v.verse}
                                </p>
                                <p className="font-serif text-sm text-parchment-300 leading-relaxed">
                                  "…{highlight(v.text, query)}…"
                                </p>
                                <p className="font-ui text-[10px] text-parchment-600 mt-1">
                                  Página {v.page}
                                </p>
                              </div>
                              <button
                                onClick={() => handleOpen(v.bookSlug, v.chapter, v.verse)}
                                className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded
                                           font-ui text-xs text-gold-500 border border-gold-800/40
                                           hover:border-gold-500 hover:bg-gold-500/10
                                           transition-all duration-200 opacity-0 group-hover:opacity-100"
                                aria-label={`Abrir ${v.book} ${v.chapter}:${v.verse}`}
                              >
                                Abrir <ArrowRight className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
