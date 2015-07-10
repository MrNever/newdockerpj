/**
 * Created by Mr_hu on 2015/6/3.
 */
//var EventEmitter=require("events").EventEmitter;
//var event=new EventEmitter();
//event.on("some_event",function(){
//    console.log("some_event sccured,开心的事儿");
//})
//
//setTimeout(function(){
//    event.emit('some_event');
//},1000);
var http = require('http');
server = http.createServer(function (req, res) {
    res.writeHeader(200, {"Content-Type": "text/plain"});
    res.end("Hello oschina\n");
})
server.get("*",function(req,res,next){
    console.log(req.url);
    next();
})
server.listen(8000);
console.log("httpd start @8000");