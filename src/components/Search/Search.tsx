import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search as SearchIcon, ArrowRight } from 'lucide-react';
import { useBookStore } from '../../store/bookStore';
import { useSearch } from '../../hooks/useSearch';

export function Search() {
  const {
    showSearch,
    toggleSearch,
    goToVerse,
    searchHistory,
    addSearchHistory,
    removeSearchHistory,
  } = useBookStore();
  const { query, setQuery, results, clearSearch } = useSearch();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showSearch && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
    if (!showSearch) clearSearch();
  }, [showSearch, clearSearch]);

  const handleOpen = (bookSlug: string, chapter: number, verse: number) => {
    addSearchHistory(query);
    goToVerse(bookSlug, chapter, verse);
    toggleSearch();
  };

  const handleSubmitSearch = () => {
    addSearchHistory(query);
  };

  const toPlainText = (text: string) =>
    text
      .replace(/```[\s\S]*?```/g, ' ')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/!\[[^\]]*]\([^)]+\)/g, ' ')
      .replace(/\[([^\]]+)]\([^)]+\)/g, '$1')
      .replace(/[*_~>#-]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

  const highlight = (text: string, q: string) => {
    if (!q.trim()) return text;
    try {
      const regex = new RegExp(`(${q.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
      const parts = text.split(regex);
      return parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="search-highlight">
            {part}
          </mark>
        ) : (
          part
        )
      );
    } catch {
      return text;
    }
  };

  return (
    <AnimatePresence>
      {showSearch && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleSearch}
            className="fixed inset-0 bg-black/75 z-40 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 400, damping: 35 }}
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 px-3 sm:top-8 sm:-translate-y-0 sm:px-4"
          >
            <div className="glass-panel rounded-lg overflow-hidden max-h-[82dvh] flex flex-col">
              <div className="flex items-center gap-2 sm:gap-3 px-4 sm:px-5 py-3 sm:py-4 border-b border-gold-800/30">
                <SearchIcon className="w-5 h-5 text-gold-500 shrink-0" />
                <input
                  ref={inputRef}
                  id="search-input"
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmitSearch()}
                  placeholder="Buscar livros, referencias ou texto..."
                  className="search-input min-w-0 text-base py-1 border-none"
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

              {!query && (
                <div className="px-4 sm:px-5 py-4 overflow-y-auto no-scrollbar">
                  <p className="font-ui text-xs text-parchment-600 mb-3">Historico de busca</p>
                  {searchHistory.length === 0 ? (
                    <p className="font-serif text-sm text-parchment-500 italic">
                      Suas buscas aparecem aqui.
                    </p>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {searchHistory.map((item) => (
                        <div
                          key={item}
                          className="flex items-center gap-2 rounded border border-gold-900/30 bg-black/15 px-3 py-2"
                        >
                          <button
                            onClick={() => setQuery(item)}
                            className="min-w-0 flex-1 text-left font-ui text-sm text-parchment-300 hover:text-gold-400 transition-colors truncate"
                          >
                            {item}
                          </button>
                          <button
                            onClick={() => removeSearchHistory(item)}
                            className="btn-icon p-1 shrink-0"
                            aria-label={`Apagar busca ${item}`}
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {query && (
                <div className="overflow-y-auto no-scrollbar">
                  {results.length === 0 ? (
                    <div className="px-5 py-8 text-center">
                      <p className="font-serif text-parchment-500 italic">
                        Nenhum resultado encontrado para "{query}"
                      </p>
                      <p className="font-ui text-xs text-parchment-700 mt-2">
                        Tente outro termo ou referencia
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="px-5 py-2 border-b border-gold-900/20">
                        <p className="font-ui text-xs text-parchment-600">
                          {results.length} resultado{results.length !== 1 ? 's' : ''} encontrado
                          {results.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                      {results.map((result, i) => {
                        const v = result.item;
                        return (
                          <div
                            key={`${v.bookSlug}-${v.chapter}-${v.verse}-${i}`}
                            className="px-4 sm:px-5 py-4 border-b border-gold-900/10 hover:bg-parchment-100/5 transition-colors group"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <p className="font-display text-xs text-gold-600 mb-1 tracking-wide">
                                  {v.book} {v.chapter}:{v.verse}
                                </p>
                                <p className="font-serif text-sm text-parchment-300 leading-relaxed">
                                  "...{highlight(toPlainText(v.text), query)}..."
                                </p>
                                <p className="font-ui text-[10px] text-parchment-600 mt-1">
                                  Pagina {v.page}
                                </p>
                              </div>
                              <button
                                onClick={() => handleOpen(v.bookSlug, v.chapter, v.verse)}
                                className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded font-ui text-xs text-gold-500 border border-gold-800/40 hover:border-gold-500 hover:bg-gold-500/10 transition-all duration-200 sm:opacity-0 sm:group-hover:opacity-100"
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
