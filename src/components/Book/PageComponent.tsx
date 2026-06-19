import { forwardRef } from 'react';
import type { Page } from '../../types';
import { Heart } from 'lucide-react';
import { useBookStore } from '../../store/bookStore';

interface PageComponentProps {
  page: Page;
  pageIndex: number;
  totalPages: number;
}

// react-pageflip requires pages wrapped in forwardRef
export const PageComponent = forwardRef<HTMLDivElement, PageComponentProps>(
  ({ page, pageIndex }, ref) => {
    const isEven = pageIndex % 2 === 0;
    const { addFavorite, removeFavorite, isFavorite } = useBookStore();

    // Split verses into two columns to economize pages
    const half = Math.ceil(page.verses.length / 2);
    const leftColumn = page.verses.slice(0, half);
    const rightColumn = page.verses.slice(half);

    const renderVerse = (verse: typeof page.verses[0]) => {
      const fav = isFavorite(verse.bookSlug, verse.chapter, verse.verse);
      return (
        <div
          key={`${verse.chapter}-${verse.verse}`}
          className={`flex gap-2 group/verse p-1 rounded transition-all duration-200 ${
            fav ? 'bg-gold-500/10 border-l-2 border-gold-500/60 pl-1.5 -ml-1' : ''
          }`}
        >
          <span className="verse-number shrink-0 mt-0.5 flex items-center gap-1 select-none">
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
              className={`transition-opacity duration-200 p-0.5 cursor-pointer rounded hover:bg-ink-100/10 ${
                fav ? 'opacity-100 text-gold-500' : 'opacity-0 group-hover/verse:opacity-100 text-ink-300'
              }`}
              title={fav ? "Remover dos favoritos" : "Adicionar aos favoritos"}
            >
              <Heart className={`w-3 h-3 ${fav ? 'fill-current' : ''}`} />
            </button>
          </span>
          <p className="verse-text text-sm leading-relaxed text-ink-700">{verse.text}</p>
        </div>
      );
    };

    return (
      <div ref={ref} className="page-surface w-full h-full overflow-hidden select-none">
        <div className="h-full flex flex-col px-8 py-6 relative">

          {/* Header (Centered page number with line divider, matching image) */}
          <div className="text-center mb-5">
            <span className="font-display text-lg text-ink-700 tracking-widest font-bold">
              {String(page.localPageNumber).padStart(3, '0')}
            </span>
            <div className="h-px bg-ink-200/20 mt-2" />
          </div>

          {/* Content (Two columns layout) */}
          <div className="flex-1 grid grid-cols-2 gap-6 overflow-hidden min-h-0">
            {/* Left Column */}
            <div className="flex flex-col gap-2 overflow-hidden">
              {leftColumn.map(renderVerse)}
            </div>

            {/* Right Column */}
            <div className="flex flex-col gap-2 overflow-hidden">
              {rightColumn.map(renderVerse)}
            </div>
          </div>

          {/* Footer (Book name and chapter/chapterName only, no page number) */}
          <div className={`flex items-center mt-4 pt-2 border-t border-ink-200/30 text-xs font-ui text-ink-400 ${isEven ? 'flex-row' : 'flex-row-reverse'}`}>
            <span className="flex-1 truncate">
              {page.book} | Cap. {page.chapter}{page.chapterName ? ` (${page.chapterName})` : ''}
            </span>
          </div>

          {/* Decorative corner */}
          <div className={`absolute top-3 ${isEven ? 'right-3' : 'left-3'} text-gold-600/20 text-xs select-none`}>
            ✦
          </div>
        </div>
      </div>
    );
  }
);

PageComponent.displayName = 'PageComponent';

