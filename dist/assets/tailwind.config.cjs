module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        brand: ["Poppins", "sans-serif"], // ใช้สำหรับหัวข้อ
        body: ["Inter", "sans-serif"], // ใช้สำหรับข้อความปกติ
      },
    },
  },
  plugins: [],
};
