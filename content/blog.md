---
title: Blog
layout: list
permalink: "blog/{% if pagination.pageNumber > 0 %}{{ pagination.pageNumber | plus: 1 }}{% endif %}/index.html"
pagination:
  size: 6
  alias: blogs
  reverse: true
  data: collections.blog
---

{% for blog in blogs %}
<article class="list">
<a href="{{ blog.url }}">
<header class="list-header">
<h2>{{ blog.data.title }}</h2>
</header>
<div class="list-content">
<h3>
{% excerpt blog %}..
</h3>
</div>
</a>
</article>
{% endfor %}
