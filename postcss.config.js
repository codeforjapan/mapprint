const sortCSSmq = require('sort-css-media-queries');

module.exports = {
  plugins: [
    require('autoprefixer')(),
    require('css-mqpacker')({
      sort: sortCSSmq
    }),
    require('cssnano')({
      autoprefixer: false,
      reduceIdents: false,
      zindex: false
    })
  ]
}
