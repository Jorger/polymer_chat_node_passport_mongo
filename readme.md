## Chat Polymer

Ejemplo de Chat desarrollado haciendo uso de Polymer(0.5)/Node/Express/Mongo/Passport.

La actividad tiene como objetivo el aprendizaje de [Polymer], uso de [bower], manejo de [MongoDB] y autenticación vía Twitter a través de [passportjs]

El ejemplo base fue tomado del tutorial [Creating a Polymer Chat App with Material Design] desarrollado por [PubNub]

![Chat](https://dl.dropboxusercontent.com/u/181689/ChatPolymer.gif)

### Instalación

Para la instalación de depedencias del front-end, es necesario [bower], una vez instalado, se deberá ejecutar el comando.

```
bower install
```

Las dependencias deberán aparecer en la carpeta ```public/bower_components```

![Chat](https://dl.dropboxusercontent.com/u/181689/dependenciasBower.png)

Si no es el caso se deberá crear el archivo ```.bowerrc``` en la raíz del proyecto con el contenido:

```json
{
  "directory": "public/bower_components",
  "json": "bower.json"
}
```

Para la instalación de los módulos del Backend se deberá ejecutar el comando:

```
npm install
```

El cual instalará módulos como:

* Express
* Socket.io
* mongo
* passport
* Entre otros.

### Autenticación vía Twitter.

La autenticación del chat se realiza vía passport con el módulo ```passport-twitter``` por lo que es necesario la creación de una [app de Twitter], los datos de configuración de la misma deberán ser establecidos en el archivo [config.json]

```
{
    "twitter" :
    {
        "callback" : "http://127.0.0.1:3000/twitter/callback",
        "consumerKey" : "consumerKey_TWITTER",
        "consumerSecret" : "consumerSecret_TWITTER"
    }
}
```

### Autor

Jorge Rubiano

[@ostjh]


License
----

MIT

[@ostjh]:https://twitter.com/ostjh
[bower]:http://bower.io/
[Creating a Polymer Chat App with Material Design]:https://www.pubnub.com/blog/2015-01-15-creating-a-polymer-chat-app-with-material-design/
[PubNub]:https://www.pubnub.com/
[Polymer]:https://www.polymer-project.org/1.0/
[MongoDB]:https://www.mongodb.org/
[passportjs]:http://passportjs.org/
[config.json]:https://github.com/Jorger/polymer_chat_node_passport_mongo/blob/master/config.json
[app de Twitter]:https://apps.twitter.com/
