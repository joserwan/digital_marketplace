Fonctionnalité: Authentification ClicSecure Express

En tant qu'entreprise québécoise
Je veux pouvoir m'authentifier à la solution avec mon compte ClicSecure
Afin de bénéficier de fonctionalités personnalisés

@todo
Scénario: Me connecter avec ClicSecur Express
  Sachant que l'authentification "ClicSecure Express" est permise
    Et que j'ai compte ClicSecure Express avec les informations suivantes:
    | username        | password          |
    | entreprise-1234 | mon-mot-de-passe  |
    Et que je suis sur la page d'accueil
  Lorsque je clique sur le lien "Connexion"
    Et que je clique sur le lien "ClicSecure Express"
    Et que je remplis le formulaire avec les informations suivantes:
      | username        | password          |
      | entreprise-1234 | mon-mot-de-passe  |
  Alors je vois "Bienvenue, entreprise-1234"