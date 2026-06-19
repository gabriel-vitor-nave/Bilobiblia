import React, { forwardRef } from 'react';
import type { Page } from '../../types';

interface PageComponentProps {
  page: Page;
  pageIndex: number;
  totalPages: number;
}

// react-pageflip requires pages wrapped in forwardRef
export const PageComponent = forwardRef<HTMLDivElement, PageComponentProps>(
  ({ page, pageIndex, totalPages }, ref) => {
    const isEven = pageIndex % 2 === 0;

    return (
      <div ref={ref} className="page-surface w-full h-full overflow-hidden select-none">
        <div className="h-full flex flex-col px-8 py-6 relative">

          {/* Header */}
          <div className={`flex items-center mb-4 pb-2 border-b border-ink-200/30 ${isEven ? 'flex-row' : 'flex-row-reverse'}`}>
            <span className="page-book-title flex-1 truncate">{page.book}</span>
            <span className="font-display text-xs text-gold-600 tracking-wide">
              Cap. {page.chapter}
            </span>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            {page.verses.map((verse) => (
              <div key={`${verse.chapter}-${verse.verse}`} className="mb-3 flex gap-2">
                <span className="verse-number shrink-0 mt-1">{verse.verse}</span>
                <p className="verse-text leading-relaxed">{verse.text}</p>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className={`flex items-center mt-4 pt-2 border-t border-ink-200/30 text-xs font-ui text-ink-400 ${isEven ? 'flex-row' : 'flex-row-reverse'}`}>
            <span className="flex-1">{page.book} | Cap. {page.chapter}</span>
            <span>{page.pageNumber}</span>
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
