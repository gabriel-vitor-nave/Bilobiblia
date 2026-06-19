/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Parchment page colors
        parchment: {
          50:  '#fdf8f0',
          100: '#f9eedc',
          200: '#f5e6c8',
          300: '#efd4a8',
          400: '#e8c088',
          500: '#dcaa68',
          600: '#c4904a',
          700: '#a07035',
          800: '#7d5228',
          900: '#5c3a1c',
        },
        // Ink / text
        ink: {
          50:  '#f5eee9',
          100: '#e8d5c8',
          200: '#c9a888',
          300: '#a8784e',
          400: '#7a4f2e',
          500: '#4a2c12',
          600: '#3d2310',
          700: '#2c1810',
          800: '#1e100a',
          900: '#120a06',
        },
        // Gold ornaments
        gold: {
          300: '#e8d07a',
          400: '#d4b94a',
          500: '#c9a84c',
          600: '#b08830',
          700: '#8c6820',
          800: '#6a4c14',
        },
        // Leather cover
        leather: {
          700: '#4a2010',
          800: '#3d1f0d',
          900: '#2c1608',
        },
        // Background
        void: '#0f0806',
      },
      fontFamily: {
        serif:    ['"Crimson Text"', '"IM Fell English"', 'Georgia', 'serif'],
        display:  ['"Cinzel"', '"Crimson Text"', 'serif'],
        body:     ['"Crimson Text"', 'serif'],
        ui:       ['"Inter"', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'verse': ['1.125rem', { lineHeight: '1.9' }],
      },
      boxShadow: {
        'book':     '0 25px 60px rgba(0,0,0,0.8), 0 10px 30px rgba(0,0,0,0.6)',
        'page':     '-8px 0 20px rgba(0,0,0,0.3), inset -4px 0 8px rgba(0,0,0,0.1)',
        'ornament': '0 0 20px rgba(201,168,76,0.3)',
      },
      backgroundImage: {
        'parchment-texture': "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23noise)' opacity='0.08'/%3E%3C/svg%3E\")",
      },
      animation: {
        'fade-in':     'fadeIn 0.6s ease-out forwards',
        'slide-up':    'slideUp 0.5s ease-out forwards',
        'glow-pulse':  'glowPulse 3s ease-in-out infinite',
        'page-turn':   'pageTurn 0.8s ease-in-out',
      },
      keyframes: {
        fadeIn:    { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp:   { from: { opacity: '0', transform: 'translateY(20px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(201,168,76,0.2)' },
          '50%':       { boxShadow: '0 0 40px rgba(201,168,76,0.5)' },
        },
        pageTurn: {
          '0%':   { transform: 'rotateY(0deg)' },
          '100%': { transform: 'rotateY(-180deg)' },
        },
      },
    },
  },
  plugins: [],
}

