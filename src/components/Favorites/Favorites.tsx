import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Trash2, ArrowRight } from 'lucide-react';
import { useBookStore } from '../../store/bookStore';

export function Favorites() {
  const { favorites, showFavorites, toggleFavorites, goToVerse, removeFavorite } = useBookStore();

  const handleGoToVerse = (bookSlug: string, chapter: number, verse: number) => {
    goToVerse(bookSlug, chapter, verse);
    toggleFavorites();
  };

  return (
    <AnimatePresence>
      {showFavorites && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleFavorites}
            className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
          />

          {/* Drawer (slides in from right) */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 350, damping: 35 }}
            className="fixed inset-y-0 right-0 z-50 w-80 glass-panel flex flex-col border-l border-gold-800/30"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gold-800/30">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-gold-500 fill-gold-500/20" />
                <h2 className="font-display text-base text-gold-400 tracking-wide">Favoritos</h2>
              </div>
              <button onClick={toggleFavorites} className="btn-icon p-1" aria-label="Fechar favoritos">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto no-scrollbar py-2">
              {favorites.length === 0 ? (
                <div className="px-6 py-12 text-center h-full flex flex-col items-center justify-center">
                  <Heart className="w-8 h-8 text-parchment-600/40 mb-3" />
                  <p className="font-serif text-sm text-parchment-400 italic">
                    Nenhum versículo favoritado.
                  </p>
                  <p className="font-ui text-[11px] text-parchment-600 mt-2 max-w-[200px]">
                    Toque no coração ao lado de qualquer versículo para guardá-lo aqui.
                  </p>
                </div>
              ) : (
                favorites.map((fav) => (
                  <div
                    key={`${fav.bookSlug}-${fav.chapter}-${fav.verse}`}
                    className="px-5 py-4 border-b border-gold-900/10 hover:bg-parchment-100/5 transition-colors group relative"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0 pr-8">
                        <p className="font-display text-xs text-gold-600 mb-1 tracking-wide">
                          {fav.book} {fav.chapter}:{fav.verse}
                        </p>
                        <p className="font-serif text-sm text-parchment-300 leading-relaxed italic">
                          "{fav.text}"
                        </p>
                        <p className="font-ui text-[10px] text-parchment-600 mt-1">
                          Página {fav.page}
                        </p>
                      </div>
                      
                      {/* Delete button (top right of item) */}
                      <button
                        onClick={() => removeFavorite(fav.bookSlug, fav.chapter, fav.verse)}
                        className="absolute top-4 right-4 text-parchment-500 hover:text-red-400 transition-colors p-1"
                        aria-label="Remover favorito"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="mt-3 flex justify-end">
                      <button
                        onClick={() => handleGoToVerse(fav.bookSlug, fav.chapter, fav.verse)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded
                                   font-ui text-[11px] text-gold-500 border border-gold-800/40
                                   hover:border-gold-500 hover:bg-gold-500/10 transition-all duration-200"
                      >
                        Ir para o livro <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-gold-800/20">
              <p className="font-ui text-[10px] text-parchment-700 text-center">
                {favorites.length} versículo{favorites.length !== 1 ? 's' : ''} salvo{favorites.length !== 1 ? 's' : ''}
              </p>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
