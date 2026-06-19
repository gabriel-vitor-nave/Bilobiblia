import { useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { ChevronLeft, ChevronRight, Library, Search, Heart, X } from 'lucide-react';
import { useBookStore } from '../../store/bookStore';

export function MobileReader() {
  const {
    pages,
    currentPage,
    nextPage,
    prevPage,
    closeBook,
    toggleLibrary,
    toggleSearch,
    toggleFavorites,
    addFavorite,
    removeFavorite,
    isFavorite,
  } = useBookStore();

  const page = pages[currentPage];
  const dragX = useMotionValue(0);
  const opacity = useTransform(dragX, [-100, 0, 100], [0.3, 1, 0.3]);
  const constraintsRef = useRef(null);

  const handleDragEnd = (_: any, info: { offset: { x: number }; velocity: { x: number } }) => {
    const threshold = 50;
    if (info.offset.x < -threshold || info.velocity.x < -300) {
      nextPage();
    } else if (info.offset.x > threshold || info.velocity.x > 300) {
      prevPage();
    }
    dragX.set(0);
  };

  if (!page) return null;

  const fav = isFavorite(page.bookSlug, page.chapter, page.verses[0]?.verse ?? 1);

  return (
    <div className="min-h-dvh flex flex-col bg-void relative overflow-hidden">

      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 glass-panel border-b border-gold-800/20 z-20">
        <button onClick={closeBook} className="btn-icon p-1.5" aria-label="Fechar">
          <X className="w-5 h-5" />
        </button>
        <div className="text-center">
          <p className="font-display text-xs text-gold-500 tracking-widest">{page.book}</p>
          <p className="font-ui text-xs text-parchment-500 truncate max-w-[180px]" title={page.chapterName}>
            Cap. {page.chapter}{page.chapterName ? ` — ${page.chapterName}` : ''}
          </p>
        </div>
        <div className="w-8" /> {/* spacer */}
      </div>

      {/* Page content with swipe gesture */}
      <div ref={constraintsRef} className="flex-1 relative overflow-hidden touch-pan-y">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={currentPage}
            drag="x"
            dragConstraints={constraintsRef}
            dragElastic={0.15}
            onDragEnd={handleDragEnd}
            style={{ x: dragX, opacity }}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="absolute inset-0 page-surface overflow-y-auto no-scrollbar"
          >
            <div className="px-6 pt-6 pb-24">
              {/* Chapter indicator */}
              <div className="ornament-divider mb-6">
                <span className="font-display text-xs text-gold-600 tracking-widest uppercase text-center text-balance px-4">
                  Capítulo {page.chapter}{page.chapterName ? `: ${page.chapterName}` : ''}
                </span>
              </div>

              {/* Verses */}
              {page.verses.map((verse) => {
                const fav = isFavorite(verse.bookSlug, verse.chapter, verse.verse);
                return (
                  <div
                    key={`${verse.chapter}-${verse.verse}`}
                    className="mb-4 flex gap-3 items-start"
                  >
                    <span className="verse-number shrink-0 mt-1 text-sm flex items-center gap-1.5 select-none">
                      {verse.verse}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (fav) {
                            removeFavorite(verse.bookSlug, verse.chapter, verse.verse);
                          } else {
                            addFavorite(verse);
                          }
                        }}
                        className={`p-1 -m-1 rounded transition-colors ${
                          fav ? 'text-gold-500' : 'text-ink-400 opacity-40'
                        }`}
                        title={fav ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                      >
                        <Heart className={`w-3.5 h-3.5 ${fav ? 'fill-current' : ''}`} />
                      </button>
                    </span>
                    <p className="verse-text text-lg leading-relaxed">{verse.text}</p>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Swipe hint arrows (faint) */}
        <div className="absolute left-2 top-1/2 -translate-y-1/2 text-parchment-700/20 pointer-events-none">
          <ChevronLeft className="w-8 h-8" />
        </div>
        <div className="absolute right-2 top-1/2 -translate-y-1/2 text-parchment-700/20 pointer-events-none">
          <ChevronRight className="w-8 h-8" />
        </div>
      </div>

      {/* Bottom bar */}
      <div className="mobile-bottom-bar px-4 py-3 z-20">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={prevPage}
            disabled={currentPage === 0}
            className="btn-icon disabled:opacity-30 p-3"
            aria-label="Página anterior"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Page indicator */}
          <div className="text-center">
            <p className="font-display text-xs text-gold-600">
              {currentPage + 1} / {pages.length}
            </p>
          </div>

          <button
            onClick={nextPage}
            disabled={currentPage >= pages.length - 1}
            className="btn-icon disabled:opacity-30 p-3"
            aria-label="Próxima página"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Action row */}
        <div className="flex items-center justify-around">
          <button onClick={toggleLibrary} className="btn-icon flex flex-col items-center gap-0.5 py-1" aria-label="Biblioteca">
            <Library className="w-5 h-5" />
            <span className="text-[10px] font-ui">Livros</span>
          </button>
          <button onClick={toggleSearch} className="btn-icon flex flex-col items-center gap-0.5 py-1" aria-label="Busca">
            <Search className="w-5 h-5" />
            <span className="text-[10px] font-ui">Busca</span>
          </button>
          <button
            onClick={() => {
              const v = page.verses[0];
              if (!v) return;
              if (fav) removeFavorite(page.bookSlug, page.chapter, v.verse);
              else addFavorite(v);
            }}
            className={`btn-icon flex flex-col items-center gap-0.5 py-1 ${fav ? 'fav-active' : ''}`}
            aria-label="Favoritar"
          >
            <Heart className={`w-5 h-5 ${fav ? 'fill-current' : ''}`} />
            <span className="text-[10px] font-ui">Favoritos</span>
          </button>
          <button onClick={toggleFavorites} className="btn-icon flex flex-col items-center gap-0.5 py-1" aria-label="Ver favoritos">
            <Heart className="w-5 h-5" />
            <span className="text-[10px] font-ui">Salvos</span>
          </button>
        </div>
      </div>
    </div>
  );
}
