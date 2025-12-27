// postcss.config.js
module.exports = {
  plugins: [
    require('@tailwindcss/postcss'),  // Đảm bảo sử dụng đúng plugin này
    require('autoprefixer')  // Đảm bảo có Autoprefixer
  ],
};
