---
title: Blog
layout: list
permalink: /blog/
summary: Blog by Bayu Angora
pagination:
  data: collections.general
  size: 2
  alias: posts
---

{%- for post in posts %}
- [{{ post.data.title }}]({{ post.url }})
{%- endfor %}

{% if pagination.href.previous %}
  <a href="{{pagination.href.previous}}">Previous Page</a>
{% endif %}
{% if pagination.href.next %}
  <a href="{{pagination.href.next}}">Next Page</a>
{% endif %}
