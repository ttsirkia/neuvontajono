{% import "../mixins/tabs.swig" as Tabs %}
{% extends "../layouts/default.swig" %}

{% block js %}
<script src="/neuvontajono/socket.io/socket.io.js"></script>
<script src="/neuvontajono/scripts/knockout-3.3.0.js"></script>
<script src="/neuvontajono/scripts/knockout.mapping.js"></script>

<script type="text/javascript">
   var queueData = {{ queueData|safe }}; 
</script>

<script src="/neuvontajono/scripts/manageQueue.js"></script>

{% endblock %}

{% block content %}
<h2>{{ course.name }}</h2>

{{ Tabs.renderTabs() }}

<h3>Jonotustilanne ({{ session.location }})</h3>

<input type="hidden" name="courseId" value="{{ course._id.toString() }}">
<input type="hidden" name="sessionId" value="{{ session._id.toString() }}">

<p id="queue-length">Jonon pituus tällä hetkellä: <span data-bind="text: (users().length)"></span></p>
<form id="remove" action="#" method="post">
  <input type="hidden" name="action" value="remove">
  <input type="hidden" name="_csrf" value="{{ csrf_token_value }}">
  <table id="queue" class="table">
    <thead>
      <tr>
        <th>Sija</th>
        <th>Nimi</th>
        <th>Jonoon</th>
        <th>Sijainti</th>
        <th>&nbsp;</th>
      </tr>
    </thead>
    <tbody data-bind="foreach: users">
      <tr>
        <td data-bind="text: ($index() + 1 + '.')"></td>
        <td data-bind="text: (user.name.first() + ' ' + user.name.last())"></td>
        <td data-bind="text: enteredAt"></td>
        <td data-bind="text: (location() + ', rivi ' + row())"></td>
        <td><button class="btn btn-primary btn-xs remove" name="queueId" data-bind="value: _id">Poista jonosta</button></td>
      </tr>
    </tbody>
  </table>
</form>

<p data-bind="visible: (users().length == 0)">Jono on tyhjä.</p>

<form style="display: none;" data-bind="visible: (users().length > 0)" action="#" method="post">
  <input type="hidden" name="_csrf" value="{{ csrf_token_value }}">
  <button type="submit" class="btn btn-danger" name="action" value="clear">Tyhjennä jono</button>
</form>

{% endblock %}
