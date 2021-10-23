require('dotenv').config()

const log = require('signale')

const { Elarian } = require('elarian')
const { await } = require('signale')

// Create a connection

let client

// Handlers

async function handleUssd(notification, customer, appData, callback) {
    console.log(notification)

    const customerData = await customer.getState()

    const input = notification.input.text

    const menu = {
        text: '',
        isTerminal: false
    }

    if (input === '') {
        menu.text = 'Hi there, welcome to the JKUAT SES session\n'
        menu.text += 'How was your experience during this event?\n'
        menu.text += '1. Great event!\n2. Pretty okay\n3. I wish I was in Juja town\n4. Why am I here?'

        callback(menu, appData)

    } else if (parseInt(input) <= 4) {
        menu.text = 'Thanks for the feedback! Have a great day :)'
        menu.isTerminal = true

        const resp = await customerData.updateMetadata({
            npsScore: parseInt(input)
        })

        console.log(resp)

        callback(menu, appData)
    }
}

const start = () => {
    client = new Elarian({
        appId: process.env.APP_ID,
        orgId: process.env.ORG_ID,
        apiKey: process.env.API_KEY
    })

    client
        .on('error', (error) => {
            log.warn(`${ error.message || error }. Attemping to reconnect...`)
            client.connect()
        })
        .on('connected', () => {
            console.log('Connected to Elarian...')

            const customer = new client.Customer({
                provider: 'cellular',
                number: '+254721600600'
            })

            const resp = customer.sendMessage(
                {channel: 'sms', number: '23454'},
                {
                    body: {
                        text: 'Kwani ni kesho?'
                    }
                }
            )

            console.log(resp)
        })
        .on('ussdSession', handleUssd)
        .connect()
}

start()