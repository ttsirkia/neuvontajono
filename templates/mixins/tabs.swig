{%- macro renderTabs() -%}
<ul class="nav nav-tabs">
  <li><a href="/neuvontajono/queue">Jonotus</a></li>
  <li><a href="/neuvontajono/sessions">Harjoitusryhmät</a></li>
  
  {% if course.statisticsLevel == 0 %}
  <li><a href="/neuvontajono/statistics">Tilastot</a></li>
  {% elif course.statisticsLevel == 1 and staff %}
  <li><a href="/neuvontajono/statistics">Tilastot</a></li>
  {% elif course.statisticsLevel == 2 and teacher %}
  <li><a href="/neuvontajono/statistics">Tilastot</a></li>
  {% endif %}
  
  {% if staff %}
  <li><a href="/neuvontajono/selectSession">Jonon hallinta</a></li>
  {% endif %}
  {% if teacher %}
  <li><a href="/neuvontajono/settings">Kurssin asetukset</a></li>
  {% endif %}  
</ul>
{%- endmacro -%}