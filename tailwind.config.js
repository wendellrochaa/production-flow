/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        chao: "#ffffff", texto: "#111827", apagado: "#6B7280", risco: "#E5E7EB",
        painel: "#F8FAFC", ok: "#16A34A", parado: "#DC2626", sinal: "#2563EB", atencao: "#D97706"
      },
      fontFamily: { sans: ["Inter", "ui-sans-serif", "system-ui"], mono: ["ui-monospace", "SFMono-Regular", "monospace"] }
    }
  },
  plugins: []
};
