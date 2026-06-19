import { motion } from 'framer-motion';
import { BookOpen, Sparkles } from 'lucide-react';
import { useBookStore } from '../../store/bookStore';

const ORN = '✦';

export function Cover() {
  const { openBook, history, isLoading, loadError } = useBookStore();

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center relative overflow-hidden px-4">

      {/* Ambient light */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                        w-[600px] h-[600px] rounded-full opacity-10
                        bg-gradient-radial from-gold-500 via-transparent to-transparent" />
      </div>

      {/* Tagline */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.8 }}
        className="mb-10 text-center"
      >
        <p className="font-display text-xs tracking-[0.4em] text-gold-600 uppercase mb-2">
          {ORN} Escrituras Sagradas {ORN}
        </p>
        <h1 className="font-display text-5xl md:text-7xl text-parchment-200 tracking-wider">
          Bilob<span className="text-gold-500">í</span>blia
        </h1>
        <p className="font-serif text-parchment-500 mt-3 italic text-lg">
          As palavras eternas de Bilola
        </p>
      </motion.div>

      {/* Book cover */}
      <motion.div
        initial={{ opacity: 0, scale: 0.85, rotateX: 8 }}
        animate={{ opacity: 1, scale: 1, rotateX: 0 }}
        transition={{ delay: 0.5, duration: 1, ease: [0.16, 1, 0.3, 1] }}
        style={{ perspective: '1200px' }}
        className="relative"
      >
        <motion.button
          onClick={!isLoading && !loadError ? () => openBook() : undefined}
          whileHover={!isLoading ? { scale: 1.03, rotateY: -3 } : {}}
          whileTap={!isLoading ? { scale: 0.98 } : {}}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="relative block cursor-pointer group"
          aria-label="Abrir a Bilobíblia"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Spine shadow */}
          <div className="absolute -left-4 top-2 bottom-2 w-4
                          bg-gradient-to-r from-black/60 to-transparent rounded-l-sm" />

          {/* Book cover */}
          <div className="leather-surface w-64 md:w-80 h-96 md:h-[28rem] rounded-r-md rounded-l-sm
                          shadow-book flex flex-col items-center justify-between p-8
                          border border-gold-800/40 relative overflow-hidden">

            {/* Top ornament border */}
            <div className="absolute top-4 left-4 right-4 h-px bg-gradient-to-r from-transparent via-gold-600/50 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 h-px bg-gradient-to-r from-transparent via-gold-600/50 to-transparent" />
            <div className="absolute top-4 bottom-4 left-4 w-px bg-gradient-to-b from-transparent via-gold-600/30 to-transparent" />
            <div className="absolute top-4 bottom-4 right-4 w-px bg-gradient-to-b from-transparent via-gold-600/30 to-transparent" />

            {/* Corner ornaments */}
            {['top-3 left-3', 'top-3 right-3', 'bottom-3 left-3', 'bottom-3 right-3'].map((pos, i) => (
              <div key={i} className={`absolute ${pos} text-gold-700/70 text-lg select-none`}>
                {i === 0 ? '⌐' : i === 1 ? '¬' : i === 2 ? 'L' : '⌐'}
              </div>
            ))}

            {/* Top section */}
            <div className="text-center mt-4">
              <p className="font-display text-xs tracking-[0.3em] text-gold-600 uppercase mb-3">
                As Escrituras
              </p>
              <div className="w-10 h-px bg-gold-600/50 mx-auto mb-3" />
            </div>

            {/* Center emblem */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="w-24 h-24 rounded-full border border-gold-700/50
                                flex items-center justify-center
                                bg-gradient-to-br from-gold-800/20 to-transparent
                                shadow-ornament animate-glow-pulse">
                  <BookOpen className="w-10 h-10 text-gold-500" strokeWidth={1} />
                </div>
                <Sparkles className="absolute -top-2 -right-2 w-5 h-5 text-gold-600/70" />
              </div>

              <div className="text-center">
                <h2 className="font-display text-3xl text-parchment-200 tracking-widest">
                  Bilob<span className="text-gold-500">í</span>blia
                </h2>
                <p className="font-serif text-xs text-gold-700 italic mt-1 tracking-wide">
                  Segundo Bilola
                </p>
              </div>
            </div>

            {/* Bottom */}
            <div className="text-center mb-4">
              <div className="w-10 h-px bg-gold-600/50 mx-auto mb-3" />
              {isLoading ? (
                <div className="flex items-center gap-2 text-gold-600 text-xs font-ui">
                  <div className="w-3 h-3 border border-gold-600 border-t-transparent rounded-full animate-spin" />
                  Carregando escrituras…
                </div>
              ) : loadError ? (
                <p className="text-red-400 text-xs font-ui">{loadError}</p>
              ) : (
                <motion.p
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                  className="font-display text-xs tracking-[0.2em] text-gold-600/80 uppercase"
                >
                  Toque para abrir
                </motion.p>
              )}
            </div>

            {/* Hover glow overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-gold-500/0 to-gold-500/0
                            group-hover:from-gold-500/5 group-hover:to-transparent
                            transition-all duration-500 pointer-events-none rounded-r-md" />
          </div>

          {/* Page stack (book pages visible on right side) */}
          <div className="absolute right-0 top-2 bottom-2 w-3 overflow-hidden rounded-r-sm">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="w-full bg-parchment-200"
                style={{
                  height: `${100 / 12}%`,
                  opacity: 0.6 + i * 0.03,
                  borderBottom: '1px solid rgba(150,110,60,0.3)',
                }}
              />
            ))}
          </div>
        </motion.button>
      </motion.div>

      {/* Continue reading hint */}
      {history && !isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="mt-8 text-center"
        >
          <p className="font-ui text-xs text-parchment-600">
            Continuar em{' '}
            <span className="text-gold-500 font-medium">
              {history.book} {history.chapter} — Página {history.page}
            </span>
          </p>
        </motion.div>
      )}

      {/* Bottom text */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-6 font-display text-xs tracking-widest text-parchment-700/50 uppercase"
      >
        {ORN} Boingoingoing {ORN}
      </motion.p>
    </div>
  );
}
