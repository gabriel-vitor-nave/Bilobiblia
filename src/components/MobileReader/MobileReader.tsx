import { useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { ChevronLeft, ChevronRight, Library, Search, X } from 'lucide-react';
import { useBookStore } from '../../store/bookStore';
import { VerseMarkdown } from '../VerseMarkdown';

export function MobileReader() {
  const {
    pages,
    currentPage,
    nextPage,
    prevPage,
    closeBook,
    toggleLibrary,
    toggleSearch,
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

  return (
    <div className="min-h-dvh flex flex-col bg-void relative overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 glass-panel border-b border-gold-800/20 z-20 select-none">
        <button onClick={closeBook} className="btn-icon p-1.5" aria-label="Fechar">
          <X className="w-5 h-5" />
        </button>
        <div className="text-center min-w-0">
          <p className="font-display text-xs text-gold-500 tracking-widest truncate">{page.book}</p>
          <p className="font-ui text-xs text-parchment-500 truncate max-w-[180px]" title={page.chapterName}>
            Cap. {page.chapter}
            {page.chapterName ? ` - ${page.chapterName}` : ''}
          </p>
        </div>
        <div className="w-8" />
      </div>

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
              <div className="ornament-divider mb-6 select-none">
                <span className="font-display text-xs text-gold-600 tracking-widest uppercase text-center text-balance px-4">
                  Capitulo {page.chapter}
                  {page.chapterName ? `: ${page.chapterName}` : ''}
                </span>
              </div>

              {page.verses.map((verse) => (
                <div key={`${verse.chapter}-${verse.verse}`} className="mb-4 flex gap-3 items-start">
                  <span className="verse-number shrink-0 mt-1 text-sm select-none">{verse.verse}</span>
                  <VerseMarkdown text={verse.text} className="verse-text text-lg leading-relaxed select-text" />
                </div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="absolute left-2 top-1/2 -translate-y-1/2 text-parchment-700/20 pointer-events-none">
          <ChevronLeft className="w-8 h-8" />
        </div>
        <div className="absolute right-2 top-1/2 -translate-y-1/2 text-parchment-700/20 pointer-events-none">
          <ChevronRight className="w-8 h-8" />
        </div>
      </div>

      <div className="mobile-bottom-bar px-4 py-3 z-20 select-none">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={prevPage}
            disabled={currentPage === 0}
            className="btn-icon disabled:opacity-30 p-3"
            aria-label="Pagina anterior"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <div className="text-center">
            <p className="font-display text-xs text-gold-600">
              {currentPage + 1} / {pages.length}
            </p>
          </div>

          <button
            onClick={nextPage}
            disabled={currentPage >= pages.length - 1}
            className="btn-icon disabled:opacity-30 p-3"
            aria-label="Proxima pagina"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        <div className="flex items-center justify-around">
          <button onClick={toggleLibrary} className="btn-icon flex flex-col items-center gap-0.5 py-1" aria-label="Biblioteca">
            <Library className="w-5 h-5" />
            <span className="text-[10px] font-ui">Livros</span>
          </button>
          <button onClick={toggleSearch} className="btn-icon flex flex-col items-center gap-0.5 py-1" aria-label="Busca">
            <Search className="w-5 h-5" />
            <span className="text-[10px] font-ui">Busca</span>
          </button>
        </div>
      </div>
    </div>
  );
}
