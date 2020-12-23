var app = require('express')();
var express = require('express');
var http = require('http').Server(app);

app.get('/', function(req, res){
	res.sendfile('reservation.html');
});
app.use(express.static("static-files"));

server = app.listen(3000, function(){
	console.log('listening on *:3000')
});