const minimalWatch = {
    index: 'index',
    messageField: 'Message',
    timeField: 'Timestamp'
}

export const defaultWatch = Object.assign({}, minimalWatch, {
    serviceName: "default app",
    serviceField: '@fields.application',
})

export function aWatch(overrides) {
    return Object.assign({}, defaultWatch, overrides)
}

export function givenWatch(watch) {
    givenConfig({
        watches: Array.prototype.slice.call(arguments)
    })
}

export function givenConfig(config) {
    cy.clearLocalStorage()
    cy.wrap(
        'config'
    ).then(() => {
        localStorage.setItem(kibanator_config_v1, JSON.stringify(config))
    })
}

export function thenConfigPersisted(assertion) {
    cy.wrap('check config updated').should(function () {

        let persistedConfigString = localStorage.getItem('kibanator_config_v1')
        expect(persistedConfigString).to.not.be.null

        let persistedConfig = JSON.parse(persistedConfigString)

        assertion(persistedConfig)
    })

}


export const kibanator_config_v1 = 'kibanator_config_v1'