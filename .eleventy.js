module.exports = function(eleventyConfig) {

  eleventyConfig.addLayoutAlias("index", "index.html");
  eleventyConfig.addLayoutAlias("list", "list.html");
  eleventyConfig.addLayoutAlias("page", "page.html");
  eleventyConfig.addLayoutAlias("single", "single.html");
  eleventyConfig.addLayoutAlias("sitemap", "sitemap.html");

  eleventyConfig.addPassthroughCopy("static");
  eleventyConfig.addPassthroughCopy({ "static": "/" });

return {
  dir: {
    input: ".",
    output: "_site",
    data: "layouts",
    layouts: "layouts/_default",
    includes: "layouts/partials"
  },
  passthroughFileCopy: true,
  htmlTemplateEngine: "liquid",
  templateFormats: ["html", "md"]
  };
};
