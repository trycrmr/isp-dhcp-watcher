

import usingNode13 from './appUtils/node13Check/index.js'
import checkPublicIP from './appUtils/checkPublicIP/index.js'

import runTests from './test/index.js'
import tests from './test/tests.js'

const NETWORK_TIMEOUT_THRESHOLD_MS = 1000
const URL_FOR_IP_CHECK = 'http://ipecho.net/plain'


class State {
  constructor(initialState = { currentPublicIP: undefined, lastPublicIP: undefined }) {
    state: initialState
  }

  getState = () => { return this.state }
  setState = (newState) => { 
    this.state = { ...this.state, ...newState }
    return this.getState()
  }
}

const ISPDHCPWatcher = async () => {
  try {
    if(!(usingNode13())) return new Error('This script was written to use Node 13. Please use Node 13 or submit a PR for another version of Node.')

    const state = new State()

    let currentPublicIP = await checkPublicIP(URL_FOR_IP_CHECK, { timeout: NETWORK_TIMEOUT_THRESHOLD_MS })
    return state.setState({ currentPublicIP })
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
    .then(results => console.log(results))
    .catch(err => console.log(err))
    .finally(() => process.exit)
}

export default ISPDHCPWatcher