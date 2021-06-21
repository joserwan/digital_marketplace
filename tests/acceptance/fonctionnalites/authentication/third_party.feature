@fr
Fonctionnalité: Authentification tierce-partie

En tant pilote
Je veux pouvoir désactiver l'authentification tierce-partie
Afin d'obliger les utilisateur à s'authentifier avec Clic-Secure

Scénario: Désactiver l'authentification avec Github
  Sachant que l'authentification "Github" est désactivée
    Et que je suis sur la page d'accueil
  Lorsque je clique sur le lien "Connexion"
  Alors je ne vois pas "GitHub"

Scénario: Désactiver la création de compate avec Github
  Sachant que l'authentification "Github" est désactivée
    Et que je suis sur la page d'accueil
  Lorsque je clique sur le lien "Créer un compte"
  Alors je ne vois pas "GitHub"