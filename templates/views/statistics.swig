{% import "../mixins/tabs.swig" as Tabs %}
{% extends "../layouts/default.swig" %}

{% block js %}
<script>
  var yellowLimit = {{ course.yellowLimit }};
  var redLimit = {{ course.redLimit }};
</script>
<script src="/neuvontajono/scripts/statistics.js"></script>
{% endblock %}

{% block content %}
<h2>{{ course.name }}</h2>

{{ Tabs.renderTabs() }}

<p>Alla on esitetty tilastotietoja, kuinka monta opiskelijaa on ollut kussakin ryhmässä eri viikkoina.
Tiedot kerätään automaattisesti neuvontajonon perusteella, joten tiedot eivät ole välttämättä aivan täsmällisiä,
mutta niiden perusteella voit katsoa, mitkä ryhmät ovat yleensä ruuhkaisia ja mitkä väljempiä.
</p>

<table class="statistics-table">

{% for row in stats %}
<tr>
  {% for column in row %}
  <td>{{ column }}</td>
  {% endfor %}
</tr>
{% endfor %}

</table>
 
{% endblock %}
