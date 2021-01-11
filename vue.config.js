module.exports = {
  publicPath: '/',
  css: {
    loaderOptions: {
      sass: {
        prependData: `@import "./src/assets/_colors.scss";`
      }
    }
  }
}