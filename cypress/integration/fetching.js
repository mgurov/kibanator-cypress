
describe('Kibanator', function () {

    it('fetches rows', function () {

        givenResponse({
            hits: [
                {
                    "_id": "ABC_1",
                    "_source": {
                        "Timestamp": "2018-06-03T09:09:04.9725233Z",
                        "Message": "Hello 1"
                    }
                }
            ]
        })

        cy.visit('/')

        //start fetching
        cy.get('[data-test-class="range-button"]').first().click()

        cy.get('[data-test-class="log-row"]')
            .should('has.length', 1)
            .should('contain', 'Hello 1')

        cy.log('Next fetch yields same record + one new')

        givenResponse({
            hits: [
                {
                    "_id": "ABC_1",
                    "_source": {
                        "Timestamp": "2018-06-03T09:09:04.9725233Z",
                        "Message": "Hello 1"
                    }
                },
                {
                    "_id": "ABC_2",
                    "_source": {
                        "Timestamp": "2018-06-03T09:09:05.9725233Z",
                        "Message": "Hello 2"
                    }
                }
            ]
        })

        cy.get('[data-test-class="log-row"]')
            .should('have.length', 2)
            .should('contain', 'Hello 1')
            .should('contain', 'Hello 2')
    })

    it('shows error upon fetching, stops in panic upon 401', function () {

        givenResponse({
            status: 500,
        })

        cy.visit('/')

        cy.get('[data-test-class="range-button"]').first().click()

        cy.contains('Error Internal Server Error')
        cy.get('[data-test-id="fetch-status"]').contains('fetching...')

        cy.log("yield panic after http 401")
        
        givenResponse({
            status: 401,
        })

        cy.contains('Panic: response not authorized')
       
        cy.get('[data-test-id="fetch-status"]').contains('stopped')
        
    })
})

function givenResponse(paramsArg) {

    let params = Object.assign({}, paramsArg)
    if (params.hits) {
        if (params.response) {
            throw Error("Cannot have both response and hits in givenResponse")
        }
        params.response = {
            hits: {
                hits: params.hits
            }
        }
        delete params.hits
    }

    cy.route(Object.assign({},
        {
            method: 'POST',
            url: '/index/_search*',
            status: 200,
            response: "",
        },
        params))
}
