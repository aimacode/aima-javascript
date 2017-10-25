var Bayes = (function (Bayes) {
    Array.prototype.unique = function () {
        var u = {}, a = []
        for (var i = 0, l = this.length; i < l; ++i) {
            if (u.hasOwnProperty(this[i])) {
                continue;
            }
            a.push(this[i]);
            u[this[i]] = 1;
        }
        return a;
    }
    var stemKey = function (stem, label) {
        return '_Bayes::stem:' + stem + '::label:' + label;
    };
    var docCountKey = function (label) {
        return '_Bayes::docCount:' + label;
    };
    var stemCountKey = function (stem) {
        return '_Bayes::stemCount:' + stem;
    };

    var log = function (text) {
        console.log(text);
    };

    var tokenize = function (text) {
        text = text.toLowerCase().replace(/\W/g, ' ').replace(/\s+/g, ' ').trim().split(' ').unique();
        return text;
    };

    var getLabels = function () {
        var labels = localStorage.getItem('_Bayes::registeredLabels');
        if (!labels) labels = '';
        return labels.split(',').filter(function (a) {
            return a.length;
        });
    };

    var registerLabel = function (label) {
        var labels = getLabels();
        if (labels.indexOf(label) === -1) {
            labels.push(label);
            localStorage.setItem('_Bayes::registeredLabels', labels.join(','));
        }
        return true;
    };

    var stemLabelCount = function (stem, label) {
        var count = parseInt(localStorage.getItem(stemKey(stem, label)));
        if (!count) count = 0;
        return count;
    };
    var stemInverseLabelCount = function (stem, label) {
        var labels = getLabels();
        var total = 0;
        for (var i = 0, length = labels.length; i < length; i++) {
            if (labels[i] === label)
                continue;
            total += parseInt(stemLabelCount(stem, labels[i]));
        }
        return total;
    };

    var stemTotalCount = function (stem) {
        var count = parseInt(localStorage.getItem(stemCountKey(stem)));
        if (!count) count = 0;
        return count;
    };
    var docCount = function (label) {
        var count = parseInt(localStorage.getItem(docCountKey(label)));
        if (!count) count = 0;
        return count;
    };
    var docInverseCount = function (label) {
        var labels = getLabels();
        var total = 0;
        for (var i = 0, length = labels.length; i < length; i++) {
            if (labels[i] === label)
                continue;
            total += parseInt(docCount(labels[i]));
        }
        return total;
    };
    var increment = function (key) {
        var count = parseInt(localStorage.getItem(key));
        if (!count) count = 0;
        localStorage.setItem(key, parseInt(count) + 1);
        return count + 1;
    };

    var incrementStem = function (stem, label) {
        increment(stemCountKey(stem));
        increment(stemKey(stem, label));
    };

    var incrementDocCount = function (label) {
        return increment(docCountKey(label));
    };

    Bayes.train = function (text, label) {
        registerLabel(label);
        var words = tokenize(text);
        var length = words.length;
        for (var i = 0; i < length; i++)
            incrementStem(words[i], label);
        incrementDocCount(label);
    };

    Bayes.guess = function (text) {
        var words = tokenize(text);
        var length = words.length;
        var labels = getLabels();
        var totalDocCount = 0;
        var docCounts = {};
        var docInverseCounts = {};
        var scores = {};
        var labelProbability = {};

        for (var j = 0; j < labels.length; j++) {
            var label = labels[j];
            docCounts[label] = docCount(label);
            docInverseCounts[label] = docInverseCount(label);
            totalDocCount += parseInt(docCounts[label]);
        }

        for (var j = 0; j < labels.length; j++) {
            var label = labels[j];
            var logSum = 0;
            labelProbability[label] = docCounts[label] / totalDocCount;

            for (var i = 0; i < length; i++) {
                var word = words[i];
                var _stemTotalCount = stemTotalCount(word);
                if (_stemTotalCount === 0) {
                    continue;
                } else {
                    var wordProbability = stemLabelCount(word, label) / docCounts[label];
                    var wordInverseProbability = stemInverseLabelCount(word, label) / docInverseCounts[label];
                    var wordicity = wordProbability / (wordProbability + wordInverseProbability);

                    wordicity = ( (1 * 0.5) + (_stemTotalCount * wordicity) ) / ( 1 + _stemTotalCount );
                    if (wordicity === 0)
                        wordicity = 0.01;
                    else if (wordicity === 1)
                        wordicity = 0.99;
               }

                logSum += (Math.log(1 - wordicity) - Math.log(wordicity));
                log(label + "icity of " + word + ": " + wordicity);
            }
            scores[label] = 1 / ( 1 + Math.exp(logSum) );
        }
        return scores;
    };

    Bayes.extractWinner = function (scores) {
        var bestScore = 0;
        var bestLabel = null;
        for (var label in scores) {
            if (scores[label] > bestScore) {
                bestScore = scores[label];
                bestLabel = label;
            }
        }
        return {label: bestLabel, score: bestScore};
    };

    return Bayes;
})(Bayes || {});

