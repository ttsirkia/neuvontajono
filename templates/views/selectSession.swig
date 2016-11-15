{% import "../mixins/tabs.swig" as Tabs %}
{% extends "../layouts/default.swig" %}

{% block js %}
{% endblock %}

{% block content %}
<h2>{{ course.name }}</h2>

{{ Tabs.renderTabs() }}

{% if sessions.length > 0 %}

  <p>Valitse harjoitusryhmä. Alla olevassa taulukossa on kaikki tänään pidettävät harjoitusryhmät.</p>

  <table class="table">
    <tr>
      <th>Nimi</th>
      <th>Kello</th>
      <th>Sijainti</th>
      <th>Henkilökunta</th>
      <th>&nbsp;</th>
    </tr>
    {% for session in sessions %}
    <tr class="{{ session.status }}">
      <td>{{ session.name }}</td>
      <td>{{ session.timespan }}</td>
      <td>{{ session.location }}</td>
      <td>{{ session.assistants }}</td>
      <td><a href="/neuvontajono/sessions/{{session.id}}/manage" class="btn btn-primary">Valitse</a></td>
    </tr>
    {% endfor %}
  </table>

{% else %}

    <p>Ei harjoitusryhmiä tänään.</p>

{% endif %}

{% endblock %}
