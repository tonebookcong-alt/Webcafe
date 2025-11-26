/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // bảng màu “coffee” nhẹ nhàng
        coffee: {
          50:  "#f7f3f0",
          100: "#efe7e1",
          200: "#e0cfc3",
          300: "#d1b7a5",
          400: "#c39f87",
          500: "#b48669",  // chính
          600: "#9a6f54",
          700: "#7a5843",
          800: "#5c4232",
          900: "#3e2c21",
        },
      },
      fontFamily: {
        display: ["ui-serif","Georgia","Cambria","Times New Roman","Times", "serif"],
        body: ["ui-sans-serif","system-ui","-apple-system","Segoe UI","Roboto","Helvetica Neue","Arial","Noto Sans","sans-serif"],
      },
    },
  },
  plugins: [],
};
