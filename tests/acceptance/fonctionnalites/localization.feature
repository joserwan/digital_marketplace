Fonctionnalité: Site multilingue

En tant qu'utilisateur
Je veux pouvoir afficher le site dans ma langue

Plan du scénario: Passer la langue de "<locale>" à "<newLocale>"
    Sachant que le langage de mon navigateur est "<locale>"
      Et que j'ouvre la page d'accueil
    Lorsque je clique sur le lien "<newLocaleLabel>"
    Alors je devrais voir "<signInLabel>"

    Exemples: Langues connues
      | locale | newLocale | newLocaleLabel | signInLabel |
      | fr     | en        | English        | Collaborate |
      | en     | fr        | Français       | Collaborez  |
      | xyz    | fr        | Français       | Collaborez  |

    Exemples: Langues non reconnues
      | locale | newLocale | newLocaleLabel | signInLabel |
      | xyz    | fr        | Français       | Collaborez  |

Scénario: Afficher le site dans la langue "<locale>"
    Sachant que le langage de mon navigateur est "<locale>"
    Lorsque j'ouvre la page d'accueil
    Alors je devrais voir "<signInLabel>"

    Exemples:
      | locale | signInLabel |
      | fr     | Collaborez  |
      | en     | Collaborate |
      | xyz    | Collaborate |