import usingNode13 from './appUtils/node13Check/index.js'
import checkPublicIP from './appUtils/checkPublicIP/index.js'

import runTests from './test/index.js'
import tests from './test/tests.js'

const NETWORK_TIMEOUT_THRESHOLD_MS = 5000
const URL_FOR_IP_CHECK = 'http://ipecho.net/plain'
const DELAY_BETWEEN_IP_CHECKS = 10000
const delay = (delayMS = DELAY_BETWEEN_IP_CHECKS) => {
  return new Promise((resolve, reject) => {
    console.log(`===> Delaying for ${DELAY_BETWEEN_IP_CHECKS / 1000} seconds, then reattempting network call.`)
    setInterval(() => {
      resolve()
    }, delayMS);
  })
}

class App {
  constructor(initialState = { currentPublicIP: undefined, lastPublicIP: undefined, firstCheck: true }) {
    this.state = initialState
  }

  getState = () => { console.log('Current state: ', this.state, ''); return this.state }
  setState = (newState) => { 
    console.log('** State updating **', new Date(Date.now()).toString())
    console.log('Previous state: ', this.state);
    console.log('State change: ', newState);
    this.state = { ...this.state, ...newState }
    return this.getState()
  }
}

class CheckIPError extends Error {
  constructor(originalError) {
    super()
    this.originalError = originalError
  }
}

const ISPDHCPWatcher = async () => {
  try {
    if(!(usingNode13())) return new Error('This script was written to use Node 13. Please use Node 13 or submit a PR for another version of Node.')

    const app = new App()

    let issue = undefined 
    while(!issue) {
      try {
        const checkPublicIPResult = await checkPublicIP(URL_FOR_IP_CHECK, { timeout: NETWORK_TIMEOUT_THRESHOLD_MS })
        .catch(err => new CheckIPError(err))

        if(checkPublicIPResult instanceof Error) throw checkPublicIPResult

        app.setState({ currentPublicIP: checkPublicIPResult })
        if(app.state.firstCheck) { 
          console.log('===> First check, setting IP')
          app.setState({ lastPublicIP: checkPublicIPResult, currentPublicIP: checkPublicIPResult, firstCheck: false })
          await delay()
          continue 
        } else if(app.state.currentPublicIP == app.state.lastPublicIP && !app.state.firstCheck) {
          console.log(`===> IP hasn't changed`)
          await delay()
          continue 
        } else if(app.state.currentPublicIP !== app.state.lastPublicIP) {
          console.log('===> IP changed!')
          app.setState({ lastPublicIP: checkPublicIPResult, currentPublicIP: checkPublicIPResult})
          // kick off other functions to update DNS record and do other things asynchronously
          await delay()
          continue 
        } else {
          console.log('===> Unhandled case, not sure what to do, so stopping.')
          issue = await app.getState()
        }
      } catch(err) {
          if(err instanceof CheckIPError) {
            console.log(`===> Error issuing network call. Delaying for ${DELAY_BETWEEN_IP_CHECKS / 1000} seconds, then reattempting network call.`)
            await delay()
            continue
          } else {
            issue = err
          }
      }
    }

    return issue
  } catch(err) {
    return err
  }
}

switch(process.argv[2]) {
  case 'test': 
    console.log('running tests')

    runTests(ISPDHCPWatcher, tests)
    .then(results => console.log(JSON.stringify(results, null, 2)))
    .catch(err => console.log(err))
    .finally(() => process.exit)
    
    break
  default: 
    ISPDHCPWatcher()
    .then(results => {
      console.log(results)
      // TODO email me that the program has stopped. Do the same for the error. 
    })
    .catch(err => console.log(err))
    .finally(() => process.exit)
}

export default ISPDHCPWatcher