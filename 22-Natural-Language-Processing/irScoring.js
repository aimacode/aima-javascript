$(document).ready(function() {
    var documents = [];
    var query;
    var queryTermList = [];
    var termFrequencies = [];
    var documentLengths = [];
    var documentFrequencies = [];
    var Idfs = [];
    var Bm25 = [];
    var documentLengthAvg;
    var k = 2.0;
    var b = 0.75;
    
    $('#document-submit').click(function(e) {
            var str = $('#document').val();
            $('#display-text').empty();
            documents.push(str);
            $("#documents-list").empty();
            for (var x = 0; x < documents.length; x++){
                $("#documents-list").append("<li class=\"list-group-item\">"+documents[x]+"</li>");
            }
        // prevent the form from submitting and refreshing the page
        e.preventDefault();
    });

    $('#query-input').submit(function(e) {
            var str = $('#query').val();
            $('#display-text').empty();
            query = str;
            queryTermList = query.split(" ");
            $("#query-display").empty();
            $("#query-display").append("<li class=\"list-group-item\">"+query+"</li>");
        // prevent the form from submitting and refreshing the page
        e.preventDefault();
    });

    $("#document-reset").click(function(e) {
            documents = [];
            $("#documents-list").empty();
            for (var x = 0; x < documents.length; x++){
                $("#documents-list").append("<li class=\"list-group-item\">"+documents[x]+"</li>");
            }
        // prevent the form from submitting and refreshing the page
        e.preventDefault();
    });

    $("#ir-scoring-function").click(function(e) {
      documentLengthAvg = 0;
      termFrequencies = [];
      documentLengths = [];
      Bm25 = [];
      documentFrequencies = [];
      Idfs = [];

      for (var x = 0; x < documents.length; x++){
        tf = []
        var doc = documents[x].split(" ");
        documentLengths.push(doc.length);
        for (var y = 0; y < queryTermList.length; y++){
          var count = 0;
          for (var z = 0; z < doc.length; z++){
            if (queryTermList[y] == doc[z]) {
              count = count +1;
            }
          }
          tf.push(count);
        }
        termFrequencies.push(tf);
      }

      for (var i = 0; i < queryTermList.length; i++) {
          var count = 0;
          for (var j = 0; j < documents.length; j++) {
            var doc = documents[j].split(" ");
            for (var l = 0; l < doc.length; l++) {
              if(doc[l] == queryTermList[i]){
                count = count + 1;
                break;
              }
            }
          }
          documentFrequencies.push(count);
      }
      for (var i = 0; i < documentLengths.length; i++) {
        documentLengthAvg = documentLengthAvg + documentLengths[i];
      }
      documentLengthAvg = documentLengthAvg/documentLengths.length;

      for (var i = 0; i < documentFrequencies.length; i++) {
        Idfs.push(Math.log((documents.length-documentFrequencies[i]+0.5)/(documentFrequencies[i]+0.5)));
      }

      for (var i = 0; i < documents.length; i++) {
        var b = 0;
        for (var j = 0; j < queryTermList.length; j++) {
          b = b + Idfs[j]*((termFrequencies[i][j]*(k+1))/(termFrequencies[i][j] + k*(1 - b + b*(documentLengthAvg))))
        }
        Bm25.push(b);
      }

      $("#BM25").text("BM25 Scores & Length of Documents:");
      $("#idf").text("Inverse document frequencies:");
      $("#tf").text("Term frequencies:");
      $("#bm25-table-header").empty();
      $("#bm25-table-data").empty();
      $("#idf-table-header").empty();
      $("#idf-table-data").empty();
      $("#length-documents").empty();
      $("#bm25-table-header").append("<th scope=\"col\">#</th>");
      for (var i = 0; i < documents.length; i++) {
        $("#bm25-table-header").append("<th scope=\"col\"> Document"+(i+1)+"</th>");
      }
      $("#bm25-table-data").append("<th scope=\"row\">BM25</th>");
      $("#length-documents").append("<th scope=\"row\">Lengths</th>");
      for (var i = 0; i < Bm25.length; i++) {
        $("#bm25-table-data").append("<td>"+Bm25[i]+"</td>");
        $("#length-documents").append("<td>"+documentLengths[i]+"</td>");
      }
      $("#idf-table-header").append("<th scope=\"col\">#</th>");
      for (var i = 0; i < queryTermList.length; i++) {
        $("#idf-table-header").append("<th scope=\"col\"> "+queryTermList[i]+"</th>");
      }
      $("#idf-table-data").append("<th scope=\"row\">IDF</th>");
      for (var i = 0; i < Idfs.length; i++) {
        $("#idf-table-data").append("<td>"+Idfs[i]+"</td>");
      }
  });
});
