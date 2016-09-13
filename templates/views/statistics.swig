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

{% if teacher %}

<hr>

<h3>Aktiivisimmat opiskelijat</h3>

<div class="alert alert-info">
  Tämä tilasto näkyy aina vain kurssin opettajille.
</div>

<p>
  Taulukossa näkyy, kuinka monta kertaa kukin opiskelija on käynyt
  kurssin aikana eri harjoitusryhmissä.
</p>

<table class="table table-condensed">
  <thead>
    <tr>
      <th>Sija</th>
      <th>Opiskelija</th>
      <th>Käyntejä</th>
    </tr>
  </thead>
  <tbody>
    {% for participant in mostFrequent %}
    <tr>
      <td>{{ participant[0] }}.</td>
      <td>{{ participant[1] }}</td>
      <td>{{ participant[2] }}</td>
    </tr>
    {% endfor %}
  </tbody>
</table>

{% endif %}

{% endblock %}
