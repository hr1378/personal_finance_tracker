/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Backgrounds
        bg: {
          base: '#fafbfc',
          surface: '#ffffff',
          muted: '#f5f6f7',
        },
        
        // Text colors - refined grayscale
        text: {
          primary: '#111827',      // Near black
          secondary: '#4b5563',    // Muted gray
          tertiary: '#9ca3af',     // Light gray
          inverse: '#ffffff',
        },
        
        // Accent colors - sophisticated and muted
        accent: {
          primary: '#0d9488',      // Refined teal
          primaryHover: '#0f766e',
          primaryLight: '#ccfbf1',
          
          success: '#059669',       // Muted emerald
          successLight: '#d1fae5',
          
          danger: '#dc2626',        // Refined red
          dangerLight: '#fee2e2',
          
          warning: '#d97706',       // Refined amber
          warningLight: '#fef3c7',
          
          info: '#2563eb',          // Refined blue
          infoLight: '#dbeafe',
        },
        
        // Border colors - subtle
        border: {
          base: '#e5e7eb',
          subtle: '#f3f4f6',
          hover: '#d1d5db',
        },
        
        // Semantic colors for charts
        chart: {
          income: '#0d9488',
          expense: '#dc2626',
          neutral: '#9ca3af',
        },
      },
      
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      
      borderRadius: {
        'card': '12px',
        'button': '8px',
      },
      
      boxShadow: {
        'card': '0 1px 2px 0 rgb(0 0 0 / 0.05), 0 1px 3px 1px rgb(0 0 0 / 0.05)',
        'card-hover': '0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
        'subtle': '0 1px 2px 0 rgb(0 0 0 / 0.03)',
      },
      
      spacing: {
        '18': '4.5rem',
      },
    },
  },
  plugins: [],
}
