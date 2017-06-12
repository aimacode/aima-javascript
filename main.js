/* Load the scripts, html, and css needed for the chapter pages.

   The project uses Bootstrap 3, which requires JQuery 1. We load
   Bootstrap JS, a common header menu, and a common footer.
   The individual pages don't need to load these.
*/

(function() {
    var head = document.getElementsByTagName('head')[0];

    var bootstrapScript = document.createElement('script');
    bootstrapScript.setAttribute('src', 'https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js');
    head.append(bootstrapScript);

    $(function() {
        var body = document.getElementsByTagName('body')[0];

        var header = document.createElement('header');
        body.insertBefore(header, body.firstChild);
        var footer = document.createElement('footer');
        footer.setAttribute('class', 'container-fluid text-center');
        footer.innerHTML = '<img src="http://aima.cs.berkeley.edu/aima_logo.png">';
        body.append(footer);

        if (document.location.protocol === 'file:') {
            // file: urls don't allow ajax calls needed to load the header, so load from main site instead
            $('header').load("http://aimacode.github.io/aima-javascript/header.html");
        } else {
            $('header').load("../header.html");
        }
    });
})();
