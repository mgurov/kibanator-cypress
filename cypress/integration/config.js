import {aWatch, givenWatch} from '../fixtures/config'

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

        cy.wrap('local storage config').should(function() {
            let config = JSON.parse(localStorage.getItem('kibanator_config_v1'))
            expect(config).to.have.property('watches')
            expect(config.watches[0]).to.have.property('serviceName', serviceName)
        })

        cy.root().contains(serviceName).click()

        startFetching()

        cy.root().contains('pending')
    })

    it('Can be edited afterwards', function () {

        givenWatch(
            aWatch(
                {serviceName: 'original'}
            )
        )

        cy.visit('/')

        cy.root().should('not.contain', 'Edit configuration')

        cy.contains('original').click()

        cy.get('[data-test-id=edit-config]').click()

        cy.get('#serviceName')
            .should('have.value', 'original')
            .clear()
            .type('new one')


        cy.get('.btn-primary').click()

        cy.root().should('not.contain', 'Edit configuration')
        
    })
    
    it('Can add one more app', function () {

        cy.visit('/')

        cy.get('[data-test-id="add-watch"]').click()

        cy.get('#serviceName')
            .should('have.value', 'yourAppHere')
            .clear()
            .type('app#2')


        cy.get('.btn-primary').click()

        cy.root().should('contain', 'app#2')
    })

    it('Can remove an app', function () {

        givenWatch(
            aWatch(
                {serviceName: 'original'}
            ),
            aWatch(
                {serviceName: 'not so much'}
            ),
        )

        cy.visit('/')

        cy.get('[data-test-class="watch-li"]').should('length', 2)

        cy.root().contains("not so much").click()

        cy.get('[data-test-id=edit-config]').click()

        cy.get('[data-test-id="rm-watch"]').click()

        cy.location().should((loc) => {
            expect(loc.pathname).to.eq('/ui/')
        })

        cy.root().should('not.contain', 'not so much')
        cy.root().should('contain', 'original')
    })

    it('Migrating legacy config', function () {

        cy.clearLocalStorage()

        let serviceName = 'blah-service'

        cy.wrap('set legacy config').then(
            () => localStorage.setItem('config', JSON.stringify(aWatch({serviceName: serviceName})))
        )

        cy.visit('/')

        cy.root().should('not.contain', 'Edit configuration')

        cy.wrap('check config migrated').should(function() {

            let migratedConfigString = localStorage.getItem('kibanator_config_v1')
            expect(migratedConfigString).to.not.be.null

            let migratedConfig =  JSON.parse(migratedConfigString)
            expect(migratedConfig)
                .to.have.property('watches')
            expect(migratedConfig.watches).to.have.lengthOf(1)
            expect(migratedConfig.watches[0]).to.have.property('serviceName', serviceName)
        })
        
    })

    xit('cannot be edited when fetching', function () {

        cy.visit('/')

        startFetching()

        cy.root().should('not.contain', 'Edit configuration')
        cy.root().should('not.contain', 'Inspect configuration')

        cy.get('[data-test-id=edit-config]').click()

        cy.root().should('contain', 'Inspect configuration')

        cy.get('[data-test-id=save-config]').should('be.disabled')
        
    })
})

function startFetching() {
    cy.get('[data-test-class="range-button"]').first().click()
}