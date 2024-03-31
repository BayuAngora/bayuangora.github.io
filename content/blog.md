---
title: Blog
layout: list
summary: Blog by Bayu Angora
permalink: "blog/{% if pagination.pageNumber > 0 %}{{ pagination.pageNumber | plus: 1 }}{% endif %}/index.html"
pagination:
  size: 6
  reverse: true
  data: collections.blog
---

{% for blog in blog %}
<article class="box">
<a href="{{ site.baseurl }}{{ blog.data.title | slug }}/">
<div class="title">
<h2>{{ blog.data.title }}</h2>
</div>
<div class="content">
<p>
{% excerpt blog %}..
</p>
</div>
</a>
</article>
{% endfor %}
