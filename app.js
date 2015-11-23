var express         = 	require("express"),
	app             = 	express(),
	server  		= 	require('http').createServer(app),
    session 		= 	require('express-session'),
	puerto 	        = 	process.env.PORT || 3000,
    passport        =   require('passport'),
    TwitterStrategy =   require('passport-twitter').Strategy,
	bd 				= 	require('./modules/database'),
	fs 				= 	require('fs'),
	io      		= 	require('socket.io').listen(server, {log: false}),
	bodyParser 		= 	require('body-parser'),
	config 			= 	JSON.parse(fs.readFileSync('config.json', 'utf8'));

	//Para conectar a la base de datos...
	bd.conectaDatabase();
	//Passport Twitter...
    passport.use(new TwitterStrategy({
		consumerKey: config.twitter.consumerKey,
        consumerSecret: config.twitter.consumerSecret,
        callbackURL: config.twitter.callback
    },
    function(token, tokenSecret, profile, done){
		bd.crearEditarUsuario(profile, function(err, response){
			if (err) return done(err);
			done(null, response);
		});
    }));

    passport.serializeUser(function(user, done){
		done(null, user.id);
	});

	passport.deserializeUser(function(id, done){
		bd.buscaUsuario(id, function(err, response){
			if (err) return done(err);
			done(null, response);
		});
	});

	var sessionMiddleware = session({
						secret: '$2a$10$GsvafBLCODG.gUNlB987fORJjTiwjiKs42MjAIqTMB3lour44n39K',
						cookie: { maxAge: 600000 },
						resave: true,
						saveUninitialized: true
					});

    app.use(sessionMiddleware);
	app.use(passport.initialize());
	app.use(passport.session());
	
	app.set("view engine", "ejs");
	app.set("views", __dirname + "/vistas");
	app.use(express.static('public'));

	//Para indicar que se envía y recibe información por medio de Json...
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({extended: true}));

	app.get("/login", function(req, res){
		res.render("login");
	});

	app.get("/", function(req, res)
	{
		if(!req.isAuthenticated())
		{
	        res.redirect('/login');
	    }
	    else
		{
			res.render("index", {
				titulo 	:  	"CHAT POLYMER",
				nombre	:	req.user.name,
				foto	: 	req.user.photo,
				usuario	:	req.user.username,
				id		:	req.user.id
			});
	    }
	});

	io.sockets.on('connection', function (socket)
	{
		socket.on('newUser', function (data)
		{
			//Saber si el usuario que ha llegado existe en la base de datos...
			bd.buscaUsuario(data.id, function(err, response)
			{
				if (err) console.log("Existe un error");
				//Se guardar la sessión del nuevo usaurio...
				bd.actualizaSession({agrega : true, session : data.session, id : data.id}, function(err, response)
				{
					if (err) console.log("Existe un error");
					//Se devuelven los usuarios que tengan sesion abierta...
					bd.usuariosEnLinea(function(err, response)
					{
						//Se envía los usuarios que están en sesión...
						io.sockets.emit('newConnection', response);
					});
				});
			});
		});

		//console.log("Ingresa a la conexión");
		socket.on('enviaMensaje', function (data)
		{
			data.fecha = new Date().toISOString();
			//Guardar en la base de datos los mensajes..
			bd.guardaMensaje(data, function(err, response)
			{
				if (err) console.log("Existe un error en guardaMensaje");
				io.sockets.emit('nuevoMensaje', data);
			});
		});

		socket.on('disconnect', function()
		{
			//Buscar el usuario que está relacionada a la sesión que se cierra...
			bd.buscaUsuarioSesion(socket.id, function(err, response)
			{
				if (err) console.log("Existe un error buscaUsuarioSesion");
				bd.actualizaSession({agrega : false, session : socket.id, id : response[0].id}, function(err)
				{
					if (err) console.log("Existe un error en actualizaSession");
					//Saber cuantas sesiones tiene abiertas el usuario...
					//console.log(response[0].id, response[0].session);
					if(response[0].session.length <= 1)
					{
						//Emitir que el usaurio se ha desconectado...
						io.sockets.emit('userDisconnected', {id : response[0].id, sender : "system"});
					}
				});
			});
		})
	});

	app.get('/twitter', passport.authenticate('twitter'));
	app.get('/twitter/callback', passport.authenticate('twitter', { successRedirect: '/', failureRedirect: '/login' }));

	app.get("/historial", function(req, res)
	{
		if(req.isAuthenticated())
		{
			bd.traeHistorial(100, function(err, response){
				if (err) console.log("Existe un error en historial");
				res.json(response);
			});
	    }
	    else
		{
			res.status(403).send("Acceso no autorizado...");
	    }
	});

	//Para cualquier url que no cumpla la condición...
	app.get("*", function(req, res){
		res.status(404).send("Página no encontrada :( en el momento");
	});

	server.listen(puerto, function(err){
   		if(err) throw err;
		var message = 'Servidor corriendo en @ http://localhost:' + server.address().port;
		console.log(message);
	});
