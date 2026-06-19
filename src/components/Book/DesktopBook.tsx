import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Search, Library, X, Navigation } from 'lucide-react';
import { useBookStore } from '../../store/bookStore';
import { PageComponent } from './PageComponent';

export function DesktopBook() {
  const {
    pages,
    currentPage,
    goToPage,
    closeBook,
    toggleLibrary,
    toggleSearch,
  } = useBookStore();

  const [jumpInput, setJumpInput] = useState('');
  const [showJump, setShowJump] = useState(false);
  const [viewport, setViewport] = useState({ width: window.innerWidth, height: window.innerHeight });

  const spreadStart = currentPage % 2 === 0 ? currentPage : currentPage - 1;
  const leftPage = pages[spreadStart];
  const rightPage = pages[spreadStart + 1];
  const canGoBack = spreadStart > 0;
  const canGoForward = spreadStart + 2 < pages.length;

  useEffect(() => {
    const handleResize = () => setViewport({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      if (e.key === 'ArrowRight' || e.key === 'PageDown') goForward();
      if (e.key === 'ArrowLeft' || e.key === 'PageUp') goBack();
      if (e.key === 'Escape') closeBook();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  });

  const goBack = () => {
    if (canGoBack) goToPage(Math.max(0, spreadStart - 2));
  };

  const goForward = () => {
    if (canGoForward) goToPage(spreadStart + 2);
  };

  const handleJump = () => {
    const num = parseInt(jumpInput, 10);
    if (!isNaN(num) && num >= 1 && num <= pages.length) {
      goToPage(num - 1);
    }
    setJumpInput('');
    setShowJump(false);
  };

  const pageW = Math.min(420, Math.floor((viewport.width - 140) / 2));
  const pageH = Math.min(600, viewport.height - 120);
  const endPageNumber = Math.min(spreadStart + 2, pages.length);

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center relative bg-void py-4">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-64 bg-gradient-to-t from-leather-900/40 to-transparent opacity-60" />
      </div>

      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-6 py-3 z-30 select-none">
        <div className="flex items-center gap-2">
          <button onClick={closeBook} className="btn-icon" title="Fechar livro">
            <X className="w-5 h-5" />
          </button>
          <span className="font-display text-sm text-gold-600 tracking-widest ml-2">
            Bilobiblia
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button onClick={toggleLibrary} className="btn-icon" title="Biblioteca">
            <Library className="w-5 h-5" />
          </button>
          <button onClick={toggleSearch} className="btn-icon" title="Busca">
            <Search className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowJump(!showJump)}
            className="btn-icon"
            title="Ir para pagina"
          >
            <Navigation className="w-5 h-5" />
          </button>
        </div>
      </div>

      {showJump && (
        <div className="absolute top-14 right-4 z-40 glass-panel rounded-lg p-3 flex items-center gap-2 shadow-xl select-none">
          <span className="font-ui text-xs text-parchment-400">Pagina:</span>
          <input
            type="number"
            min={1}
            max={pages.length}
            value={jumpInput}
            onChange={(e) => setJumpInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleJump()}
            autoFocus
            className="w-20 bg-transparent border-b border-gold-600 text-parchment-200 font-ui text-sm px-1 py-0.5 outline-none text-center"
            placeholder={`1-${pages.length}`}
          />
          <button onClick={handleJump} className="btn-gold text-xs px-3 py-1">Ir</button>
        </div>
      )}

      <div
        className="relative flex"
        style={{
          width: pageW * 2,
          height: pageH,
          filter: 'drop-shadow(0 30px 60px rgba(0,0,0,0.8))',
        }}
      >
        {leftPage && (
          <div className="relative h-full" style={{ width: pageW }}>
            <PageComponent page={leftPage} pageIndex={spreadStart} />
            <button
              onDoubleClick={goBack}
              disabled={!canGoBack}
              className="page-edge page-edge-left"
              aria-label="Pagina anterior"
            />
          </div>
        )}
        {rightPage ? (
          <div className="relative h-full" style={{ width: pageW }}>
            <PageComponent page={rightPage} pageIndex={spreadStart + 1} />
            <button
              onDoubleClick={goForward}
              disabled={!canGoForward}
              className="page-edge page-edge-right"
              aria-label="Proxima pagina"
            />
          </div>
        ) : (
          <div className="page-surface relative h-full" style={{ width: pageW }}>
            <button
              onDoubleClick={goForward}
              disabled={!canGoForward}
              className="page-edge page-edge-right"
              aria-label="Proxima pagina"
            />
          </div>
        )}
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-6 z-20 select-none">
        <button
          onClick={goBack}
          disabled={!canGoBack}
          className="btn-icon disabled:opacity-30 disabled:cursor-not-allowed"
          title="Paginas anteriores"
        >
          <ChevronLeft className="w-7 h-7" />
        </button>

        <div className="text-center min-w-48">
          <p className="font-ui text-xs text-parchment-600">
            {leftPage ? `${leftPage.book} · Cap. ${leftPage.chapter}${leftPage.chapterName ? ` (${leftPage.chapterName})` : ''}` : ''}
          </p>
          <p className="font-display text-sm text-gold-600">
            {spreadStart + 1}-{endPageNumber}/{pages.length}
          </p>
        </div>

        <button
          onClick={goForward}
          disabled={!canGoForward}
          className="btn-icon disabled:opacity-30 disabled:cursor-not-allowed"
          title="Proximas paginas"
        >
          <ChevronRight className="w-7 h-7" />
        </button>
      </div>
    </div>
  );
}
