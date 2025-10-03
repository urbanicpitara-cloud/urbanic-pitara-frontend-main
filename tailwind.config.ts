import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // COLORS
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        jet: 'var(--jet)',
        "caribbean-current": 'var(--caribbean-current)',
        white: 'var(--white)',
        platinum: 'var(--platinum)',
        "indigo-dye": 'var(--indigo-dye)',
      },

      // GRADIENTS
      backgroundImage: {
        "gradient-top": 'var(--gradient-top)',
        "gradient-right": 'linear-gradient(90deg, var(--jet), var(--caribbean-current), var(--white), var(--platinum), var(--indigo-dye))',
        "gradient-bottom": 'linear-gradient(180deg, var(--jet), var(--caribbean-current), var(--white), var(--platinum), var(--indigo-dye))',
        "gradient-left": 'linear-gradient(270deg, var(--jet), var(--caribbean-current), var(--white), var(--platinum), var(--indigo-dye))',
        "gradient-top-right": 'linear-gradient(45deg, var(--jet), var(--caribbean-current), var(--white), var(--platinum), var(--indigo-dye))',
        "gradient-bottom-right": 'linear-gradient(135deg, var(--jet), var(--caribbean-current), var(--white), var(--platinum), var(--indigo-dye))',
        "gradient-top-left": 'linear-gradient(225deg, var(--jet), var(--caribbean-current), var(--white), var(--platinum), var(--indigo-dye))',
        "gradient-bottom-left": 'linear-gradient(315deg, var(--jet), var(--caribbean-current), var(--white), var(--platinum), var(--indigo-dye))',
        "gradient-radial": 'radial-gradient(circle, var(--jet), var(--caribbean-current), var(--white), var(--platinum), var(--indigo-dye))',
      },

      // BORDER RADIUS
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
