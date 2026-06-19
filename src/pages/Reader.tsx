import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBookStore } from '../store/bookStore';
import { DesktopBook } from '../components/Book/DesktopBook';
import { MobileReader } from '../components/MobileReader/MobileReader';
import { Library } from '../components/Library/Library';
import { Search } from '../components/Search/Search';

export function Reader() {
  const { bookSlug, pageNumber } = useParams();
  const navigate = useNavigate();
  const {
    pages,
    currentPage,
    isOpen,
    isLoading,
    loadContent,
    goToPage,
    openBook,
  } = useBookStore();

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Resize handler to switch between mobile and desktop reader views
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load content if not already loaded
  useEffect(() => {
    if (pages.length === 0 && !isLoading) {
      loadContent();
    }
  }, [pages.length, isLoading, loadContent]);

  // Sync URL params to store
  useEffect(() => {
    if (pages.length === 0) return;

    if (bookSlug && pageNumber) {
      const pageNum = parseInt(pageNumber, 10);
      const targetPage = pages.find(
        (p) => p.bookSlug === bookSlug && p.localPageNumber === pageNum
      );

      if (targetPage) {
        const targetIdx = targetPage.pageNumber - 1;
        if (useBookStore.getState().currentPage !== targetIdx) {
          goToPage(targetIdx);
        }
        if (!isOpen) {
          openBook(targetIdx);
        }
      } else {
        // Fallback if page not found
        navigate('/', { replace: true });
      }
    }
  }, [bookSlug, pageNumber, pages, isOpen, goToPage, openBook, navigate]);

  // Sync store currentPage changes to URL
  useEffect(() => {
    if (pages.length === 0 || !isOpen) return;

    const activePage = pages[currentPage];
    if (activePage) {
      // Use replace: true so page flips don't clog up the browser history stack
      navigate(`/${activePage.bookSlug}/${activePage.localPageNumber}`, { replace: true });
    }
  }, [currentPage, pages, isOpen, navigate]);

  // If user closes the book, return to the landing page
  useEffect(() => {
    if (!isOpen && pages.length > 0) {
      navigate('/');
    }
  }, [isOpen, pages.length, navigate]);

  if (isLoading || pages.length === 0) {
    return (
      <div className="min-h-dvh bg-void flex flex-col items-center justify-center font-ui text-parchment-400 gap-4">
        <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
        <p className="font-display text-sm tracking-widest text-gold-500 uppercase">
          Carregando Escrituras Sagradas…
        </p>
      </div>
    );
  }

  return (
    <div className="relative min-h-dvh overflow-hidden">
      {/* Reader View */}
      {isMobile ? <MobileReader /> : <DesktopBook />}

      {/* Sidebars / Modals */}
      <Library />
      <Search />
    </div>
  );
}
