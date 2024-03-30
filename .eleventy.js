module.exports = function(eleventyConfig) {

  eleventyConfig.addPassthroughCopy("static");
  eleventyConfig.addPassthroughCopy({ "static": "/" });
  
  eleventyConfig.addLayoutAlias("index", "index.html");
  eleventyConfig.addLayoutAlias("list", "list.html");
  eleventyConfig.addLayoutAlias("page", "page.html");
  eleventyConfig.addLayoutAlias("single", "single.html");
  eleventyConfig.addLayoutAlias("sitemap", "sitemap.html");

const options = {
    html: true,
    breaks: true,
    linkify: false
  };

return {
  dir: {
    input: ".",
    output: "_site",
    data: "static",
    layouts: "layouts/_default",
    includes: "layouts/partials"
  },
  passthroughFileCopy: true,
  htmlTemplateEngine: "liquid",
  templateFormats: ["html", "md"]
  };
};
