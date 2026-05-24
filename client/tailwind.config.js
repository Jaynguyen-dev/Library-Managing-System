/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#0066cc",
        "primary-focus": "#0071e3",
        "primary-on-dark": "#2997ff",
        ink: "#1d1d1f",
        "ink-muted-80": "#333333",
        "ink-muted-48": "#7a7a7a",
        "divider-soft": "#f0f0f0",
        hairline: "#e0e0e0",
        parchment: "#f5f5f7",
        "surface-pearl": "#fafafc",
        "surface-tile-1": "#272729",
        "surface-tile-2": "#2a2a2c",
        "surface-tile-3": "#252527",
        "surface-black": "#000000",
        "chip-gray": "#d2d2d7",
        "body-muted": "#cccccc",
      },
      fontFamily: {
        display: ['"SF Pro Display"', "system-ui", "-apple-system", "sans-serif"],
        body: ['"SF Pro Text"', "system-ui", "-apple-system", "sans-serif"],
      },
      fontSize: {
        "hero": ["56px", { lineHeight: "1.07", letterSpacing: "-0.28px", fontWeight: "600" }],
        "display-lg": ["40px", { lineHeight: "1.1", letterSpacing: "0", fontWeight: "600" }],
        "display-md": ["34px", { lineHeight: "1.47", letterSpacing: "-0.374px", fontWeight: "600" }],
        "lead": ["28px", { lineHeight: "1.14", letterSpacing: "0.196px", fontWeight: "400" }],
        "tagline": ["21px", { lineHeight: "1.19", letterSpacing: "0.231px", fontWeight: "600" }],
        "body": ["17px", { lineHeight: "1.47", letterSpacing: "-0.374px" }],
        "body-strong": ["17px", { lineHeight: "1.24", letterSpacing: "-0.374px", fontWeight: "600" }],
        "caption": ["14px", { lineHeight: "1.43", letterSpacing: "-0.224px" }],
        "fine-print": ["12px", { lineHeight: "1.0", letterSpacing: "-0.12px" }],
      },
      borderRadius: {
        "pill": "9999px",
      },
      spacing: {
        "section": "80px",
      },
      boxShadow: {
        "product": "rgba(0, 0, 0, 0.22) 3px 5px 30px 0",
      },
    },
  },
  plugins: [],
}
