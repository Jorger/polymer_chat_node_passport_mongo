(function()
{
    'use strict';
    var usuarios = [];
    var datos = new factoria();
    var socketURL = 'http://' + window.location.host;
    var socket = io.connect(socketURL);
    //Para los datos del usuario que s eha conectado...
    //Para emitir que existe un nuevo usaurio...
    var sessionId = '';
    socket.on('connect', function ()
    {
        sessionId = socket.socket.sessionid;
        socket.emit('newUser', {
                                    session : sessionId,
                                    id      : datos.getData().id
                                }
                    );
    });

    //Para dar los permisos a las notificaciones...
    if (Notify.needsPermission)
    {
        try
        {
            Notify.requestPermission(onPermissionGranted, onPermissionDenied);
        }
        catch(e)
        {
            console.log(e);
        }

    }

    socket.on('newConnection', function (data)
    {
        //Buscar si los usuarios ya estaban en linea...
        //Iterar y buscar si los usuarios ya estaban en el vista...
        var existe = false;
        for(var i = 0; i < data.length; i++)
        {
            existe = false;
            for(var c = 0; c < usuarios.length; c++)
            {
                if(data[i].id === usuarios[c].id)
                {
                    existe = true;
                    break;
                }
            }
            if(!existe)
            {
                usuarios.push({
                                id      : data[i].id,
                                nombre  : data[i].name,
                                foto    : data[i].photo
                });
            }
            //Decir la cantidad de usaurio que están en línea...
            template.enlinea = usuarios.length;
        }
    });

    socket.on('userDisconnected', function (data)
    {
        for(var i = 0; i < usuarios.length; i++)
        {
            if(usuarios[i].id === data.id)
            {
                usuarios.splice(i, 1);
                break;
            }
        }
        template.enlinea = usuarios.length;
    });

    function showNewest()
    {
        var chatDiv = document.querySelector('.chat-list');
        chatDiv.scrollTop = chatDiv.scrollHeight;
    }

    var template = document.querySelector('template[is=auto-binding]');
    template.channel = 'polymer-chat';
    template.enlinea = 0;
    template.usuarios = usuarios;
    //Para mostrar historial de mensajes...
    template.messages = [];
    var request = new XMLHttpRequest();
    request.open('GET', '/historial', true);
    request.onload = function()
    {
        if (request.status >= 200 && request.status < 400)
        {
            template.messages = JSON.parse(request.responseText);
            template.async(showNewest);
        }
    };
    request.onerror = function()
    {
        alert("Error")
    };
    request.send();

    template.checkKey = function(e) {
        if(e.keyCode === 13 || e.charCode === 13) {
            template.publish();
        }
    };
    template.sendMyMessage = function(e) {
        template.publish();
    };

    template.publish = function()
    {
        if(!template.input) return;
        //Se haría el llamado al Socket...
        socket.emit('enviaMensaje', {
                            id      : datos.getData().id,
                            nombre  : datos.getData().name,
                            foto    : datos.getData().foto,
                            msg     : template.input
                        });
    };

    socket.on('nuevoMensaje', function(data)
    {
        //Para mostrar la notificación...
        if(data.id !== datos.getData().id)
        {
            var myNotification = new Notify(data.nombre,
            {
                body: data.msg,
                tag: data.id,
                timeout: 5,
                icon : data.foto,
                notifyClick : function()
                {
                    window.focus();
                }
            });
            myNotification.show();
        }
        //Para publicar en la plantilla...
        template.messages.push({
            nombre  : data.nombre,
            foto    : data.foto,
            msg     : data.msg,
            fecha   : data.fecha
        });
        template.async(showNewest);
        template.input = '';
    });
})();
