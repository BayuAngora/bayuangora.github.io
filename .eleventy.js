module.exports = function(eleventyConfig) {

  eleventyConfig.addLayoutAlias("index", "index.html");
  eleventyConfig.addLayoutAlias("list", "list.html");
  eleventyConfig.addLayoutAlias("page", "page.html");
  eleventyConfig.addLayoutAlias("single", "single.html");
  eleventyConfig.addLayoutAlias("sitemap", "sitemap.html");

  eleventyConfig.addPassthroughCopy("static");
  eleventyConfig.addPassthroughCopy({ "static": "/" });

  eleventyConfig.addCollection("tagGroup", function (collectionApi) {
  return collectionApi.getFilteredByTags("blog");
});

  eleventyConfig.addShortcode("excerpt", article => extractExcerpt(article));
  function extractExcerpt(article) {
    if (!article.hasOwnProperty("templateContent")) {
    return null;
  }
    let excerpt = null;
    const content = article.templateContent;
    const separatorsList = [
    { start: "<p>", end: "</p>" }
  ];
  separatorsList.some(separators => {
    const startPosition = content.indexOf(separators.start);
    const endPosition = content.indexOf(separators.end);
    if (startPosition !== -1 && endPosition !== -1) {
      excerpt = content.substring(startPosition + separators.start.length, endPosition).trim();
      return true;
    }
  });
  return excerpt;
};

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
