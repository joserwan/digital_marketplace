Feature: Bilingual website

Scenario: Toggle locale
    Given my browser language is "<locale>"
      And I open the page "/"
      And I take a screenshot "<locale>-before.png"
    When I click on link with id 'toggle-locale'
      And I take a screenshot "<locale>-after.png"
    Then I should see "<signInLabel>"

    Examples:
      | locale | signInLabel |
      | fr     | Collaborate |
      | en     | Collaborez  |
      | xyz    | Collaborez  |

Scenario: Display local language of the website
    Given my browser language is "<locale>"
    When I open the page "/"
      And I take a screenshot '<locale>'
    Then I should see "<signInLabel>"

    Examples:
      | locale | signInLabel |
      | fr     | Collaborez  |
      | en     | Collaborate |
      | xyz    | Collaborate |