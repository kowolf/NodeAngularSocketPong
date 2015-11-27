var express = require('express'),
    app = express();



/**
 * Configure middleware on the server
 */
app.use('/', express.static(__dirname + '/public'));
app.use('/node_modules', express.static(__dirname + '/node_modules/'));
app.use('/bower_components', express.static(__dirname + '/bower_components/'));


/**
 * Run the server
 */
var server = app.listen(8080, function () {
    var port = server.address().port;
    console.log("=====================================");
    console.log("Server Started! Go to localhost"  + ":" + port);
    console.log("=====================================");
});


/**
 * Set up the game model
 */
var Game = require('./game/game.js');
var game = new Game();
var intervalID;


/**
 * Set up the sockets
 */
var io = require('socket.io')(server);

io.sockets.on('connection', function(socket) {
    console.log('= New client has conencted!');

    socket.on('add-client', function(side) {
        console.log("Adding player as " + side);
        game.addPlayer(side);
        socket.emit('notification', game);
    });

    socket.on('update-state', function() {
        console.log("Sending update");
        socket.emit('notification', game);
    });

    socket.on('update-bat', function(obj) {
        //console.log("Updating bat " + obj.bat + " to pos: " + obj.pos);
        game.setBat(obj.bat,obj.pos);
        io.sockets.emit('notification', game);
    });

    socket.on('tick', function(obj) {
        game.tick();
    });


    socket.on('start', function() {
        console.log("Starting...");

        var response = game.startGame();
        intervalID = setInterval(timer,game.state.ball.speed);
        socket.emit('notificationGameStatus', response);
    });

});


var timer = function(){
    game.tick();
    io.sockets.emit('notification', game);

    if(game.state.inPlay==false) clearInterval(intervalID);
};



/**
 * When index is requested, serve the GUI
 */
app.get('/game', function (req, res) {

    res.send(JSON.stringify(game));
});

