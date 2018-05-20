# assistant-bluetooth

Ce plugin de [`assistant-plugins`](https://aymkdn.github.io/assistant-plugins/) permet de connecter son Google Home à une enceinte Bluetooth de son choix, qui est déjà appareillée. Par exemple on peut lui dire de se connecter à l'enceinte de la cuisine, ou du salon, ou de la salle de bain, etc.

**Ne pas l'installer si vous ne possédez pas de Google Home !**

## Installation

Si vous n'avez pas installé [`assistant-plugins`](https://aymkdn.github.io/assistant-plugins/), alors il faut le faire, et sélectionner **bluetooth** comme plugin.

Si vous avez déjà installé [`assistant-plugins`](https://aymkdn.github.io/assistant-plugins/), et que vous souhaitez ajouter ce plugin, alors :
  - Pour Windows, télécharger [`install_bluetooth.bat`](https://github-proxy.kodono.info/?q=https://raw.githubusercontent.com/Aymkdn/assistant-bluetooth/master/install_bluetooth.bat&download=install_bluetooth.bat) dans le répertoire `assistant-plugins`, puis l'exécuter en double-cliquant dessus.  
  - Pour Linux/MacOS, ouvrir une console dans le répertoire `assistant-plugins` et taper :  
  `npm install assistant-bluetooth@latest --save && npm run-script postinstall`

## Configuration

Éditer le fichier `configuration.json` du répertoire `assistant-plugins` et y indiquer l'adresse IP de votre Google Home.

l'adresse IP de votre Google Home se trouve sur l'application Google Home de votre téléphone :

  1. Ouvrir l'application Google Home  
  2. Cliquer sur l'icône en haut à droite (*un téléviseur avec une enceinte*)  
  3. Votre appareil Google Home devrait apparaitre  
  4. Cliquer sur les *trois points* de votre appareil et choisir **Paramètres**  
  5. Descendre tout en bas jusqu'à la section **Informations**  
  6. Utiliser l'adresse IP qui est donnée (tout en bas)
  
La section du fichier `configuration.json` qui nous intéresse devrait ressembler à la partie ci-dessous (ici on va dire que l'IP est 192.168.0.13) :
```javascript
  "plugins": {
    "bluetooth": {
      "hosts":"192.168.0.13"
    }
  }
```

## Utilisation

Il faut d'abord **appareiller le Google Home avec l'enceinte Bluetooth souhaitée** (il existe plusieurs tutoriaux sur Internet qui expliquent comment faire... par exemple sur [stylistme.com](https://stylistme.com/comment-connecter-une-enceinte-bluetooth-a-google-home/)).

Ensuite, depuis IFTTT, voici un exemple d'applet à créer ; prenons la situation où une enceinte Bluetooth se trouve dans la douche, et que le nom de l'enceinte est "JBL Clip 2" :

  1. S'assurer que `assistant-plugins` est bien lancé  
  2. Créer une nouvelle *applet* dans IFTTT : [https://ifttt.com/create](https://ifttt.com/create)  
  3. Cliquer sur **this** puis choisir **Google Assistant**  
  4. Choisir la carte **Say a simple phrase**  
  5. Dans *« What do you want to say? »* mettre une phrase, par exemple : `connecte toi à la douche`  
  6. Remplir les autres champs de la carte  
  7. Maintenant, cliquer sur **that** puis choisir **Pushbullet**  
  8. Choisir la carte **Push a Note**  
  9. Dans le champs *« Title »*, mettre `Assistant`  
  10. Dans le champs *« Message »*, mettre `bluetooth_connect JBL Clip 2` (remplacer "JBL Clip 2" par le nom de votre enceinte telle qu'elle apparait dans l'application Google Home)  
  11. Enregistrer puis cliquer sur **Finish**  
  12. Dites : « OK Google, mets de la musique », puis s'assurer que l'enceinte Bluetooth est allumée, et dire : « OK Google, connecte toi à la douche »  
  13. Google Home devrait alors transférer la musique sur l'autre enceinte

Remarque : il est aussi possible de demander la déconnexion de l'enceinte sélectionnée en utilisant le mot clé **disconnect** seul lors de la commande PushBullet (étape 10 ci-dessus).

**À noter** que s'il n'y a **qu'un seul appareil** Bluetooth lié au Google Home, pas besoin de ce plugin ; il suffit de dire : « OK Google, connecte le Bluetooth » pour qu'il cherche et connecte l'enceinte pré-enregistrée.

En image :  

![applet IFTTT](https://user-images.githubusercontent.com/946315/39955270-389f661a-55cc-11e8-9d8e-e1404f3f045e.PNG)
