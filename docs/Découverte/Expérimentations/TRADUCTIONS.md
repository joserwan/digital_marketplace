# Module de traduction

## Objectifs

* Démontrer la possibilité d'offrir une interfance utilisateur bilingue français / anglais
* Utiliser une méthode standard d'internationalisation (i18n)
* Faciliter la traduction
* Garder autant que possible un lien avec le projet DevExchange de BC

## Démarche

>Voir :
>
>* [Documentation](docs/TRANSLATIONS.md)
>* [Pull-request de l'expérimentation](https://github.com/CQEN-QDCE/digital_marketplace/pull/8/files)

1. Installer les module NPM d'internationalisation :

    * [i18next](https://www.i18next.com/).
    * [i18next-browser-languagedetector](https://github.com/i18next/i18next-browser-languageDetector).
    * [i18next-parser](https://github.com/i18next/i18next-parser)

2. Ajouter le script d'analyse des traductions manquantes [dans `package.json`](https://github.com/CQEN-QDCE/digital_marketplace/pull/8/files#diff-7ae45ad102eab3b6d7e7896acd08c427a9b25b346470d7bc6507b6481575d519R35)

3. Créer le
    * [fichier de configuration](https://github.com/CQEN-QDCE/digital_marketplace/pull/8/files#diff-3f49c9067e3b063e9b1e5ff1b7c21c5ab87b4473ccf614e00eb65506a634cdadR1)
    * [fichier de configuration d'analyse des traductions manquantes](https://github.com/CQEN-QDCE/digital_marketplace/pull/8/files#diff-4a41ec9a95c164030aac84da22e2696256b94553a4ef0a8b05646809b61ad466R1)
4. Importer le fichier de configuration dans le [template](https://github.com/CQEN-QDCE/digital_marketplace/pull/8/files#diff-1155042dcdc1f102e9ff3379a504e0b585e316405bb4052acc8b8033cf15edbeR11)

5. Créer les fichiers de traduction [français](https://github.com/CQEN-QDCE/digital_marketplace/pull/8/files#diff-dee3a499228348bf1d617c01f2b57ffdebcea55deed0c0a481139ae16689cc12R1) et [anglais](https://github.com/CQEN-QDCE/digital_marketplace/pull/8/files#diff-a9f322eaef8cf55507bc03d52f1e818a6328dca2f5f5afdb803e09b74ebe69f3R1)

6. [Ajouter un bouton](https://github.com/CQEN-QDCE/digital_marketplace/pull/8/files#diff-e909f8f2e2d1705d649e8a84d4951dc68affb4a3ef0d94d2d3979e53a20c700cR358) pour passer de français à anglais et réciproquement

7. Traduire l'interface :
    * [Texte simple](https://github.com/CQEN-QDCE/digital_marketplace/pull/8/files#diff-49ba705a71b5fcf70fda8a1776d5a64ddb570f4579c1a3a1ca2700c0a70e9702R446)
    * [Code HTML](https://github.com/CQEN-QDCE/digital_marketplace/pull/8/files#diff-d858b784729b6e4303f3200b8057ecf766d1eb7ee913e43db5e233c2a9960939R49)

> La preuve de concept réalise déjà les étapes 1 à 6. L'étape 7 est à compléter lors de la phase de réalisation. Nous les mentionnons tout de même.

## Résultats

> Note: Les fonctionnalités qui n'ont pas été testées ne sont pas requises selon les besoins actuels de l'application.

| Fonctionnalité | Succès |
| --- | --- |
| Traduire du texte simple | ✓ |
| Traduire du texte HTML | ✓ |
| Adapter une image selon la langue | ✓ |
| Détecter le langage du système d'exploitation de l'utilisateur | ✓ |
| Sauvegarder les préférences linguistiques de l'utilisateur <sup>[1](#localstorage)</sup> | ✓ |
| Traduire du texte côté serveur | ✓ |
| Sauvegarder les préférences linguistiques d'un utilisateur dans le SGBD | ✓ |
---
<a name="localstorage">1</a>: Les préférences sont enregistrées dans le stockage local du navigateur de l'utilisateur.

## Analyse
