$(document).ready(function() {
    $('#form').submit(function() {
            var str = $('#phrase').val();
            var charUnigram;
            $('#character-level-unigram').empty();
            $('#character-level-trigram').empty();
            $('#character-level-bigram').empty();
            for (var x = 0; x < str.length; x++)
            {
                var a = str.charAt(x);
                var b = str.charAt(x+1);
                var c = str.charAt(x+2);
                //Unigram
                $('#character-level-unigram').append("<kbd>"+a+"</kbd>");
                $('#character-level-unigram').append(",  ");
                //Bigram
                $('#character-level-bigram').append("<kbd>"+a+b+"</kbd>");
                $('#character-level-bigram').append(",  ");
                //Trigram
                $('#character-level-trigram').append("<kbd>"+a+b+c+"</kbd>");
                $('#character-level-trigram').append(",  ");
            }
        return false;
    });
});
