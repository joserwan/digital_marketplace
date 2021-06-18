Feature: Bilingual website

As a user
I want to display the website in my language

Scenario: Switch locale from "<locale>" to "<newLocale>"
    Given my browser language is "<locale>"
      And I open the home page
    When I click on link with id 'toggle-locale'
    Then I should see "<signInLabel>"

    Examples:
      | locale | newLocale | signInLabel |
      | fr     | en        | Collaborate |
      | en     | fr        | Collaborez  |
      | xyz    | fr        | Collaborez  |

Scenario: Display the website with language "<locale>"
    Given my browser language is "<locale>"
    When I open the home page
    Then I should see "<signInLabel>"

    Examples:
      | locale | signInLabel |
      | fr     | Collaborez  |
      | en     | Collaborate |
      | xyz    | Collaborate |