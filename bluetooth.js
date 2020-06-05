var request = require('request-promise-native'); // si vous souhaitez faire des requêtes HTTP

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

/**
 * on crée une fonction `AssistantBluetooth`
 * @param {Object} configuration L'objet `configuration` qui vient du fichier configuration.json
 */
var AssistantBluetooth = function(configuration) {
  this.host = configuration.host;
  this.castToken = configuration.castToken;
}

/**
 * Il faut ensuite créer une fonction `init()`
 *
 * @param  {Object} plugins Un objet représentant les autres plugins chargés
 * @return {Promise}
 */
AssistantBluetooth.prototype.init = function(plugins) {
  this.plugins = plugins;
  // si une configuration est requise (en reprenant l'exemple de "key") :
  if (!this.host) return Promise.reject("[assistant-bluetooth] Erreur : vous devez configurer ce plugin en fournissant l'IP de votre Google Home !");
  return Promise.resolve(this);
};

/**
 * Se déconnecte d'une enceinte par défaut
 *
 * @return {Promise}
 */
AssistantBluetooth.prototype.disconnect = function() {
  console.log("[assistant-bluetooth] Déconnexion de l'enceinte Bluetooth actuelle");
  return request({
    url:"https://"+this.host+":8443/setup/bluetooth/connect",
    method:"POST",
    json:true,
    body:{"connect":false},
    headers:{
      'Content-Type': 'application/json',
      'cast-local-authorization-token': this.castToken

    }
  })
};

/**
 * Connecte l'enceinte
 *
 * @param {String} nom Nom de l'enceinte
 * @param  {String} mac_address L'adresse MAC de l'enceinte
 * @return {Promise}
 */
AssistantBluetooth.prototype.connect = function(nom, mac_address) {
  console.log("[assistant-bluetooth] Connexion à "+nom);
  return request({
    url:"https://"+this.host+":8443/setup/bluetooth/connect",
    method:"POST",
    json:true,
    body:{"connect":true,"mac_address":mac_address, "profile":2},
    headers:{
      'Content-Type': 'application/json',
      'cast-local-authorization-token': this.castToken
    }
  })
};

/**
 * Fonction appelée par le système central
 *
 * @param {String} commande La commande envoyée depuis IFTTT par Pushbullet
 * @return {Promise}
 */
AssistantBluetooth.prototype.action = function(commande) {
  // 'commande' est 'connect/disconnect NOM'
  var connect = commande.startsWith('connect');
  var nom = commande.replace(/(dis)?connect/,"").trim();
  var _this = this;
  if (connect && !nom) {
    return Promise.reject("[assistant-bluetooth] Erreur : la commande passée ("+commande+") semble incorrecte.");
  }
  if (!connect) {
    return this.disconnect();
  }

  // on va d'abord listé les appareils Bluetooth
  return request({
    url:"https://"+_this.host+":8443/setup/bluetooth/get_bonded",
    headers: {
      'cast-local-authorization-token': this.castToken
    }
  })
  .then(function(response) {
    response = JSON.parse(response);
    if (!Array.isArray(response)) response = [ response ];
    var mac_address, has_connected=false;
    for (var i=0; i<response.length; i++) {
      // on cherche l'enceinte demandée
      if (response[i].name.toLowerCase() === nom.toLowerCase()) {
        // on a besoin de l'adresse MAC
        mac_address = response[i].mac_address;
        // on regarde si cette enceinte est déjà connectée
        if (response[i].connected) {
          console.log("[assistant-bluetooth] L'enceinte "+nom+" est déjà connectée !");
          return;
        }
      }
      // on regarde si une enceinte est déjà connectée, si oui on doit d'abord la déconnecter
      if (response[i].connected) {
        has_connected=true;
      }
    }

    // si on n'a pas trouvé le device
    if (!mac_address) return Promise.reject({statusCode:"000", statusMessage:'Appareil "'+nom+'" inconnu.'});

    if (has_connected) {
      console.log("[assistant-bluetooth] Connexion à "+nom+" dans quelques secondes...");
      return _this.disconnect()
      .then(function() {
        return new Promise(function(prom_res, prom_rej) {
          setTimeout(function() {
            _this.connect(nom, mac_address)
            .then(function() { prom_res() })
            .catch(function(err) { prom_rej(error) })
          }, 5000)
        })
      })
    } else {
      return _this.connect(nom, mac_address);
    }
  })
  .catch(error => {
    console.log("[assistant-bluetooth] Erreur : la connexion au Google Home a eu un problème : ",error,error.statusCode,error.statusMessage);
  })
};

/**
 * Initialisation du plugin
 *
 * @param  {Object} configuration La configuration
 * @param  {Object} plugins Un objet qui contient tous les plugins chargés
 * @return {Promise} resolve(this)
 */
exports.init=function(configuration, plugins) {
  return new AssistantBluetooth(configuration).init(plugins)
  .then(function(resource) {
    console.log("[assistant-bluetooth] Plugin chargé et prêt.");
    return resource;
  })
}

/**
 * À noter qu'il est également possible de sauvegarder des informations supplémentaires dans le fichier configuration.json général
 * Pour cela on appellera this.plugins.assistant.saveConfig('nom-du-plugin', {configuration_en_json_complète}); (exemple dans le plugin freebox)
 */
