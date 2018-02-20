const sort=require('./transactionsOperations').sortTransactions;
const fs=require('fs');
const readline=require('readline');

function readTransactions(path){
    const EventEmitter=require('events').EventEmitter;
    const rl=readline.createInterface({
        input: fs.createReadStream(path,'utf-8'),
        output: process.stdout
    });
    var transactions=[];
    var isFirst=true;
    var wasFirst=false;
    var isInput = false;
    var isOutput=false;
    var isPulse=false;
    var isDigest=false;
    var wasDigest=false;
    var transaction={};
    var input={};
    var output={};
    function processLine(line) {
        wasFirst=true;
        if(line === 'input'){
            if(!isFirst){
                wasFirst=false;
                if(wasDigest){
                    wasDigest=false;
                }
                else{
                    var artificialDigest='T'+transaction.input.key.name;
                    transaction[digest]=artificialDigest;
                }
                transactions.push(transaction);
            }
            transaction={};
            isInput=true;
            isFirst=false;
            return;
        }
        if(line === 'output'){
            isOutput=true;
            return;
        }
        if(line === 'pulse'){
            isPulse=true;
        }
        if(line === 'digest'){
            isDigest=true;
            wasDigest=true;
            return;
        }
        if(isInput){
            var nameVersionPair=line.split(' ');
            var keyName='key'+nameVersionPair[0];
            var key={};
            key.name=keyName;
            key.version=nameVersionPair[1];
            input[keyName]=key;
            transaction.input=input;
            isInput=false;
            return;
        }
        if(isOutput){
            var nameVersionPair=line.split(' ');
            var keyName='key'+nameVersionPair[0];
            var key={};
            key.name=keyName;
            key.version=nameVersionPair[1];
            output[keyName]=key;
            transaction.output=output;
            isOutput=false;
            return;
        }
        if(isPulse){
            transaction.pulse=line;
            isPulse=false;
            return;
        }
        if(isDigest){
            transaction.digest=line;
            isDigest=false;
            return;
        }
    }
    rl.on('line',processLine);
    rl.on('close',getTransactions);

    function getTransactions(){
        if(wasFirst){
            if(!wasDigest){
                for(var n in transaction.input) {
                    var artificialDigest = 'T' + n;
                    transaction.digest = artificialDigest;
                }
            }
        }
        transactions.push(transaction);
        for(var i=0; i<transactions.length; i++){
            process.stdout.write(transactions[i].digest+' ');
        }
        console.log();
    }

}
var path='./transactions.in';
readTransactions(path);