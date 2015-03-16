{% import "../mixins/tabs.swig" as Tabs %}
{% extends "../layouts/default.swig" %}

{% block js %}
<script src="/neuvontajono/socket.io/socket.io.js"></script>
<script src="/neuvontajono/scripts/knockout-3.3.0.js"></script>
<script src="/neuvontajono/scripts/knockout.mapping.js"></script>

<script type="text/javascript">
   var queueData = {{ queueData|safe }}; 
</script>

<script src="/neuvontajono/scripts/queue.js"></script>
{% endblock %}

{% block content %}
<h2 data-bind="text: course.name"></h2>

{{ Tabs.renderTabs() }}

<p class="lead">Harjoitusryhmissä tehtävien tekemiseen voi pyytää neuvoja kurssin henkilökunnalta. 
Kun tarvitset apua, voit lisätä itsesi neuvontajonoon. Jonossa olevia neuvotaan järjestyksessä.</p>

<div style="display: none;" id="queue-length" class="alert alert-info" data-bind="visible: (user.position() >= 2)">
  Olet jonossa tällä hetkellä sijalla <span id="queue-length" data-bind="text: user.position"></span>.
</div>

<div style="display: none;" id="queue-length" class="alert alert-success" data-bind="visible: (user.position() == 1)">
  Olet jonossa seuraavana.
</div>

<div style="display: none;" id="queue-length" class="alert alert-info" data-bind="visible: (user.position() == 0 && locations().length == 0)">
  Neuvontajono ei ole tällä hetkellä auki.
</div>

<div style="display: none;" data-bind="visible: (user.position() > 0)">
  <p>Jos poistut harjoitusryhmästä tai et tarvitse enää apua, voit poistaa itsesi neuvontajonosta.</p>
  <form id="remove" action="#" method="post">
    <input type="hidden" name="action" value="remove">
    <input type="hidden" name="_csrf" value="{{ csrf_token_value }}">
    <button class="remove btn btn-primary">Poistu jonosta</button>
  </form>
</div>

<input type="hidden" name="courseId" value="{{ course._id.toString() }}">

<div style="display: none;" data-bind="visible: (user.position() == 0 && locations().length > 0)">
  <form class="queue form-horizontal" method="post" action="#">
    <input type="hidden" name="action" value="add">
    <input type="hidden" name="_csrf" value="{{ csrf_token_value }}">
    
    <div style="display: none;" class="alert alert-warning" data-bind="visible: sessions().length > 1">
      Kurssilla on tällä hetkellä harjoitusryhmä useammassa paikassa. Valitse oikea sijainti.
    </div>
    
    <div class="form-group" data-bind="visible: sessions().length > 1">
      <label for="location" class="col-sm-3 control-label">Harjoitusryhmä:</label>
      <div class="col-sm-6">
        <select id="session-selector" data-bind="options: sessions, optionsText: function(item){ return item.name() + ' (' + item.location() + ')'}, value: selectedSession"></select>
      </div>
    </div>
    
    <div class="form-group" data-bind="visible: sessions().length == 1">
      <label for="location" class="col-sm-3 control-label">Harjoitusryhmä:</label>
      <div class="col-sm-6" data-bind="with: selectedSession">
        <span id="session-selector" data-bind="text: (name() + ' (' + location() + ')')"></span>
      </div>
    </div>  
    
    <hr>
    
    <div class="form-group" data-bind="with: selectedSession">
      <label class="col-sm-3 control-label">Paikalla neuvomassa:</label>
      <div data-bind="visible: (assistants().length > 0)" class="col-sm-6">
        <p class="form-control-static" data-bind="text: assistants"></p>
      </div>
    </div>
     
    <div class="form-group" data-bind="with: selectedSession">
      <label class="col-sm-3 control-label">Jonon pituus tällä hetkellä:</label>
      <div class="col-sm-6">
          <p class="form-control-static" data-bind="text: queueLength"></p>
        </div>
      <input type="hidden" name="sessionId" data-bind="value: _id">
      <input type="hidden" name="location" data-bind="value: location">
    </div>
    
    <hr>
    
    <div class="form-group">
      <label for="row" class="col-sm-3 control-label">Istun rivillä:</label>
      <div class="col-sm-6">
        <select name="row" data-bind="value: user.previousRow">
          {% for i in [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] %}
          <option value="{{ i }}">{{ i }}</option>  
          {% endfor %}
        </select>
        <p class="help-block small">Rivit lasketaan edestä taaksepäin.</p>
      </div>
    </div>
    
    <hr>
    
    <div>
      <button class="add btn btn-primary">Jonota</button>
    </div>
    
  </form>
</div>

<div class="change-session" style="display: none;" data-bind="visible: (user.position() >  0 && locations().length > 0)">
  <p>Mikäli vaihdat riviä tai siirryt toisessa paikassa olevaan harjoitusryhmään, voit päivittää sijaintisi.</p>
  <form class="queue form-inline" method="post" action="#">
    <input type="hidden" name="action" value="add">
    <input type="hidden" name="_csrf" value="{{ csrf_token_value }}">

    <div data-bind="with: selectedSession">
      <input type="hidden" name="sessionId" data-bind="value: _id">
      <input type="hidden" name="location" data-bind="value: location">
    </div>

    <div class="form-group">
      <label for="session2">Ryhmä:</label>
      <select id="session2" data-bind="options: sessions, optionsText: function(item){ return item.name() + ' (' + item.location() + ')'}, value: selectedSession"></select>
    </div>

    <div class="form-group">
      <label for="row2">Rivi:</label>
      <select id="row2" name="row" data-bind="value: user.previousRow">
        {% for i in [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] %}
        <option value="{{ i }}">{{ i }}</option> {% endfor %}
      </select>
    </div>

    <div class="form-group">
      <button class="add btn btn-primary btn-xs">Siirry</button>
    </div>

  </form>
</div>

{% endblock %}
