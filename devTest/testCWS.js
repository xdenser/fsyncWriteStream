/**
 * Created by den on 12.03.14.
 */
var
    CWS= require('../lib/chunkWriteStream'),
    path = require('path'),
    fs = require('fs'),
    testFile = path.join(__dirname,'test.dat'),
     ws = CWS.createFsyncWriteStream(testFile),
    //ws = fs.createWriteStream(testFile),
    Buf = new Buffer(1024);

function prepare(){
    var s = '', i,off=0;
    for(i=0;i<100;i++){
        s = i+'';
        Buf.write(s,off);
        off+= s.length;
    }
    return off;
}



var i = 0,wbuf = Buf.slice(0,prepare()),ct = 0;
function wr(){
    if((ct++)%(1024)==0) console.log(i+' bytes written');
    if(!ws.write(wbuf)) ws.once('drain',next);
    else next();
    function next(){
     if( (i += wbuf.length) < 50*1024*1024 && ct%1024) setImmediate(wr);
     else
     if(i<50*1024*1024) process.nextTick(wr);
     else ws.end();
    }
}

wr();




