import { forwardRef } from 'react';
import type { Page } from '../../types';
import { VerseMarkdown } from '../VerseMarkdown';

interface PageComponentProps {
  page: Page;
  pageIndex: number;
}

export const PageComponent = forwardRef<HTMLDivElement, PageComponentProps>(
  ({ page, pageIndex }, ref) => {
    const isEven = pageIndex % 2 === 0;

    const half = Math.ceil(page.verses.length / 2);
    const leftColumn = page.verses.slice(0, half);
    const rightColumn = page.verses.slice(half);

    const renderVerse = (verse: typeof page.verses[0]) => (
      <div key={`${verse.chapter}-${verse.verse}`} className="flex gap-2 p-1">
        <span className="verse-number shrink-0 mt-0.5">{verse.verse}</span>
        <VerseMarkdown text={verse.text} className="verse-text text-sm leading-relaxed text-ink-700 select-text" />
      </div>
    );

    return (
      <div ref={ref} className="page-surface w-full h-full overflow-hidden">
        <div className="h-full flex flex-col px-8 py-6 relative">
          <div className="text-center mb-5 select-none">
            <span className="font-display text-lg text-ink-700 tracking-widest font-bold">
              {String(page.localPageNumber).padStart(3, '0')}
            </span>
            <div className="h-px bg-ink-200/20 mt-2" />
          </div>

          <div className="flex-1 grid grid-cols-2 gap-6 overflow-hidden min-h-0">
            <div className="flex flex-col gap-2 overflow-hidden">{leftColumn.map(renderVerse)}</div>
            <div className="flex flex-col gap-2 overflow-hidden">{rightColumn.map(renderVerse)}</div>
          </div>

          <div
            className={`flex items-center mt-4 pt-2 border-t border-ink-200/30 text-xs font-ui text-ink-400 select-none ${
              isEven ? 'flex-row' : 'flex-row-reverse'
            }`}
          >
            <span className="flex-1 truncate">
              {page.book} | Cap. {page.chapter}
              {page.chapterName ? ` (${page.chapterName})` : ''}
            </span>
          </div>

          <div className={`absolute top-3 ${isEven ? 'right-3' : 'left-3'} text-gold-600/20 text-xs select-none`}>
            *
          </div>
        </div>
      </div>
    );
  }
);

PageComponent.displayName = 'PageComponent';
