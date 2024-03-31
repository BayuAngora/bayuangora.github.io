---
title: Blog
layout: list
permalink: /blog/
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
