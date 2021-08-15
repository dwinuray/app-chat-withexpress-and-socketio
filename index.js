var app  = require('express')();
var http = require('http').Server(app);
var io   = require('socket.io')(http);


var users = {};
var usernames = [];
var socketId = "";


app.get('/', function( req, res ) {

    res.sendFile(__dirname + '/index.html');
});

// connection for socket.io
io.on('connection', function( socket ) {



    // new message
    socket.on('msg', function( msg ) {

        // emit : notification from new message 
        io.emit('msg', msg);

        // console.log( "Chat baru " + msg );
    });


    // register user
    socket.on('registerUser', function( username = null ) {

        if ( usernames.indexOf(username) != -1 ) {

            socket.emit('responseRegister', false);

        } else {    


            // response
            if ( username != null ) {

                socket.broadcast.emit('msg', username + ' telah bergabung');
            }

            socket.emit('responseRegister', true);
            
            socketId = socket.id;
            users[socketId] = username;
            
            usernames.push(username);


            // show online users
            io.emit('online-users', usernames);
        }
    })



    // status typing
    socket.on('newTyping', function( data ) {

        io.emit( 'newTyping', data );
    });



    // if user disconnected from server
    socket.on('disconnect', function() {

        // response
        if ( users[socketId] ) {

            socket.broadcast.emit('msg', users[socket.id] + ' left the chat');

            let index = usernames.indexOf(users[socket.id]);
            let name = usernames[index];
            usernames.splice(index, 1);

            // delete
            delete users[socket.id];

            // show online users
            io.emit('disable-user', name);
        }
    })
})

http.listen(3000, function(){

    console.log("Oke run");
})