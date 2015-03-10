{% import "../mixins/tabs.swig" as Tabs %}
{% extends "../layouts/default.swig" %}

{% block js %}
{% endblock %}

{% block content %}
<h2>{{ course.name }}</h2>

{{ Tabs.renderTabs() }}


<p>Alla olevassa taulukossa on kaikki kurssin harjoitusryhmät. Vihreällä merkityt
harjoitusryhmät ovat tänään.
{%if course.url %}
Tarkempia tietoja harjoitusryhmistä löytyy <a href="{{course.url}}">täältä</a>.
{% endif %}
</p>
  
<table class="table">
  <tr>
    <th>Nimi</th>
    <th>Kello</th>
    <th>Sijainti</th>
    <th>Henkilökunta</th>
  </tr>
  {% for session in sessions %}
  <tr {% if session.weekday == today %}class="success" {% endif %}>
    <td>{{ session.name }}</td>
    <td>{{ session.weekdayString }} {{ session.timespan }}</td>
    <td>{{ session.location }}</td>
    <td>{{ session.assistants }}</td>
  </tr>
  {% endfor %}
</table>

 
{% endblock %}
