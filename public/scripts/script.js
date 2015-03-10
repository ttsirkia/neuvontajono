(function($) {

  // Activate the current tab
  var path = location.pathname.replace(/\/$/, "");
  $('ul.nav li a[href$="' + path + '"]').parent('li').addClass('active');

  if (/neuvontajono\/sessions\/.*?\/manage/.test(location.pathname)) {
    $('ul.nav li a[href$="selectSession"]').parent('li').addClass('active');
  }

})(jQuery);