localStorage.clear();

var go = function go() {
    var text = document.getElementById("test_phrase").value;
    var scores = Bayes.guess(text);
    var winner = Bayes.extractWinner(scores);
    document.getElementById("test_result").innerHTML = winner.label;
};

// French Training
Bayes.train("L'Italie a été gouvernée pendant un an par un homme qui n'avait pas été élu par le peuple. Dès la nomination de Mario Monti au poste de président du conseil, fin 2011, j'avais dit :Attention, c'est prendre un risque politique majeur. Par leur vote, les Italiens n'ont pas seulement adressé un message à leurs élites nationales, ils ont voulu dire : Nous, le peuple, nous voulons garder la maîtrise de notre destin. Et ce message pourrait être envoyé par n'importe quel peuple européen, y compris le peuple français.", 'french');
Bayes.train("Il en faut peu, parfois, pour passer du statut d'icône de la cause des femmes à celui de renégate. Lorsqu'elle a été nommée à la tête de Yahoo!, le 26 juillet 2012, Marissa Mayer était vue comme un modèle. Elle montrait qu'il était possible de perforer le fameux plafond de verre, même dans les bastions les mieux gardés du machisme (M du 28 juillet 2012). A 37 ans, cette brillante diplômée de Stanford, formée chez Google, faisait figure d'exemple dans la Silicon Valley californienne, où moins de 5 % des postes de direction sont occupés par des femmes. En quelques mois, le symbole a beaucoup perdu de sa puissance.", 'french');
Bayes.train("Premier intervenant de taille à SXSW 2013, Bre Pettis, PDG de la société Makerbot, spécialisée dans la vente d'imprimantes 3D, a posé une question toute simple, avant de dévoiler un nouveau produit qui l'est un peu moins. Voulez-vous rejoindre notre environnement 3D ?, a-t-il demandé à la foule qui débordait de l'Exhibit Hall 5 du Convention Center.", 'french');
Bayes.train("Des milliers de manifestants ont défilé samedi 9 mars à Tokyo pour exiger l'abandon rapide de l'énergie nucléaire au Japon, près de deux ans jour pour jour après le début de la catastrophe de Fukushima.", 'french');
Bayes.train("Oui, ça en a tout l'air, même si le conflit en Syrie n'était pas confessionnel au départ et ne l'est pas encore vraiment. Il faut saluer là l'extraordinaire résistance de la société civile syrienne à la tentation confessionnelle, mais cela ne durera pas éternellement.", 'french');

// English Training
Bayes.train("One morning in late September 2011, a group of American drones took off from an airstrip the C.I.A. had built in the remote southern expanse of Saudi Arabia. The drones crossed the border into Yemen, and were soon hovering over a group of trucks clustered in a desert patch of Jawf Province, a region of the impoverished country once renowned for breeding Arabian horses.", 'english');
Bayes.train("Just months ago, demonstrators here and around Egypt were chanting for the end of military rule. But on Saturday, as a court ruling about a soccer riot set off angry mobs, many in the crowd here declared they now believed that a military coup might be the best hope to restore order. Although such calls are hardly universal and there is no threat of an imminent coup, the growing murmurs that military intervention may be the only solution to the collapse of public security can be heard across the country, especially in circles opposed to the Islamists who have dominated post-Mubarak elections. ", 'english');
Bayes.train(" Syrian rebels released 21 detained United Nations peacekeepers to Jordanian forces on Saturday, ending a standoff that raised new tensions in the region and new questions about the fighters just as the United States and other Western nations were grappling over whether to arm them. The rebels announced the release of the Filipino peacekeepers, and Col. Arnulfo Burgos, a spokesman for the Armed Forces of the Philippines, confirmed it.", 'english');
Bayes.train(" The 83rd International Motor Show, which opened here last week, features the world premieres of 130 vehicles. These include an unprecedented number of models with seven-figure prices, including the $1.3 million LaFerrari supercar, the $1.15 million McLaren P1, the $1.6 million Koenigsegg Hundra and a trust-fund-busting Lamborghini, the $4 million Veneno. The neighborhood has become so rich that the new Rolls-Royce Wraith, expected to sell for more than $300,000, seemed, in comparison, like a car for the masses.", 'english');
Bayes.train("David Hallberg, the statuesque ballet star who is a principal dancer at both the storied Bolshoi Ballet of Moscow and American Ballet Theater in New York, is theoretically the type of front-row coup that warrants a fit of camera flashes. But when Mr. Hallberg, 30, showed up at New York Fashion Week last month, for a presentation by the Belgian designer Tim Coppens, he glided into the front row nearly unnoticed, save for a quick chat with Tumblr’s fashion evangelist, Valentine Uhovski, and a warm embrace from David Farber, the executive style editor at WSJ.", 'english');

// Empty train
Bayes.train("", '');
