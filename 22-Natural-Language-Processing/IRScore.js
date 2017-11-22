$(document).ready(function() {
    $("#d1").append(doc1Text);
    $("#d2").append(doc2Text);
    $("#d3").append(doc3Text);
    $('#form-IR').submit(function() {
            var query = $('#query').val();
            var queryList = query.split(' ');
            var doc1List = doc1Text.split(' ');
            var doc2List = doc2Text.split(' ');
            var doc3List = doc3Text.split(' ');
            var doclengths = [];
            var doc1Length = doc1List.length;
            doclengths.push(doc1Length);
            var doc2Length = doc2List.length;
            doclengths.push(doc2Length);
            var doc3Length = doc3List.length;
            doclengths.push(doc3Length);
            var avgLength = (doc1List.length+doc2List.length+doc3List.length)/3;
            var tfdoc1 = [];
            var tfdoc2 = [];
            var tfdoc3 = [];
            var df = [];
            var idf = [];
            var bm25doc1 = 0;
            var bm25doc2 = 0;
            var bm25doc3 = 0;
            var doc1rank = 0;
            var doc2rank = 0;
            var doc3rank = 0;
            for(var i=0; i<queryList.length; i++){
              var word = queryList[i];
              var frequency = 0;
              for (var j = 0; j < doc1List.length; j++) {
                if(doc1List[j]==word){
                  frequency++;
                }
              }
              tfdoc1.push(frequency);
              frequency = 0;
              for (var j = 0; j < doc2List.length; j++) {
                if(doc2List[j]==word){
                  frequency++;
                }
              }
              tfdoc2.push(frequency);
              frequency = 0;
              for (var j = 0; j < doc3List.length; j++) {
                if(doc3List[j]==word){
                  frequency++;
                }
              }
              tfdoc3.push(frequency);
              frequency = 0;
            }
            for (var i = 0; i < queryList.length; i++) {
              var count = 0;
              if(tfdoc1[i]!=0){
                count++;
              }
              if(tfdoc2[i]!=0){
                count++;
              }
              if(tfdoc3[i]!=0){
                count++;
              }
              df.push(count);
            }
            for(var i = 0; i < queryList.length; i++){
              var temp;
              temp = Math.log((3-df[i]+0.5)/(df[i]+0.5));
              idf.push(temp);
            }
            for(var i = 0; i < queryList.length; i++){
                bm25doc1 = bm25doc1 + idf[i]*(tfdoc1[i]*(k+1))/(tfdoc1[i]+(k*(1-b+(b*(doc1Length/avgLength)))));
            }
            for(var i = 0; i < queryList.length; i++){
                bm25doc2 = bm25doc2 + idf[i]*(tfdoc2[i]*(k+1))/(tfdoc2[i]+(k*(1-b+(b*(doc2Length/avgLength)))));
            }
            for(var i = 0; i < queryList.length; i++){
                bm25doc3 = bm25doc3 + idf[i]*(tfdoc3[i]*(k+1))/(tfdoc3[i]+(k*(1-b+(b*(doc3Length/avgLength)))));
            }
            if(bm25doc1 > bm25doc2){
              if(bm25doc1 > bm25doc3){
                doc1rank = 1;
                if (bm25doc2 > bm25doc3) {
                  doc2rank = 2;
                  doc3rank = 3;
                 }
                 else if(bm25doc2 > bm25doc3){
                   doc2rank = 3;
                   doc3rank = 2;
                 }
              }
              else if(bm25doc1 < bm25doc3){
                doc3rank = 1;
                doc1rank = 2;
                doc2rank = 3;
              }
            }
            else if (bm25doc1 < bm25doc2) {
              if(bm25doc1 > bm25doc3){
                doc3rank = 3;
                doc1rank = 2;
                doc2rank = 1;
              }
              else if(bm25doc1 < bm25doc3){
                doc1rank = 3;
                if (bm25doc2 > bm25doc3) {
                  doc2rank = 1;
                  doc3rank = 2;
                 }
                 else if(bm25doc2 > bm25doc3){
                   doc2rank = 2;
                   doc3rank = 1;
                 }
              }
            }
            var docranks = [];
            docranks.push(doc1rank);
            docranks.push(doc2rank);
            docranks.push(doc3rank);
            $('#tfTable').empty();
            $('#rankTable').empty();
            for(var i = 0; i< queryList.length; i++){
              $('#tfTable').append('<tr><th scope="row">'+queryList[i]+'</th><td>'+tfdoc1[i]+'</td><td>'+tfdoc2[i]+'</td><td>'+tfdoc3[i]+'</td><td>'+idf[i]+'</td></tr>');
            }
            for(var i = 0; i< docranks.length; i++){
              $('#rankTable').append('<tr><th scope="row">Doc'+(i+1)+'</th><td>'+doclengths[i]+'</td><td>'+docranks[i]+'</td></tr>');
            }
        return false;
    });
});
var k = 2.0;
var b = 0.75;
var doc1Text = "how"
var doc2Text = "how are you"
var doc3Text = "how are"
