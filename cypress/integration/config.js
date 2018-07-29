import { aWatch, givenWatch, thenConfigPersisted } from '../fixtures/config'
import _ from 'lodash'

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

        thenConfigPersisted(persistedConfig => {
            expect(persistedConfig).to.have.property('watches')
            expect(persistedConfig.watches[0]).to.have.property('serviceName', serviceName)
        })

        cy.root().contains(serviceName).click()

        startFetching()

        cy.root().contains('pending')
    })

    it('Can be edited afterwards', function () {

        givenWatch(
            aWatch(
                { serviceName: 'original' }
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
                { serviceName: 'original' }
            ),
            aWatch(
                { serviceName: 'not so much' }
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

        let givenLegacyConfig = {
            "levelField": "Level",
            "messageField": "Message",
            "serviceName": "generic,specific",
            "timeField": "Timestamp",
            "serviceField": "Data.app",
            "levelValue": "ERROR",
            "captors": [
                {
                    "type": "contains",
                    "field": null,
                    "key": "4278",
                    "acknowledge": true,
                    "messageContains": "[Hello, world 4278"
                },
                {
                    "type": "contains",
                    "field": "Data.app",
                    "acknowledge": false,
                    "key": "generic-dash",
                    "messageContains": "generic-dash"
                },
                {
                    "messageContains": "do not match anything if old code 09a539c",
                    "acknowledge": true,
                    "key": "^generic$",
                    "field": "Data.app",
                    "regex": "^generic$",
                    "type": "regex"
                }
            ],
            "newState": {
                "serviceName": "generic",
                "messageField": "@message",
                "serviceField": "@fields.application",
                "timeField": "@timestamp",
                "levelField": "@fields.level",
                "watches": [],
                "index": "mylog",
                "levelValue": "ERROR"
            },
            "watches": [],
            "index": "mylog",
            "type": "SET_CONFIG"
        }

        cy.wrap('set legacy config').then(
            () => localStorage.setItem('config', JSON.stringify(givenLegacyConfig))
        )

        cy.visit('/')

        cy.root().should('not.contain', 'Edit configuration')

        thenConfigPersisted(migratedConfig => {
            expect(migratedConfig)
                .to.have.property('watches')
            expect(migratedConfig.watches).to.have.lengthOf(1)
            let convertedWatch = migratedConfig.watches[0]
            expect(convertedWatch).to.have.property('serviceName', givenLegacyConfig.serviceName)
            expect(convertedWatch).to.not.have.property('newState')
            expect(convertedWatch).to.not.have.property('watches')
            expect(convertedWatch).to.not.have.property('type')
        })

    })

    it('reading and saving v1 config', function () {


        const givenConfig = {
            "watches": [
                {
                    "serviceName": "generic,specific",
                    "messageField": "Message",
                    "captors": [
                        {
                            "messageContains": "[Hello, world 4278",
                            "type": "contains",
                            "field": null,
                            "acknowledge": true,
                            "key": "4278"
                        }
                    ],
                    "id": "generic,specific",
                    "index": "mylog",
                    "serviceField": "Data.app",
                    "levelField": "Level",
                    "timeField": "Timestamp",
                    "levelValue": "ERROR"
                }
            ]
        }

        cy.clearLocalStorage()

        cy.wrap('set legacy config').then(
            () => localStorage.setItem('kibanator_config_v1', JSON.stringify(givenConfig))
        )

        cy.visit('/')

        cy.root().should('not.contain', 'Edit configuration')

        cy.contains(givenConfig.watches[0].serviceName).click()

        cy.get('[data-test-id=edit-config]').click()

        //change service name
        const updatedServiceName = 'updated service name'
        cy.get('#serviceName')
            .should('have.value', givenConfig.watches[0].serviceName)
            .clear()
            .type(updatedServiceName)

        let expectUpdatedConfiguration = _.cloneDeep(givenConfig)
        expectUpdatedConfiguration.watches[0].serviceName = updatedServiceName

        cy.get('.btn-primary').click()

        thenConfigPersisted(migratedConfig => {
            expect(migratedConfig)
                .to.deep.equal(expectUpdatedConfiguration)
        })
    })
})

function startFetching() {
    cy.get('[data-test-class="range-button"]').first().click()
}