## AgroLink - API

Cette application a été développée avec NestJS et TypeScript

# Installation

- Exécuter la commande 'yarn' pour installer les dépendances.
- Créer un fichier '.env' avec le contenu suivant :

  > DATABASE_URL = "mysql://root:password@127.0.0.1:3305/agrolink"  
  > JWT_SECRET = "APML57JK3ITrkDnLyXcynTBPnQrLIb"  
  > SENDINBLUE_API_KEY = "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"

  NB: L'URL de la database est à modifier selon votre cas. C'est une base de données mySQL que je faisais tourner en local dans un container Docker.

- Créer une base de données mySQL nommée 'agrolink' et exécutez le fichier 'dump_db.sql' présent à la racine de ce repository. Cela permettra de populer la base de données avec un minimum d'informations requises pour le bon fonctionnement de l'application
- Exécuter la commande yarn start pour lancer l'API
