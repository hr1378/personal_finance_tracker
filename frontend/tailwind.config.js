/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brutalist monochrome base
        bg: {
          base: '#ffffff',
          surface: '#f4f4f0',
          muted: '#e8e8e4',
          accent: '#f0f0ec',
        },

        // High contrast text
        text: {
          primary: '#000000',
          secondary: '#333333',
          tertiary: '#666666',
          inverse: '#ffffff',
        },

        // Bold brutalist accent colors
        accent: {
          primary: '#ff3b30',      // Vibrant red
          primaryHover: '#d63026',
          primaryLight: '#ffe5e5',

          success: '#34c759',     // Bright green
          successLight: '#e8f9ee',

          danger: '#ff3b30',       // Same as primary - brutalist consistency
          dangerLight: '#ffe5e5',

          warning: '#ff9500',     // Bold orange
          warningLight: '#fff4e6',

          info: '#007aff',        // Strong blue
          infoLight: '#e6f2ff',

          yellow: '#ffcc00',      // Pure yellow
          purple: '#af52de',      // Bold purple
        },

        // Sharp, visible borders
        border: {
          base: '#000000',
          light: '#cccccc',
          accent: '#ff3b30',
        },

        // Semantic colors for charts
        chart: {
          income: '#34c759',
          expense: '#ff3b30',
          neutral: '#999999',
        },
      },

      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },

      borderRadius: {
        'none': '0',
        'sm': '2px',
        'card': '0',
        'button': '0',
      },

      boxShadow: {
        'none': 'none',
        'brutal': '4px 4px 0 0 #000000',
        'brutal-sm': '2px 2px 0 0 #000000',
        'brutal-lg': '6px 6px 0 0 #000000',
      },

      borderWidth: {
        'brutal': '3px',
        'brutal-sm': '2px',
      },

      spacing: {
        '18': '4.5rem',
      },
    },
  },
  plugins: [],
}
