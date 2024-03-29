import { Translations } from "./translations";

export const fi: Translations = {
  title: "Neuvontajono",

  "index-jumbotron-1": "Neuvontajonon avulla jonottaminen harjoitusryhmissä on helpompaa ja tasapuolisempaa.",
  "index-jumbotron-2":
    "Opiskelija lisää itsensä jonoon, kun tarvitsee apua. Opiskelija voi samalla jatkaa tehtävien tekemistä ilman, että kättä tarvitsee pitää ylhäällä. Neuvontajono näyttää opiskelijalle sijainnin jonossa reaaliajassa. Kukaan ei voi myöskään etuilla jonossa, mikä antaa tasapuolisen mahdollisuuden kaikille saada neuvontaa.",
  "index-jumbotron-3":
    "Henkilökunta näkee jonotustilanteen reaaliajassa ja osaa näin mennä aina seuraavaksi vuorossa olevan opiskelijan luokse. Neuvontajono kerää myös kurssin henkilökunnalle tilastotietoja eri harjoitusryhmien ruuhkaisuudesta.",
  "index-lead": "Käytä neuvontajonoa kirjautumalla sisään kurssin oppimisympäristön kautta.",

  "queue-current-position": "Olet jonossa tällä hetkellä sijalla {position, number}.",
  "queue-next-in-queue": "Olet jonossa seuraavana.",
  "queue-not-open": "Neuvontajono ei ole tällä hetkellä auki.",
  "queue-joined": "Olet nyt jonossa.",
  "queue-join-failed": "Jonoon lisääminen epäonnistui.",
  "queue-multiple-locations": "Kurssilla on tällä hetkellä harjoitusryhmä useammassa paikassa. Valitse oikea sijainti.",
  "queue-group": "Harjoitusryhmä:",
  "queue-assistants": "Paikalla neuvomassa:",
  "queue-current-length": "Jonon pituus tällä hetkellä:",
  "queue-multiple-languages":
    "Tässä harjoitusryhmässä on mahdollista saada neuvontaa useammalla kielellä. Valitse alta, mitä kieltä haluat käyttää.",
  "queue-language": "Kieli:",
  "queue-my-row": "Istun rivillä:",
  "queue-row-direction-help": "Rivit lasketaan edestä taaksepäin.",
  "queue-join": "Jonota",
  "queue-leave-confirm": "Haluatko varmasti poistua jonosta?",
  "queue-leave-confirmed": "Et ole enää jonossa.",
  "queue-leave-failed": "Jonosta poistuminen epäonnistui.",
  "queue-leave-reminder":
    "Jos poistut harjoitusryhmästä tai et tarvitse enää apua, voit poistaa itsesi neuvontajonosta.",
  "queue-leave": "Poistu jonosta",
  "queue-position-updated": "Sijaintisi on päivitetty.",
  "queue-position-failed": "Sijainnin muuttaminen epäonnistui.",
  "queue-position-change": "Voit tarvittaessa päivittää sijaintisi menettämättä sijaasi jonossa.",
  "queue-move": "Siirry",
  "queue-lead":
    "Harjoitusryhmissä tehtävien tekemiseen voi pyytää neuvoja kurssin henkilökunnalta. Kun tarvitset apua, voit lisätä itsesi neuvontajonoon. Jonossa olevia neuvotaan järjestyksessä.",
  "queue-local-participation": "Osallistun harjoitusryhmään paikan päällä",
  "queue-remote-participation": "Osallistun harjoitusryhmään etäyhteyden avulla",
  "queue-wrong-call-url": "Videoyhteyden osoitteen tulee alkaa http:// tai https://",
  "queue-call-url": "Videoyhteyden osoite:",
  "queue-call-url-help":
    "Jos käytössä on videoneuvotteluohjelma (esim. Zoom), voit liittää tähän linkin puheluun liittymiseksi. Jos kenttä on tyhjä, kurssihenkilökunta näkee sähköpostiosoitteesi.",
  "queue-remote": "Etänä",
  "queue-sign-up-required":
    "Ennen kuin voit jonottaa, tulee sinun ilmoittautua tähän harjoitusryhmään painamalla alla olevaa painiketta.",
  "queue-sign-up": "Ilmoittaudu",

  "manage-open-projector": "Avaa videoprojektorinäkymä",
  "manage-projector-help":
    "Projektorinäkymässä seuraavaksi vuorossa oleva poistetaan jonosta painamalla välilyöntiä tai napsauttamalla nimeä. Useimmissa selaimissa saa näkymän koko ruutuun painamalla F11-painiketta.",
  "manage-confirm-remove-middle": "Haluatko varmasti poistaa opiskelijan keskeltä jonoa?",
  "manage-remove-queue-failed": "Jonosta poistaminen epäonnistui.",
  "manage-remove": "Poista jonosta",
  "manage-user-row-template": "{location}, rivi {row}",
  "manage-clear-queue-confirm": "Haluatko varmasti tyhjentää jonon kokonaan?",
  "manage-clear-queue": "Tyhjennä jono",
  "manage-th-position": "Sija",
  "manage-th-name": "Nimi",
  "manage-th-entered-at": "Jonoon",
  "manage-th-removed-at": "Poistettu",
  "manage-th-location": "Sijainti",
  "manage-current-length": "Jonon pituus tällä hetkellä: {length, number}",
  "manage-recently-removed-title": "Hiljattain poistetut",

  "manage-projector-conf-fail": "Näkymän asetusten lataaminen epäonnistui! Yritä ladata sivu uudelleen.",
  "manage-projector-queue-closed": "Jono on suljettu",
  "manage-projector-in-queue": "Jonossa: ",
  "manage-projector-next-in-queue": "Seuraavana vuorossa: ",
  "manage-projector-row": "rivi",

  "modify-create-title": "Luo uusi harjoitusryhmä",
  "modify-edit-title": "Muokkaa harjoitusryhmää",
  "modify-name": "Nimi:",
  "modify-name-help": 'Nimi voi olla esimerkiksi "ma klo 14-16" tai "H2".',
  "modify-location": "Sijainti:",
  "modify-location-help":
    "Jos harjoitusryhmä on useammassa sijainnissa samaan aikaan, erottele sijainnit pilkulla, mikäli kaikissa näissä sijainneissa on yhteinen jono.",
  "modify-staff": "Henkilökunta:",
  "modify-staff-help": "Erottele nimet pilkulla. Kentän voi jättää myös tyhjäksi.",
  "modify-language": "Kieli",
  "modify-language-help":
    "Erottele kielet pilkulla. Kentän voi jättää myös tyhjäksi, mutta jos kieliä on vähintään kaksi, on käyttäjän valittava, millä kielellä hän haluaa neuvontaa.",
  "modify-weekday": "Viikonpäivä:",
  "modify-start-date": "Alkamispäivä:",
  "modify-date-help": "Anna päivämäärä muodossa 1.3.2021.",
  "modify-end-date": "Päättymispäivä:",
  "modify-in-use": "Käytössä",
  "modify-in-use-help": "Tällä asetuksella harjoitusryhmän voi poistaa tilapäisesti käytöstä.",
  "modify-start-time": "Alkamisaika:",
  "modify-time-help": "Anna kellonaika muodossa 14:15.",
  "modify-end-time": "Päättymisaika:",
  "modify-queue-open-time": "Jono avautuu:",
  "modify-remote-method": "Etäosallistumisen tapa:",
  "modify-remote-method-help": "Kirjoita tähän, miten harjoitusryhmään osallistutaan etäyhteydellä (esim. Zoom).",
  "modify-queue-open-help":
    "Jonon voi avata jo ennen harjoitusryhmän alkamista. Jonon tulee avautua viimeistään harjoitusryhmän alkaessa.",

  "select-no-groups-today": "Ei harjoitusryhmiä tänään.",
  "select-main-text": "Valitse harjoitusryhmä. Alla olevassa taulukossa on kaikki tänään pidettävät harjoitusryhmät.",
  "select-th-name": "Nimi",
  "select-th-time": "Kello",
  "select-th-staff": "Henkilökunta",
  "select-th-location": "Sijainti",
  "select-th-language": "Kieli",

  "sessions-additional-info": "Tarkempia tietoja harjoitusryhmistä löytyy <a>täältä</a>.",
  "sessions-modify-link": "Harjoitusryhmiä voi muokata <a>kurssin asetuksista</a>.",
  "sessions-main-text":
    "Alla olevassa taulukossa on kaikki kurssin tällä viikolla pidettävät harjoitusryhmät. Vihreällä merkityt harjoitusryhmät ovat tänään.",

  "settings-title": "Yleiset asetukset",
  "settings-sessions-title": "Harjoitusryhmät",
  "settings-course-name": "Kurssin nimi:",
  "settings-course-id": "Kurssin tunniste:",
  "settings-course-url": "Harjoitusryhmien URL:",
  "settings-course-url-help":
    "Kirjoita tähän osoite, jossa on lisätietoja harjoitusryhmistä. Kentän voi jättää tyhjäksi.",
  "settings-combine": "Yhdistä toiseen:",
  "settings-combine-help":
    "Jos haluat yhdistää useamman kurssin neuvontajonon, kirjoita tähän sen kurssin tunniste, johon tämä kurssi liitetään. Tällöin kaikki muut paitsi kurssin opettaja ohjataan annetulle kurssille, kun neuvontajono avataan, eikä tämän kurssin neuvontajono ole käytössä.",
  "settings-projector": "Projektori\u00adnäkymän URL:",
  "settings-projector-help":
    "Määrittele videoprojektorinäkymä halutessasi kirjoittamalla tähän <a>asetustiedoston</a> URL.",
  "settings-default-language": "Oletuskieli:",
  "settings-default-language-help":
    "Tätä kieltä käytetään käyttöliittymässä, mikäli LTI-kirjautuminen ei välitä tietoa käyttäjän kielestä.",
  "settings-statistics-visibility": "Osallistujatilastojen näkyvyys:",
  "settings-statistics-help":
    "Tilastointi tallentaa tiedon, kuka on käynyt missäkin harjoitusryhmässä. Tämän tilastoinnin voi asettaa pois päältä, jolloin kaikki mahdollisesti jo kerätyt osallistujatiedot poistuvat.",
  "settings-statistics-queue-visibility": "Jonotustilastojen näkyvyys:",
  "settings-statistics-queue-help": "Jonotustilastointi ei kerää yksilöityjä tietoja.",
  "settings-statistics-graph-visibility": "Jonotuskäyrän näkyvyys:",
  "settings-statistics-graph-help":
    "Jonotuskäyrä näkyy tästä asetuksesta riippumatta vain, mikäli käyttäjällä on oikeus nähdä vähintään toinen edellisistä tilastoista.",
  "settings-statistics--1": "Ei tilastointia",
  "settings-statistics-0": "Näytä kaikille",
  "settings-statistics-1": "Näytä vain kurssihenkilökunnalle",
  "settings-statistics-2": "Näytä vain opettajalle",
  "settings-delete-confirm": "Haluatko varmasti poistaa tämän harjoitusryhmän?",
  "settings-th-span": "Ajanjakso",
  "settings-actions-help":
    "Kaikki harjoitusryhmät voi ottaa tilapäisesti pois käytöstä esimerkiksi tenttiviikon ajaksi alla olevalla painikkeella. Ryhmät voi ottaa käyttöön uudelleen milloin hyvänsä.",
  "settings-participation-policy": "Harjoitusryhmien oletusarvoinen osallistumistapa:",
  "settings-participation-policy-0": "Kurssin oletus",
  "settings-participation-policy-1": "Vain paikan päällä",
  "settings-participation-policy-2": "Vain etäyhteydellä",
  "settings-participation-policy-3": "Paikan päällä tai etäyhteydellä",
  "settings-participation-policy-help":
    "Asetuksen voi määritellä jokaiselle harjoitusryhmälle erikseen. Oletusasetus koskee vain niitä harjoitusryhmiä, joihin on valittu kurssin oletusosallistumistapa.",
  "settings-session-participation-policy": "Osallistumistapa:",
  "settings-require-sign-up": "Edellytä ilmoittautuminen paikan päällä",
  "settings-require-sign-up-help":
    "Jos asetus on päällä, opiskelija ei voi jonottaa ilmoittautumatta ensin ryhmään. Toiminnolla ei ole vaikutusta etäryhmissä tai jos osallistujatilastot on kytketty alla pois käytöstä.",
  "settings-remote-help": "Etäosallistumisen ohjeteksti:",
  "settings-remote-help-help":
    "Voit kirjoittaa tähän ohjeen, miten etäosallistuminen tapahtuu. Jos ohjeteksti on kirjoitettu, se korvaa oletusarvoisen ohjetekstin ja näytetään mahdollisen kurssikohtaisen ohjetekstin perässä.",
  "settings-remote-course-help":
    "Voit kirjoittaa tähän ohjeen, miten etäosallistuminen tapahtuu. Jos ohjeteksti on kirjoitettu, se korvaa oletusarvoisen ohjetekstin.",
  "settings-excluded-dates": "Perutut päivät:",
  "settings-excluded-dates-help":
    "Mikäli harjoitusryhmää ei järjestetä viikoittain, voit valita tästä ne päivät, jolloin harjotusryhmää ei pidetä.",

  "statistics-most-active-title": "Aktiivisimmat opiskelijat",
  "statistics-most-active-info": "Tämä tilasto näkyy aina vain kurssin opettajille.",
  "statistics-most-active-main":
    "Taulukossa näkyy, kuinka monta kertaa kukin opiskelija on käynyt kurssin aikana eri harjoitusryhmissä.",
  "statistics-th-active-position": "Sija",
  "statistics-th-active-name": "Nimi",
  "statistics-th-active-visits": "Käyntejä",
  "statistics-participant-count": "Opiskelijamäärät",
  "statistics-participant-count-lead":
    "Alla on esitetty tilastotietoja, kuinka monta opiskelijaa on ollut kussakin ryhmässä eri viikkoina. Tiedot kerätään automaattisesti neuvontajonon perusteella, joten tiedot eivät ole välttämättä aivan täsmällisiä, mutta niiden perusteella voit katsoa, mitkä ryhmät ovat yleensä ruuhkaisia ja mitkä väljempiä.",
  "statistics-queue-graph-lead":
    "Näet jonon pituuden eri ajanhetkinä viemällä hiiren haluamasi harjoitusryhmän päälle.",
  "statistics-queue-count": "Jonotuskerrat",
  "statistics-queue-count-lead":
    "Alla on esitetty, kuinka monta kertaa kaikki opiskelijat ovat yhteensä pyytäneet neuvoja.",
  "statistics-median-queue-duration": "Mediaaniodotusajat",
  "statistics-median-queue-duration-lead":
    "Alla on esitetty, kuinka monta minuuttia jonottaminen on keskimäärin kestänyt.",
  "statistics-maximum-queue-duration": "Maksimiodotusajat",
  "statistics-maximum-queue-duration-lead":
    "Alla on esitetty, kuinka monta minuuttia jonottaminen on enintään kestänyt.",
  "statistics-queue-graph": "Jonottajien määrä",
  "statistics-session-participants-title": "Harjoitusryhmän osallistujat",
  "statistics-session-participants-main":
    "Voit etsiä yksittäiseen harjoitusryhmään osallistuneet valitsemalla harjoitusryhmän ja syöttämällä päivämäärän.",
  "statistics-session-date": "Päivämäärä:",
  "statistics-no-search-results": "Haulla ei löytynyt yhtään osallistujaa.",

  save: "Tallenna",
  cancel: "Peruuta",
  select: "Valitse",
  edit: "Muokkaa",
  delete: "Poista",
  create: "Luo uusi",
  "enable-all": "Ota kaikki käyttöön",
  "disable-all": "Poista kaikki käytöstä",
  search: "Etsi",
  email: "Sähköposti",

  "weekdays-order": "1,2,3,4,5,6,0",
  "weekdays-short": "su,ma,ti,ke,to,pe,la",
  "weekdays-long": "sunnuntai,maanantai,tiistai,keskiviikko,torstai,perjantai,lauantai",
  "time-output-format": "H:mm",
  "date-output-format": "d.M.yyyy",
  "time-input-format": "H:mm",
  "date-input-format": "d.M.yyyy",

  "ordinal-value": "{position, number}.",

  "alert-not-logged": "Et ole kirjautunut sisään.",
  "alert-no-course": "Et ole kirjautunut kurssille.",
  "alert-no-staff": "Et ole henkilökuntaa.",
  "alert-no-teacher": "Et ole opettaja.",
  "alert-page-update-failed": "Päivittäminen epäonnistui. Yritä päivittää sivu.",
  "alert-session-not-found": "Harjoitusryhmää ei löydy.",
  "alert-clearing-queue-failed": "Jonon tyhjentäminen epäonnistui.",
  "alert-session-saved": "Harjoitusryhmän tiedot on tallennettu.",
  "alert-session-save-failed": "Harjoitusryhmän tallentaminen ei onnistunut.",
  "alert-settings-saved": "Kurssin asetukset on tallennettu.",
  "alert-settings-save-failed": "Kurssin asetusten tallentaminen ei onnistunut.",
  "alert-session-deleted": "Harjoitusryhmä on poistettu.",
  "alert-session-delete-failed": "Harjoitusryhmän poistaminen epäonnistui.",
  "alert-sessions-disabled": "Harjoitusryhmät on poistettu käytöstä.",
  "alert-sessions-disable-failed": "Harjoitusryhmien poistaminen käytöstä ei onnistunut.",
  "alert-sessions-enabled": "Harjoitusryhmät on otettu käyttöön.",
  "alert-sessions-enable-failed": "Harjoitusryhmien ottaminen käyttöön ei onnistunut.",
  "alert-statistics-load-failed": "Tilastojen lataaminen epäonnistui.",
  "alert-statistics-no-permission": "Sinulla ei ole oikeutta nähdä tilastoja.",
  "alert-loading-data-failed": "Tietojen lataaminen epäonnistui.",

  "notification-joined-queue-local": "{name} ({location}, rivi {row}) on jonossa.",
  "notification-joined-queue-remote": "{name} on jonossa.",
  "notification-no-permission": "Työpöytäilmoitukset eivät ole käytössä.",
  "notification-request-permission": "Anna lupa ilmoituksille, jos haluat ottaa ne käyttöön.",
  "notification-enabled":
    "Työpöytäilmoitukset ovat käytössä. Saat ilmoituksen, kun joku pyytää apua jonon ollessa tyhjä.",
  "notification-disabled": "Työpöytäilmoitukset ovat tilapäisesti pois käytöstä.",
  "notification-activate": "Napsauta tästä aktivoidaksesi ne uudelleen",
  "notification-disable": "Napsauta tästä poistaaksesi ilmoitukset käytöstä",

  "tabs-queue": "Jonotus",
  "tabs-sessions": "Harjoitusryhmät",
  "tabs-statistics": "Tilastot",
  "tabs-selectSession": "Jonon hallinta",
  "tabs-settings": "Kurssin asetukset",
};
