import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Cover } from '../components/Cover/Cover';
import { useBookStore } from '../store/bookStore';

export function Landing() {
  const { isOpen, pages, currentPage, loadContent } = useBookStore();
  const navigate = useNavigate();

  useEffect(() => {
    loadContent();
  }, [loadContent]);

  useEffect(() => {
    if (isOpen && pages.length > 0) {
      const activePage = pages[currentPage] || pages[0];
      navigate(`/${activePage.bookSlug}/${activePage.localPageNumber}`);
    }
  }, [isOpen, pages, currentPage, navigate]);

  return <Cover />;
}
