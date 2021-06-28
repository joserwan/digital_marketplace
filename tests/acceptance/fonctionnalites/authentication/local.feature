Fonctionnalité: Authentification locale

En tant qu'entrepreneur
Je veux pouvoir m'authentifier à la solution avec un compte dédié
Afin de bénéficier de fonctionalités personnalisés

Scénario: Cacher le lien de création de compte
  Sachant que l'authentification "Keycloak" est permise
    Mais que la création de compte prestataire est désactivée
  Lorsque je suis sur la page d'accueil
  Alors je ne vois pas "Créer un compte"

Scénario: Empêcher la création de compte
  Sachant que l'authentification "Keycloak" est permise
    Mais que la création de compte prestataire est désactivée
  Lorsque j'ouvre la page "sign-up"
  Alors je vois "Not Found"

@todo
Scénario: Me connecter avec mon compte local
  Sachant que l'authentification "Keycloak" est permise
    Et que j'ai compte Keycloak avec les informations suivantes:
    | username        | password          |
    | entreprise-1234 | mon-mot-de-passe  |
    Et que je suis sur la page d'accueil
  Lorsque je clique sur le lien "Connexion"
    Et que je remplis le formulaire avec les informations suivantes:
      | username        | password          |
      | entreprise-1234 | mon-mot-de-passe  |
    Et que je clique sur le bouton "Se connecter"
  Alors je vois "Bienvenue, entreprise-1234"