module.exports = function(eleventyConfig) {

  eleventyConfig.addPassthroughCopy("static");

  return {
    dir: {
      input: ".",
      output: "_site",
      data: "layouts",
      layouts: "layouts/_default",
      includes: "layouts/partials"
    },
    passthroughFileCopy: true
  }
}
