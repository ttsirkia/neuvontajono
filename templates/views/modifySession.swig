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

    $('#startTime').change(function() {

      if (!$('#queueOpenTime').val() || $('#queueOpenTime').val().trim() == '') {
        $('#queueOpenTime').val($(this).val());
      }

    });

  });  
</script>
{% endblock %}

{% block content %}

<h2>{{ course.name }}</h2>
{% if createNew %}
<h3>Luo uusi harjoitusryhmä</h3>
{% else %}
<h3>Muokkaa harjoitusryhmän tietoja</h3>
{% endif %}

<form class="form-horizontal" method="post" action="#">
  <input type="hidden" name="_csrf" value="{{ csrf_token_value }}">
  <div class="form-group">
    <label for="courseName" class="col-sm-2 control-label">Nimi:</label>
    <div class="col-sm-6">
      <input type="text" class="form-control" name="name" id="name" value="{{formData.name}}">
      <p class="help-block small">Nimi voi olla esimerkiksi &quot;ma klo 14-16&quot; tai &quot;H2&quot;.</p>
    </div>
  </div>
  <div class="form-group">
    <label for="location" class="col-sm-2 control-label">Sijainti:</label>
    <div class="col-sm-6">
      <input type="text" class="form-control" name="location" id="location" value="{{formData.location}}">
      <p class="help-block small">Jos harjoitusryhmä on useammassa sijainnissa samaan aikaan, erottele
      sijainnit pilkulla, mikäli kaikissa näissä sijainneissa on yhteinen jono.</p>
    </div>
  </div>
  <div class="form-group">
    <label for="assistants" class="col-sm-2 control-label">Henkilökunta:</label>
    <div class="col-sm-6">
      <input type="text" class="form-control" name="assistants" id="assistants" value="{{formData.assistants}}">
      <p class="help-block small">Erottele nimet pilkulla. Kentän voi jättää myös tyhjäksi.</p>
    </div>
  </div>
  
  <hr>
  
  <div class="form-group">
    <label for="weekday" class="col-sm-2 control-label">Viikonpäivä:</label>
    <div class="col-sm-6">
      <select name="weekday" data-bind="value: weekday">
      <option value="1">maanantai</option>
      <option value="2">tiistai</option>
      <option value="3">keskiviikko</option>
      <option value="4">torstai</option>
      <option value="5">perjantai</option>
      <option value="6">lauantai</option>
      <option value="0">sunnuntai</option>
      </select>
    </div>
  </div>
  
  <hr>
  
  <div class="form-group">
    <label for="startDate" class="col-sm-2 control-label">Alkamispäivä:</label>
    <div class="col-sm-3">
      <input type="text" class="form-control" name="startDate" id="startDate" value="{{formData.startDate}}">
      <p class="help-block small">Anna päivämäärä muodossa 1.3.2015.</p>
    </div>
  </div>
  <div class="form-group">
    <label for="endDate" class="col-sm-2 control-label">Päättymispäivä:</label>
    <div class="col-sm-3">
      <input type="text" class="form-control" name="endDate" id="endDate" value="{{formData.endDate}}">
    </div>
  </div>
  <div class="form-group">
    <div class="col-sm-offset-2 col-sm-10">
      <div class="checkbox">
        <label>
          <input type="checkbox" name="active" id="active" data-bind="checked: active"> Käytössä
        </label>
        <p class="help-block small">Tällä asetuksella harjoitusryhmän voi poistaa tilapäisesti käytöstä.</p>
      </div>
    </div>
  </div>
  <hr>
  
  <div class="form-group">
    <label for="startTime" class="col-sm-2 control-label">Alkamisaika:</label>
    <div class="col-sm-3">
      <input type="text" class="form-control" name="startTime" id="startTime" value="{{formData.startTime}}">
      <p class="help-block small">Anna kellonaika muodossa 14:15.</p>
    </div>
  </div>
  <div class="form-group">
    <label for="endTime" class="col-sm-2 control-label">Päättymisaika:</label>
    <div class="col-sm-3">
      <input type="text" class="form-control" name="endTime" id="endTime" value="{{formData.endTime}}">
    </div>
  </div>

  <hr>

  <div class="form-group">
    <label for="queueOpenTime" class="col-sm-2 control-label">Jono avautuu:</label>
    <div class="col-sm-3">
      <input type="text" class="form-control" name="queueOpenTime" id="queueOpenTime" value="{{formData.queueOpenTime}}">
    </div>
  </div>
  
  <div class="form-group">
    <div class="col-sm-offset-2 col-sm-10">
      <button type="submit" name="action" value="save" class="btn btn-primary">Tallenna</button>
      <a href="/neuvontajono/settings" class="btn btn-danger">Peruuta</a>
    </div>
  </div>
</form>

{% endblock %}
