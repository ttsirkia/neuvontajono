{% import "../mixins/tabs.swig" as Tabs %}
{% extends "../layouts/default.swig" %}

{% block js %}
<script src="/neuvontajono/scripts/knockout-3.3.0.js"></script>
<script src="/neuvontajono/scripts/knockout.mapping.js"></script>
<script>
  $(function() {
    var formData = {{ formDataJSON|safe }};
    var koViewModel = ko.mapping.fromJS(formData);
    ko.applyBindings(koViewModel);
  });
</script>
{% endblock %}

{% block content %}
<h2>{{ course.name }}</h2>

{{ Tabs.renderTabs() }}

<form class="form-horizontal" method="post" action="#">

  <h3>Yleiset asetukset</h3>

  <input type="hidden" name="_csrf" value="{{ csrf_token_value }}">
  <div class="form-group">
    <label for="courseName" class="col-sm-2 control-label">Kurssin nimi:</label>
    <div class="col-sm-6">
      <input type="text" class="form-control" name="name" id="courseName" value="{{ formData.name }}">
    </div>
  </div>

  <div class="form-group">
    <label for="courseId" class="col-sm-2 control-label">Kurssin tunniste:</label>
    <div class="col-sm-6">
      <p id="courseId" class="form-control-static">{{ formData.courseId }}</p>
    </div>
  </div>

  <div class="form-group">
    <label for="courseURL" class="col-sm-2 control-label">URL:</label>
    <div class="col-sm-6">
      <input type="text" class="form-control" name="url" id="courseURL" value="{{ formData.url }}">
      <p class="help-block small">Kirjoita tähän osoite, jossa on lisätietoja harjoitusryhmistä. Kentän voi jättää tyhjäksi.</p>
    </div>
  </div>

  <div class="form-group">
    <label for="combined" class="col-sm-2 control-label">Yhdistä toiseen:</label>
    <div class="col-sm-6">
      <input type="text" class="form-control" name="combined" id="combined" value="{{ formData.combined }}">
      <p class="help-block small">
        Jos haluat yhdistää useamman kurssin harjoitusjonon, kirjoita tähän sen kurssin tunniste, johon tämä
        kurssi liitetään. Tällöin kaikki muut paitsi kurssin opettaja ohjataan annetulle kurssille, kun neuvontajono
        avataan, eikä tämän kurssin neuvontajono ole käytössä.
      </p>
    </div>
  </div>

  <div class="form-group">
    <label for="statisticsLevel" class="col-sm-2 control-label">Tilastojen näkyvyys:</label>
    <div class="col-sm-6">
      <select name="statisticsLevel" data-bind="value: statisticsLevel">
      <option value="0">Näytä kaikille</option>
      <option value="1">Näytä vain henkilökunnalle</option>
      <option value="2">Näytä vain opettajalle</option>
      </select>
    </div>
  </div>

  <div class="form-group">
    <label for="yellowLimit" class="col-sm-2 control-label">Tilastojen värirajat:</label>
    <div class="col-sm-6">
      <input type="text" class="statistics-level-input form-control" name="yellowLimit" id="yellowLimit" value="{{ formData.yellowLimit }}">
      <input type="text" class="statistics-level-input form-control" name="redLimit" id="redLimit" value="{{ formData.redLimit }}">
      <p class="help-block small">Kirjoita ensimmäiseen kenttään keltaisen ja toiseen punaisen raja.</p>
    </div>
  </div>

  <div class="form-group">
    <div class="col-sm-offset-2 col-sm-10">
      <button type="submit" name="action" value="saveSettings" class="btn btn-primary">Tallenna</button>
    </div>
  </div>

</form>

<hr>

<h3>Harjoitusryhmät</h3>
<form action="#" method="post">
  <input type="hidden" name="action" value="remove">
  <input type="hidden" name="_csrf" value="{{ csrf_token_value }}">
  <table class="table">
    <tr>
      <th>Nimi</th>
      <th>Ajanjakso</th>
      <th>Kello</th>
      <th>Sijainti</th>
      <th>Henkilökunta</th>
      <th>&nbsp;</th>
    </tr>
    {% for session in sessions %}
    {% if session.active %}
    <tr>
    {% else %}
    <tr class="inactive-session">
    {% endif %}
      <td>{{ session.name }}</td>
      <td>{{ session.datespan }}</td>
      <td>{{ session.timespan }}</td>
      <td>{{ session.location }}</td>
      <td>{{ session.assistants }}</td>
      <td><a href="/neuvontajono/sessions/{{session.id}}/edit" class="btn btn-xs btn-primary">Muokkaa</a> <button name="sessionId" value="{{session.id}}" class="btn btn-xs btn-danger">Poista</button></td>
    </tr>
    {% endfor %}
  </table>
</form>

<form action="#" method="post">
  <input type="hidden" name="_csrf" value="{{ csrf_token_value }}">
  <p>
    <a href="/neuvontajono/sessions/create" class="btn btn-success">Luo uusi</a>
  </p>
  <p>
    Kaikki harjoitusryhmät voi ottaa tilapäisesti pois käytöstä esimerkiksi tenttiviikon ajaksi
    alla olevalla painikkeella. Ryhmät voi ottaa käyttöön uudelleen milloin hyvänsä.
  </p>
  <p>
    <button name="action" value="disableAll" class="btn btn-primary">Poista kaikki käytöstä</button>
    <button name="action" value="enableAll" class="btn btn-primary">Ota kaikki käyttöön</button>
  </p>
</form>

{% endblock %}
