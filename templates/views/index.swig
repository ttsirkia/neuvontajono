{% extends "../layouts/default.swig" %} {% block js %}
<script src="/neuvontajono/socket.io/socket.io.js"></script>
<script>

</script>


{% endblock %}

{% block content %}
<h1>Neuvontajono</h1>

<div class="jumbotron">
  <p>
    Neuvontajonon avulla jonottaminen harjoitusryhmissä on helpompaa ja tasapuolisempaa.
  </p>
  
  <p>
    Opiskelija lisää itsensä jonoon, kun tarvitsee apua. Opiskelija voi samalla jatkaa
    tehtävien tekemistä ilman, että kättä tarvitsee pitää ylhäällä. Neuvontajono
    näyttää opiskelijalle sijainnin jonossa reaaliajassa. Kukaan ei voi myöskään etuilla
    jonossa, mikä antaa tasapuolisen mahdollisuuden kaikille saada neuvontaa.
  </p>
  <p>      
    Henkilökunta näkee jonotustilanteen reaaliajassa ja osaa näin mennä aina seuraavaksi
    vuorossa olevan opiskelijan luokse. Neuvontajono kerää myös kurssin henkilökunnalle
    tilastotietoja eri harjoitusryhmien ruuhkaisuudesta.
  </p>
 
</div>

<p class="lead">Käytä neuvontajonoa kirjautumalla sisään kurssin antaman linkin kautta.</p>

{% endblock %}
