module.exports = function(eleventyConfig) {

  eleventyConfig.addPassthroughCopy("static");

  return {
    dir: {
      data: ".",
      input: ".",
      output: "_site",
      layouts: "layouts/_default",
      includes: "layouts/partials"
    },
    passthroughFileCopy: true
  }
}
