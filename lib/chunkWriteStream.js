/**
 * Created by den on 12.03.14.
 */
var
     fs = require('fs'),
     stream = require('stream'),
     util = require('util');

util.inherits(ChunkWriteStream,fs.WriteStream);

function ChunkWriteStream(path,options){
    options = options||{};
    fs.WriteStream.call(this,path,options);
    this._flushSize = options.flushSize||4*1024*1024;
    this._flushed = 0;
    var self = this;
    this.on('open',function(fd){
        self._flushFD = fd;
    });
}
ChunkWriteStream.prototype.superWrite = ChunkWriteStream.super_.prototype._write;

ChunkWriteStream.prototype._write = function(){
    var args;
    if(this._flushFD && this.bytesWritten && (this.bytesWritten-this._flushed)>=this._flushSize) {
        args = arguments;
        fs.fsync(this._flushFD,function(err){
            if(err) return this.emit('error',err);
            this._flushed = this.bytesWritten;
            this.superWrite.apply(this,args);
        }.bind(this));
    }
    else this.superWrite.apply(this,arguments);
}

exports.createFsyncWriteStream = function(path,options){
    return new ChunkWriteStream(path,options);
}