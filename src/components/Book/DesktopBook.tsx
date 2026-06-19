import { useRef, useCallback, useEffect, useState } from 'react';
import HTMLFlipBook from 'react-pageflip';
import { ChevronLeft, ChevronRight, Search, Heart, Library, X, Navigation } from 'lucide-react';
import { useBookStore } from '../../store/bookStore';
import { PageComponent } from './PageComponent';

export function DesktopBook() {
  const {
    pages,
    currentPage,
    goToPage,
    nextPage,
    prevPage,
    closeBook,
    toggleLibrary,
    toggleSearch,
    toggleFavorites,
  } = useBookStore();

  const bookRef = useRef<any>(null);
  const [jumpInput, setJumpInput] = useState('');
  const [showJump, setShowJump] = useState(false);

  // Sync external page changes to the flipbook widget
  useEffect(() => {
    if (bookRef.current) {
      const flip = bookRef.current.pageFlip?.();
      if (flip) {
        try {
          const currentFlipPage = flip.getCurrentPageIndex();
          if (currentFlipPage !== currentPage) {
            flip.flip(currentPage);
          }
        } catch (err) {
          console.warn('Erro ao sincronizar página do flipbook:', err);
        }
      }
    }
  }, [currentPage]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      if (e.key === 'ArrowRight' || e.key === 'PageDown') nextPage();
      if (e.key === 'ArrowLeft'  || e.key === 'PageUp')   prevPage();
      if (e.key === 'Escape') closeBook();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [nextPage, prevPage, closeBook]);

  const handleFlip = useCallback((e: any) => {
    goToPage(e.data);
  }, [goToPage]);

  const handleJump = () => {
    const num = parseInt(jumpInput, 10);
    if (!isNaN(num) && num >= 1 && num <= pages.length) {
      goToPage(num - 1);
    }
    setJumpInput('');
    setShowJump(false);
  };

  const page = pages[currentPage];

  // Calculate book dimensions based on viewport
  const pageW = Math.min(420, Math.floor((window.innerWidth - 120) / 2));
  const pageH = Math.min(600, window.innerHeight - 120);

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center relative bg-void py-4">

      {/* Ambient table glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-64
                        bg-gradient-to-t from-leather-900/40 to-transparent opacity-60" />
      </div>

      {/* Top toolbar */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-6 py-3 z-30">
        <div className="flex items-center gap-2">
          <button onClick={closeBook} className="btn-icon" title="Fechar livro">
            <X className="w-5 h-5" />
          </button>
          <span className="font-display text-sm text-gold-600 tracking-widest ml-2">
            Bilobíblia
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button onClick={toggleLibrary} className="btn-icon" title="Biblioteca">
            <Library className="w-5 h-5" />
          </button>
          <button onClick={toggleSearch} className="btn-icon" title="Busca">
            <Search className="w-5 h-5" />
          </button>
          <button onClick={toggleFavorites} className="btn-icon" title="Favoritos">
            <Heart className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowJump(!showJump)}
            className="btn-icon"
            title="Ir para página"
          >
            <Navigation className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Jump to page */}
      {showJump && (
        <div className="absolute top-14 right-4 z-40 glass-panel rounded-lg p-3 flex items-center gap-2 shadow-xl">
          <span className="font-ui text-xs text-parchment-400">Página:</span>
          <input
            type="number"
            min={1}
            max={pages.length}
            value={jumpInput}
            onChange={(e) => setJumpInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleJump()}
            autoFocus
            className="w-20 bg-transparent border-b border-gold-600 text-parchment-200 font-ui text-sm px-1 py-0.5 outline-none text-center"
            placeholder={`1–${pages.length}`}
          />
          <button onClick={handleJump} className="btn-gold text-xs px-3 py-1">Ir</button>
        </div>
      )}

      {/* The Flip Book */}
      <div className="relative" style={{ filter: 'drop-shadow(0 30px 60px rgba(0,0,0,0.8))' }}>
        {pages.length > 0 && (
          <HTMLFlipBook
            ref={bookRef}
            width={pageW}
            height={pageH}
            size="fixed"
            minWidth={280}
            maxWidth={500}
            minHeight={400}
            maxHeight={700}
            maxShadowOpacity={0.6}
            showCover={false}
            drawShadow={true}
            flippingTime={800}
            usePortrait={false}
            startPage={currentPage}
            mobileScrollSupport={false}
            onFlip={handleFlip}
            className="book-ui"
            style={{}}
            startZIndex={10}
            autoSize={false}
            clickEventForward={true}
            useMouseEvents={true}
            swipeDistance={30}
            showPageCorners={true}
            disableFlipByClick={true}
          >
            {pages.map((page, i) => (
              <PageComponent
                key={page.pageNumber}
                page={page}
                pageIndex={i}
                totalPages={pages.length}
              />
            ))}
          </HTMLFlipBook>
        )}
      </div>

      {/* Navigation arrows */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-6 z-20">
        <button
          onClick={prevPage}
          disabled={currentPage === 0}
          className="btn-icon disabled:opacity-30 disabled:cursor-not-allowed"
          title="Página anterior"
        >
          <ChevronLeft className="w-7 h-7" />
        </button>

        <div className="text-center">
          <p className="font-ui text-xs text-parchment-600">
            {page ? `${page.book} · Cap. ${page.chapter}${page.chapterName ? ` (${page.chapterName})` : ''}` : ''}
          </p>
          <p className="font-display text-sm text-gold-600">
            {currentPage + 1} / {pages.length}
          </p>
        </div>

        <button
          onClick={nextPage}
          disabled={currentPage >= pages.length - 1}
          className="btn-icon disabled:opacity-30 disabled:cursor-not-allowed"
          title="Próxima página"
        >
          <ChevronRight className="w-7 h-7" />
        </button>
      </div>
    </div>
  );
}
