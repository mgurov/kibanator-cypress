import {givenWatch, aWatch} from '../fixtures/config'
import * as fetching from '../fixtures/fetching'


const serviceName1 = 'blah-service'

describe('Acking', function () {

    it('acks one', function () {
        
        givenWatch(
            aWatch({serviceName: serviceName1}),
        )

        fetching.givenResponse({response: fetching.hitsHolder("Hello 1", "Hello 2", "Hello 3")})

        cy.visit('/watch/0')
        fetching.startFetching()

        cy.title().should('contain', '3 - ' + serviceName1)

        cy.root().contains('Hello 1')
        cy.root().contains('Hello 3')

        cy.root()
            .contains('Hello 2')
            .parent('[data-test-class="log-row"]')
            .find('.ack-button')
            .click()

        cy.root().should('contain', 'Hello 1')
        cy.root().should('not.contain', 'Hello 2')
        cy.root().should('contain', 'Hello 3')

        cy.title().should('contain', '2 - ' + serviceName1)
    })

    it('acks till', function () {
        
        givenWatch(
            aWatch({serviceName: serviceName1, serviceField: '@fields.application'}),
        )

        fetching.givenResponse({response: fetching.hitsHolder("Hello 1", "Hello 2", "Hello 3")})

        cy.visit('/watch/0')
        fetching.startFetching()

        cy.title().should('contain', '3 - ' + serviceName1)

        cy.root().contains('Hello 1')
        cy.root().contains('Hello 3')

        cy.root()
            .contains('Hello 2')
            .parent('[data-test-class="log-row"]')
            .find('.ack-button')
            .as('ack-2')

        cy.get('body').type('{meta}', {release: false}).get('@ack-2').click()

        cy.root().should('not.contain', 'Hello 1')
        cy.root().should('not.contain', 'Hello 2')
        cy.root().should('contain', 'Hello 3')

        cy.title().should('contain', '1 - ' + serviceName1)
    })
    
    it('filter', function () {
        
        givenWatch(
            aWatch({serviceName: serviceName1, serviceField: '@fields.application', 
            captors: [{
                "key": "world",
                "messageContains": "world",
                "type": "contains",
                "field": null,
                "acknowledge": false
              }]
        }),
        )

        fetching.givenResponse({response: fetching.hitsHolder("hello", "new world", "cruel", "old world")})

        cy.visit('/watch/0')
        fetching.startFetching()

        cy.title().should('contain', '4 - ' + serviceName1)

        cy.root()
            .contains('new world')
            .parent('[data-test-class="log-row"]')
            .find('.ack-tag')
            .click()

        cy.root().should('not.contain', 'new world')
        cy.root().should('not.contain', 'old world')
        cy.root().should('contain', 'hello')
        cy.root().should('contain', 'cruel')

        cy.title().should('contain', '2 - ' + serviceName1)
    })
    
    it('ack all', function () {
        
        givenWatch(
            aWatch({serviceName: serviceName1, serviceField: '@fields.application'}),
        )

        fetching.givenResponse({response: fetching.hitsHolder("hello", "new world", "cruel", "old world")})

        cy.visit('/watch/0')
        fetching.startFetching()

        cy.title().should('contain', '4 - ' + serviceName1)

        cy.root()
            .contains('ack all')
            .click()

        cy.root().should('not.contain', 'new world')
        cy.root().should('not.contain', 'old world')
        cy.root().should('not.contain', 'hello')
        cy.root().should('not.contain', 'cruel')

        cy.title().should('equal', serviceName1)
    })
    

})


