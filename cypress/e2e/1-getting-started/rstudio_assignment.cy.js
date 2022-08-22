// Cypress E2E Testcases for Rstudio Cloud
// Method to Login to the account
// Method to delete the space if exists
// Create a new space and then create a new project. 
// Verifying the IDE based on iFrame

const website = 'https://rstudio.cloud/'
const user = "Neha Ojha"
const emailAddress = 'reachojhaneha2016@gmail.com'
const rstudioPassword = 'Appleisred'
const spaceName = 'Space1'

// This method will Login to the Rstudio Cloud Platform with the  above email Adress and Password.
// This method can also be placed in Support folder so that it can be used across the test suite as a shared function.
function loginRstudioApp() {
  cy.visit(website)

  //Rstudio Logo is visible on the website
  cy.get('.productLogo').should('be.visible')

  // Verify the Login into the Rstudio Cloud
  cy.get('a[class="menuItem"] > span').contains('Log In').click()
  cy.get('h2[class="loginActive formTitle"]').contains('Log In')
  cy.get('input[name="email"]').type(emailAddress)
  cy.get('button[type="submit"]').contains('Continue').click()

  // Enter the Password and then click Log In button
  cy.get('input[type="password"]').should('be.visible').type(rstudioPassword).then(() => {
    cy.get('button[type="submit"]').contains('Log In').click()
  })

  // Check if login Successful
  cy.get('.userName').contains(user)

  cy.get('#headerTitle').click()
  // Verify that mainCover and navPanel are visible
  cy.get('#mainCover').should('be.visible')
  cy.get('#navPanel').should('be.visible')
}

// This method will delete the existing space.
// This step is required because the account created only allows for one space. 
function deleteIfSpaceExist() {
  // Delete the Space if exists
  cy.get('body').then($body => {
    if ($body.find('.spaceNameWithOwner').length > 0) {
      // cy.get('.spaceNameWithOwner').contains(spaceName).then(($space) => {
      cy.get('.spaceNameWithOwner').then(($space) => {
        const name = $space.text()
        $space.click()
        cy.get('button[class="action moreActions"]').click()
        cy.get('button[class="action delete"]').should('exist').click()

        // cy.get('input[aria-label="Name of space to delete"]').type("Delete " + spaceName)
        cy.get('input[aria-label="Name of space to delete"]').type("Delete " + name)
        cy.get('button[type="submit"]').contains('Delete').click()
        cy.get('.statusMessage').should('be.visible').then(($status) => {
          cy.log($status.text())
        })
        cy.get('#headerTitle').click()
      })
    }
  })
}

describe('example to-do app', () => {
  beforeEach(() => {
    loginRstudioApp()

    // TODO: Comment out if you do not want to delete space
    deleteIfSpaceExist()
  })

  it('Verify Creating a new space and new project', () => {
    cy.get('[class="productLogo"]').should('be.visible')
    
    // Click on New Space button to create a new space
    cy.get('button[class="menuItem newSpace"]').click()

    // Verify that a modal for New Space is displayed
    cy.get('.modalDialog > .purpose').should('be.visible').contains('New Space')
    //Input Space Name and click Create Button
    cy.get('input[id="name"]').type(spaceName).then(() => {
      cy.get('button[type="submit"]').click()
    })

    // Verify that the New Space is created and displayed on the Nav Menu
    cy.get('.spaceNameWithOwner').contains(spaceName).should('exist')
    cy.get('#headerTitle').contains(spaceName)

    // Creating a new Project within the space
    cy.get('span[class="actionTitle"]').contains('New Project').click().then(() => {
      cy.get('span[class="actionTitle"]').contains('New RStudio Project').click().then( () => {
        cy.get('.genMessageSpinnerContainer', { timeout: 30000}).should('exist').then(() => {
          cy.log("Deploying Project")
        })
        cy.get('#contentIFrame', { timeout: 30000}).should('exist').then(() => {
          cy.log("Content IFrame loaded")
        })
        cy.get('.genMessageSpinnerContainer', { timeout: 30000}).should('not.exist').then(() => {
          cy.log("New Project Created")
        })
      })
    })
  })
})