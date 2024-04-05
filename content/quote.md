---
title: Quote
layout: list
summary: Quote by Bayu Angora
permalink: "quote/{% if pagination.pageNumber > 0 %}{{ pagination.pageNumber | plus: 1 }}{% endif %}/index.html"
pagination:
  size: 6
  alias: quotes
  reverse: true
  data: collections.quote
---

{% for quote in quotes %}
<article class="box">
<a href="{{ site.baseurl }}quote/{{ blog.data.title | slug }}/">
<div class="title">
<h2>{{ quote.data.title }}</h2>
</div>
<div class="content">
{{ content }}
</div>
</a>
</article>
{% endfor %}
