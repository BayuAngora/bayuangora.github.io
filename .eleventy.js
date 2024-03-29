module.exports = function(eleventyConfig) {

  eleventyConfig.addLayoutAlias("index", "index.html");
  eleventyConfig.addLayoutAlias("list", "list.html");
  eleventyConfig.addLayoutAlias("page", "page.html");
  eleventyConfig.addLayoutAlias("single", "single.html");
  eleventyConfig.addLayoutAlias("sitemap", "sitemap.html");
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
