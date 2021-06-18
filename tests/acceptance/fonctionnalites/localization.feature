Fonctionnalité: Site multilingue

En tant qu'utilisateur
Je veux pouvoir afficher le site dans ma langue

Scénario: Passer la langue de "<locale>" à "<newLocale>"
    Sachant que le langage de mon navigateur est "<locale>"
      Et que j'ouvre la page d'accueil
    Lorsque je clique sur le lien dont l'identifiant est 'toggle-locale'
    Alors je devrais voir "<signInLabel>"

    Exemples:
      | locale | newLocale | signInLabel |
      | fr     | en        | Collaborate |
      | en     | fr        | Collaborez  |
      | xyz    | fr        | Collaborez  |

Scénario: Afficher le site dans la langue "<locale>"
    Sachant que le langage de mon navigateur est "<locale>"
    Lorsque j'ouvre la page d'accueil
    Alors je devrais voir "<signInLabel>"

    Exemples:
      | locale | signInLabel |
      | fr     | Collaborez  |
      | en     | Collaborate |
      | xyz    | Collaborate |