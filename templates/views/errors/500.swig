{% extends "../../layouts/default.swig" %}

{% block content %}
	<div class="container">
		<h1>{{ statusCode }}</h1>
    
        {% if statusCode == 403 %}
        <p class="lead">Pääsy kielletty</p>
        <p>Mikäli virhe vaikuttaa aiheettomalta, yritä päivittää sivu ja kokeile uudelleen.</p>
        {% else %}
        <p class="lead">Palvelimella tapahtui odottamaton virhetilanne.</p>
        {% endif %}		
    
        {% if error %}
        <pre class="alert alert-danger">{{ error }}</pre>
        {% if stacktrace %}
        <pre>{{ stacktrace }}</pre>
        {% endif %}
        {% endif %}
    
        <p>Palaa <a href="/neuvontajono">etusivulle</a>.</p>
        
	</div>
{% endblock %}
