
describe('Config', function () {

    it('Shown when not in the local storage yet', function () {

        cy.clearLocalStorage()

        cy.visit('/')

        cy.contains('Edit configuration')

        const serviceName = 'generic,specific'

        cy.get('#serviceName')
            .should('have.value', 'yourAppHere')
            .clear()
            .type(serviceName)
        
        cy.get('.btn-primary').click()

        cy.root().should('not.contain', 'Edit configuration')

        cy.should(function() {
            expect(JSON.parse(localStorage.getItem('config')))
                .to.have.property('serviceName', serviceName)
        })
        
    })

    it('Can be edited afterwards', function () {

        cy.visit('/')

        cy.root().should('not.contain', 'Edit configuration')

        cy.get('[data-test-id=edit-config]').click()

        cy.root().should('contain', 'Edit configuration')
        
    })

    it('cannot be edited when fetching', function () {

        cy.visit('/')

        cy.get('[data-test-id="range-button-15 mins"]').click()

        cy.root().should('not.contain', 'Edit configuration')
        cy.root().should('not.contain', 'Inspect configuration')

        cy.get('[data-test-id=edit-config]').click()

        cy.root().should('contain', 'Inspect configuration')

        cy.get('[data-test-id=save-config]').should('be.disabled')
        
    })
})