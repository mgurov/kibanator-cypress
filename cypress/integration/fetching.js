import {givenWatch, aWatch, thenConfigPersisted} from '../fixtures/config'
import * as config from '../fixtures/config'
import * as fetching from '../fixtures/fetching'

describe('Fetching', function () {

    it('fetches rows', function () {

        let hitsHolder = fetching.hitsHolder("Hello 1") 

        fetching.givenResponse(
            {response: hitsHolder}
        )

        fetching.startFetchingFirstWatch()

        cy.get('[data-test-class="log-row"]')
            .should('has.length', 1)
            .should('contain', 'Hello 1')

        hitsHolder.add("Hello 2")

        cy.get('[data-test-class="log-row"]')
            .should('have.length', 2)
            .should('contain', 'Hello 1')
            .should('contain', 'Hello 2')

        cy.title().should('contain', '2 - ' + config.defaultWatch.serviceName)


        thenConfigPersisted(persistedConfig => {
            expect(JSON.stringify(persistedConfig)).to.not.contain('Hello')
        })

        cy.get('[data-test-id="reset"]')
            .click()
        
        cy.title().should('equal', config.defaultWatch.serviceName)

    })

    it('shows error upon fetching, stops in panic upon 401', function () {

        fetching.givenResponse({
            status: 500,
        })

        fetching.startFetchingFirstWatch()

        cy.contains('Error Internal Server Error')
        cy.get('[data-test-id="fetch-status"]').contains('fetching...')

        cy.log("yield panic after http 401")

        fetching.givenResponse({
            status: 401,
        })

        cy.contains('Panic: response not authorized')

        cy.get('[data-test-id="fetch-status"]').contains('stopped')

    })


    it('fetches per selected app', function () {

        let serviceName1 = 'blah-service'
        let serviceName2 = 'fooe-service'

        givenWatch(
            aWatch({serviceName: serviceName1, serviceField: '@fields.application'}),
            aWatch({serviceName: serviceName2, serviceField: '@fields.application'}),
        )

        fetching.givenResponse({response: fetching.hitsHolder("Hello 1")})
            .as("fetch-default-app")

        cy.visit('/watch/0')
        fetching.startFetching()    

        cy.wait('@fetch-default-app')
            .then(function(xhr){
                let requestBody = JSON.stringify(xhr.requestBody)
                expect(requestBody).to.contain(serviceName1)
              })

        cy.root().contains('Hello 1')

        cy.title().should('contain', '1 - ' + serviceName1)

        cy.root().get('[data-test-id="home-page"]').click()

        fetching.givenResponse({response: fetching.hitsHolder("Hello 2")})
            .as("fetch-second-app")

        cy.root().contains(serviceName2).click()

        cy.contains('Other watches are being fetched')
              .parent('div')
              .find('[data-test-id="reset"]')
              .click()

        fetching.startFetching()

        cy.wait('@fetch-second-app')
            .then(function(xhr){
                let requestBody = JSON.stringify(xhr.requestBody)
                expect(requestBody).to.contain(serviceName2)
              })

        cy.root().contains('Hello 2')

        cy.title().should('contain', '1 - ' + serviceName2)


    })
    
    it('regression - reset for second app', function () {

        let serviceName1 = 'blah-service'
        let serviceName2 = 'fooe-service'

        givenWatch(
            aWatch({serviceName: serviceName1, serviceField: '@fields.application'}),
            aWatch({serviceName: serviceName2, serviceField: '@fields.application'}),
        )

        fetching.givenResponse({response: fetching.hitsHolder("Hello 2")})
            .as("fetch-default-app")
        
        cy.visit('/watch/1')
        fetching.startFetching()    

        cy.wait('@fetch-default-app')

        cy.get('[data-test-id="reset"]').click()

        cy.title().should('equal', serviceName2)

    })

})


