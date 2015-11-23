var MongoClient = 	require("mongodb").MongoClient,
	fs      	= 	require('fs'),
    coleccion   =   {users : "", message : ""};

exports.conectaDatabase = function()
{
	MongoClient.connect("mongodb://127.0.0.1:27017/chatTwitter", function(err, database)
	{
		if(err) throw err;
        coleccion.users = database.collection("users");
        coleccion.message = database.collection("message");
		//Para borrar la colección...
		//coleccion.users.drop();
	});
};

exports.crearEditarUsuario = function(data, callback)
{
    var value = {
                    id          : data.id,
                    username    : data.username,
                    name        : data.displayName,
                    photo       : data.photos[0].value,
					session		: []
                };
    coleccion.users.findAndModify(
        {id : data.id},
        [['_id','asc']],
        {$set: value},
        {upsert: true},
        function(err, object)
        {
            if (err) console.warn("Error", err.message);
			callback(null, value);
        });
};

exports.actualizaSession = function(opc, callback)
{
	var opciones = opc.agrega ? ({$addToSet : {session : opc.session}}) : ({$pull : {session : opc.session}});
	coleccion.users.update({id : opc.id}, opciones, function(err, doc){
		if (err) console.warn("Error actualizaSession", err.message);
		callback(null, doc);
	});
};

exports.buscaUsuarioSesion = function(session, callback)
{
	//db.users.find({session : {$in : ["falrXQNwtlvs3ItfIvlx"]}}, {"id" : true, "_id" : false, session : true}).pretty();
	var query = {session : {$in : [session]}};
	var opciones = {"id" : true, "_id" : false, session : true};
	coleccion.users.find(query, opciones).toArray(function(err, doc){
		if (err) console.warn("Error buscaUsuarioSesion", err.message);
		callback(null, doc);
	});
};

//Para traer los usuarios que están en línea...
exports.usuariosEnLinea = function(callback)
{
	coleccion.users.find({'session.0' : {$exists: true}}, {"_id" : false, "session" : false, "username" : false}).toArray(function(err, doc){
		if (err) console.warn("Error", err.message);
        callback(null, doc);
	});

};

exports.buscaUsuario = function(id, callback)
{
    coleccion.users.findOne({id : id}, {"_id" : false}, function(err, doc)
    {
        if (err) console.warn("Error", err.message);
        callback(null, doc);
    });
};

exports.guardaMensaje = function(data, callback)
{
	coleccion.message.insert(data, function(err, doc)
	{
		if (err) console.warn("Error guardaMensaje", err.message);
        callback(null, doc);
	});
};
//db.message.find().pretty().limit( 5 ).sort({fecha : 1})
exports.traeHistorial = function(cantidad, callback)
{
	//"skip": 10,
	var opciones =	{
						"limit"	: cantidad,
    					"sort"	: [['fecha','asc']]
					};
	coleccion.message.find({}, {"_id" : false, "id" : false}, opciones).toArray(function(err, doc){
		if (err) console.warn("Error buscaUsuarioSesion", err.message);
		callback(null, doc);
	});
};
