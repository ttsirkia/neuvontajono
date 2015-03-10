(function($) {

  $('table.statistics-table tr').slice(1).each(function() {
    $(this).find('td').slice(1).each(function() {

      var value = $(this).text();

      if (value.length > 0) {

        if (value[0] != '-' && value[0] != '<') {
          if (value > redLimit) {
            $(this).addClass('statistics-red');
          } else if (value > yellowLimit) {
            $(this).addClass('statistics-yellow');
          } else {
            $(this).addClass('statistics-green');
          }
        }

        if (value[0] != '<') {
          $(this).addClass('statistics-green');
        }

      }

    });
  });

})(jQuery);
