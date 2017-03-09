var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var engines = require('consolidate');

var index = require('./routes/index');
var users = require('./routes/users');

// chat code
var users = {};
var entries = require('object.entries')
var app = express();
var server = require('http').createServer(app)
var io = require('socket.io').listen(server);
io.sockets.on('connection', function(socket){
	//online
	socket.on('online', function(data){
		socket.name = data.user;
		if(!users[data.user]){
			users[data.user] = data.user;
		}
		io.sockets.emit('online', {users: users, user: data.user});
	})
	
	// say 
	socket.on('say', function(data){
		// broadcast to all others people(except oneself)
		if(data.to == 'all'){
			socket.broadcast.emit('say', data);
		} else {
			//send to specific user(to)
			var clients = entries(io.sockets.sockets);
			clients.forEach(function (client){
				if(client[1].name == data.to){
					client[1].emit('say', data)
				}
			})
		}
	})

	//disconnected
	socket.on('disconnect', function(){
		if(users[socket.name]){
			delete users[socket.name]
			socket.broadcast.emit('offline', {users: users, user: socket.name});
		}
	})
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('html', engines.handlebars);
app.set('view engine', 'html');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res){
	if(req.cookies.user == null){
		res.redirect('/signin');
	} else {
		res.sendfile('views/index.html');
	}
});

app.get('/signin', function(req, res){
	res.sendfile('views/signin.html');
});

app.post('/signin', function(req, res){
	if(users[req.body.name]){
		res.redirect('/signin');
	} else {
		res.cookie('user', req.body.name, {maxAge: 1000*60*60*24*30});
		res.redirect('/');
	}
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
// app.use(function(err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};

//   // render the error page
//   res.status(err.status || 500);
//   res.render('error');
// });

server.listen(8080)

// module.exports = app;
