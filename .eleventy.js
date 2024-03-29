module.exports = function(eleventyConfig) {

  eleventyConfig.addPassthroughCopy({ "static": "/" });

return {
  dir: {
    input: ".",
    output: "_site",
    data: "static",
    layouts: "layouts/_default",
    includes: "layouts/partials"
  },
  templateFormats : ["md", "njk", "html"],
  markdownTemplateEngine : "njk",
  htmlTemplateEngine : "njk",
  passthroughFileCopy: true
  };
};
