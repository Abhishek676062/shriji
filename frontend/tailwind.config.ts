import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        saffron: {
          DEFAULT: '#E57300',
          light: '#FFB067',
          dark: '#B35A00',
        },
        gold: {
          DEFAULT: '#D4AF37',
          light: '#E6D070',
          dark: '#AA8C2C',
        },
        cream: {
          DEFAULT: '#FDFBF7',
          light: '#FFFFFF',
          dark: '#F3EFE6',
        },
        navy: {
          DEFAULT: '#1A2A3A',
          light: '#2A4A6A',
          dark: '#0D151D',
        }
      },
      fontFamily: {
        sans: ['var(--font-inter)'],
        sanskrit: ['var(--font-noto-devanagari)'],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
export default config;
