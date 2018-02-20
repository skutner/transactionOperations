function pairsEqual(pair1, pair2) {
    if (pair1.name === pair2.name && pair1.version === pair2.version) {
        return true;
    }
    return false;
}


function compareTransactions(transaction1, transaction2) {
    if (transaction1.pulse < transaction2.pulse) {
        return true;
    }
    if (transaction1.pulse > transaction2.pulse) {
        return false;
    }
    for (var i in transaction1.output) {
        for (var j in transaction2.input) {
            if (pairsEqual(transaction1.output[i], transaction2.input[j])) {
                return true;
            }
        }
    }
    for (var i in transaction1.input) {
        for (var j in transaction2.output) {
            if (pairsEqual(transaction1.input[i], transaction2.output[j])) {
                return false;
            }

        }
    }
    if (transaction1.digest < transaction2.digest) {
        return true;
    }
    return false;
}

exports.sortTransactions = function (transactions) {
    for (var i = 0; i < transactions.length - 1; i++) {
        for (var j = i + 1; j < transactions.length; j++) {
            if (compareTransactions(transactions[j], transactions[i])) {
                var tempTransaction = transactions[i];
                transactions[i] = transactions[j];
                transactions[j] = tempTransaction;
            }
        }
    }
}


