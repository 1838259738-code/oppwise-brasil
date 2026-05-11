import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        db: {
          red: '#EC0012',
          dark: '#2C2C2C',
          gray: '#575757',
          light: '#F2F2F2',
          white: '#FFFFFF',
          border: '#D3D3D3',
        }
      },
      fontFamily: {
        db: ['DB Sans', 'Helvetica Neue', 'Arial', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
export default config