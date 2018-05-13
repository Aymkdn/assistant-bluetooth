var request = require('request-promise-native'); // si vous souhaitez faire des requêtes HTTP

/**
 * on crée une fonction `AssistantBluetooth`
 * @param {Object} configuration L'objet `configuration` qui vient du fichier configuration.json
 */
var AssistantBluetooth = function(configuration) {
  this.host = configuration.host;
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
 * Fonction appelée par le système central
 *
 * @param {String} commande La commande envoyée depuis IFTTT par Pushbullet
 * @return {Promise}
 */
AssistantBluetooth.prototype.action = function(commande) {
  // 'commande' est 'connect/disconnect NOM'
  var connect = commande.startsWith('connect');
  var nom = commande.replace(/(dis)?connect/,"").trim();
  var host = this.host;
  if (connect && !nom) {
    return Promise.reject("[assistant-bluetooth] Erreur : la commande passée ("+commande+") semble incorrecte.");
  }
  console.log("[assistant-bluetooth] "+(connect?"Connexion à "+nom:"Déconnexion de l'enceinte Bluetooth"));
  if (!connect) {
    return request({
      url:"http://"+host+":8008/setup/bluetooth/connect",
      method:"POST",
      json:true,
      body:{"connect":false},
      headers:{
        'Content-Type': 'application/json'
      }
    })
    .catch(error => {
      console.log("[assistant-bluetooth] Erreur : la connexion au Google Home a eu un problème : ",error,error.statusCode,error.statusMessage);
    })
  }
  // on cherche l'address mac
  return request({
    url:"http://"+host+":8008/setup/bluetooth/get_bonded"
  })
  .then(function(response) {
    response = JSON.parse(response);
    if (!Array.isArray(response)) response = [ response ];
    for (var i=0; i<response.length; i++) {
      if (response[i].name.toLowerCase() === nom.toLowerCase()) {
        return request({
          url:"http://"+host+":8008/setup/bluetooth/connect",
          method:"POST",
          json:true,
          body:{"connect":connect,"mac_address":response[i].mac_address, profile:2},
          headers:{
            'Content-Type': 'application/json'
          }
        })
      }
    }
    return Promise.reject({statusCode:"000", statusMessage:'Appareil "'+nom+'" inconnu.'});
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
