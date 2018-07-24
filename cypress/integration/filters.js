import {givenWatch, aWatch} from '../fixtures/config'
import * as fetching from '../fixtures/fetching'

describe('Filters', function () {

    it('add one', function () {

        let hitsHolder = fetching.hitsHolder(
            {"Message": "Hello ABBA", "expanded": "extra value"}, 
            "Hello BORING"
        )
        fetching.givenResponse({
            response: hitsHolder
        })

        fetching.startFetchingFirstWatch()

        cy.root().should('not.contain', 'extra value')

        cy.get('[data-test-class="log-row"]').first()
            .contains('Hello ABBA')

        cy.get('[data-test-class="log-row"] [data-test-class="row-expand-collapse"]').first()
            .click()

        cy.root().contains('extra value')

        cy.contains('Filter...').click()

        cy.contains('Ack Matched (1)')
        
        cy.get('[data-test-class="log-row"]').contains('Hello ABBA')

        cy.contains('Save as').click()

        cy.get('#key').clear().type('filter1')

        cy.contains('OK, save this').click()

        cy.contains('filter1')

        cy.contains('edit filters')
        
        hitsHolder.add("Hello ABBA 2", 
        "Hello BORING 2")

        cy.root().should('contain','Hello BORING 2')
                .should('not.contain', 'Hello ABBA')

        cy.root().contains('filter1').click()
        cy.root().should('contain', 'Hello ABBA')

    })

    it('can be deleted', function() {
        givenWatch(
            aWatch({
                "captors":[{"key":"filter 1","messageContains":"ABBA","type":"contains","field":null,"acknowledge":true}]
            })
        )

        fetching.givenResponse({response: fetching.hitsHolder("Hello ABBA")})

        fetching.startFetchingFirstWatch()

        cy.root().should('not.contain', 'ABBA')

        cy.contains('filter 1').click()

        cy.root().should('contain', 'ABBA')

        cy.root().contains('remove captor').click()

        cy.root().should('not.contain', 'filter 1')

        cy.root().should('contain', 'ABBA')

    })

    it('can be deleted via edit filters', function() {
        givenWatch(
            aWatch({
                "captors":[{"key":"filter 1","messageContains":"ABBA","type":"contains","field":null,"acknowledge":true}]
            })
        )

        fetching.givenResponse({response: fetching.hitsHolder("Hello ABBA")})

        fetching.startFetchingFirstWatch()

        cy.root().should('not.contain', 'ABBA')

        cy.contains('edit filters').click()

        cy.root().should('contain', 'filter 1')

        cy.root().get('.rm-filter').click()

        cy.root().should('not.contain', 'filter 1')

        cy.root().should('contain', 'ABBA')
    })
})