export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: "var(--primary)",
        "primary-light": "var(--primary-Light)",
        secondary: "var(--secondary)",
        "accent-light": "var(--accent-light)",
        accent: "var(--accent)",
        success: "var(--success)",
        warning: "var(--warning)",
        border: "var(--border)",
        "text-primary": "var(--text-primary)",
        "text-secondary": "var(--text-secondary)",
        "text-muted": "var(--text-muted)",
        background: "var(--background)",
        card: "var(--card)",
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
      }
    },
  },
  plugins: [],
}