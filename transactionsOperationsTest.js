const sort=require('./transactionsOperations').sortTransactions;
const fs=require('fs');
const readline=require('readline');
const path=require('path');
const assert=require('assert');
var events=require('events');
function TransactionSortTester(testDirectory){
    var self=this;
    self.testDirectory=testDirectory;
    var rl;
    var EventEmitter=new events.EventEmitter();
    var transactions=[];
    var isFirst=true;
    var isInput = false;
    var isOutput=false;
    var isPulse=false;
    var isDigest=false;
    var isExpected=false;
    var transaction={};
    var expected;
    var input={};
    var output={};
    function getFiles(testDirectory){
        var memberFiles=fs.readdirSync(testDirectory);
        for(var i=0; i<memberFiles.length; i++){
            memberFiles[i]=path.resolve(self.testDirectory+'\\'+memberFiles[i]);
        }
        return memberFiles;
    }
    var files=getFiles(self.testDirectory);
    function readFromFile(testFile){
        rl=readline.createInterface({
            input: fs.createReadStream(testFile,'utf-8'),
            output: process.stdout
        });
        rl.on('line',processLine);
        rl.on('close',getTransactions);
    }
    function processLine(line) {
        if(line === ''){
            return;
        }
        if(line === 'input'){
            if(!isFirst){
                transactions.push(transaction);
            }
            transaction={};
            input={};
            output={};
            isInput=true;
            isFirst=false;
            return;
        }
        if(line === 'output'){
            isInput=false;
            isOutput=true;
            return;
        }
        if(line === 'pulse'){
            isOutput=false;
            isPulse=true;
            return;
        }
        if(line === 'digest'){
            isPulse=false;
            isDigest=true;
            return;
        }
        if(line === 'expected'){
            isFirst=true;
            isInput = false;
            isOutput=false;
            isPulse=false;
            isDigest=false;
            isExpected=true;
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
            return;
        }
        if(isPulse){
            transaction.pulse=line;
            return;
        }
        if(isDigest){
            transaction.digest=line;
            return;
        }
        if(isExpected){
            expected=line.split(' ');
            isExpected=false;
            return;
        }
    }
    function getTransactions(){
        transactions.push(transaction);
        testResults();
    }
    function testResults(){
        sort(transactions);
        var result=[];
        for(var i=0; i<transactions.length; i++){
            result.push(transactions[i].digest);
        }
        transactions=[];
        if(assert.deepEqual(result,expected) == undefined){
            console.log('Test passed');
        }
        EventEmitter.emit('done');
    }
    EventEmitter.on('done',function(){
        if(files.length){
            var file=files.shift();
            readFromFile(file);
        }

    });
    readFromFile(files.shift());
}

var tester=new TransactionSortTester('./testDirectory');