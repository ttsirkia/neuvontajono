{% import "../mixins/flash-messages.swig" as FlashMessages %}
{% import "../mixins/footer.swig" as Footer %}

<!doctype html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta content="{{ csrf_token_value }}" name="_csrf" />
<title>{{ title|default("Neuvontajono") }}</title>
<link href="/neuvontajono/bootstrap/css/bootstrap.min.css" rel="stylesheet">
<link href='//fonts.googleapis.com/css?family=Open+Sans:400,700' rel='stylesheet' type='text/css'>
<link href="/neuvontajono/styles/style.css" rel="stylesheet">

<!--[if lt IE 9]>
			<script src="https://oss.maxcdn.com/libs/html5shiv/3.7.0/html5shiv.js"></script>
			<script src="https://oss.maxcdn.com/libs/respond.js/1.4.2/respond.min.js"></script>
		<![endif]-->

{%- block css %}
{% endblock -%}
{%- block head %}
{% endblock %}
</head>
<body>

  <nav class="navbar navbar-default navbar-static-top">
    <div class="container">
      <div class="navbar-header">
        <a class="navbar-brand">Neuvontajono</a>
      </div>
      <p class="navbar-text navbar-right">{% if user %}{{ user.name.full }}{% endif %}</p>
    </div>
  </nav>

  <div class="container" id="content">
    <div id="alerts">
        {{ FlashMessages.renderMessages(messages) }}
     </div>
    {% block content %} 
    {% endblock %}
  </div>
    
  <footer>
    {{ Footer.footer() }}
  </footer>
    
  <script src="/neuvontajono/scripts/jquery-1.11.2.min.js"></script>
  <script type="text/javascript" src="/neuvontajono/scripts/script.js"></script>
  {% block js %}
  {% endblock %}
</body>
</html>
