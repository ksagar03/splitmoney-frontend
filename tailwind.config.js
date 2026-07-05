/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this array with the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Surfaces (dark) — use opacity modifiers (e.g. bg-brand/10) for tints
        background: "#080812",
        surface: "#0E0E1C",
        "surface-alt": "#090915",
        "surface-focus": "#0C0C1A",
        "surface-raised": "#13132A",
        avatar: "#2A2A3C",
        // Brand
        brand: "#8B5CF6",
        "brand-blue": "#3B82F6",
        // Text / ink
        ink: "#FFFFFF",
        "ink-muted": "#9CA3AF",
        "ink-faint": "#6B7280",
        "ink-placeholder": "#3D3D5C",
        // Semantic
        success: "#10B981",
        danger: "#EF4444",
      },
      borderRadius: {
        "2.5xl": "20px",
        "4xl": "28px",
      },
    },
  },
  plugins: [],
}
