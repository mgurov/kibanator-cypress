export function givenResponse(paramsArg) {

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

    return cy.route(Object.assign({},
        {
            method: 'POST',
            url: '/index/_search*',
            status: 200,
            response: "",
        },
        params))
}

export function startFetchingFirstWatch() {
    cy.visit('/watch/0')

    //start fetching
    startFetching()
}

export function startFetching() {
    cy.get('[data-test-class="range-button"]').first().click()
}