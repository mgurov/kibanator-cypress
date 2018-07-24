import _ from 'lodash'
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

export function hitsHolder(...hits) {

    let id = 0;

    let hitsSoFar = []

    let response = () => {
        return {hits: {hits : hitsSoFar}}
    }

    response.add = (...hits) => {

        cy.wrap('adding more hits', hits).then(
            () => {
                let newHits = hits.map(h => {
                    id += 1
                    
                    let source = {
                        "Timestamp": "2018-06-03T09:09:04.9725233Z",
                    }

                    if (_.isObject(h)) {
                        Object.assign(source,h)
                    } else {
                        Object.assign(source,{
                            "Message": h
                        })
                    }

                    return {
                        "_id": id + "",
                        "_source": source
                    }
                })
                hitsSoFar.push(...newHits)
            }
        )
    }

    response.add(...hits)

    return response
}
