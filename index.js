/*
NOTES! 
200211 - Attempted to write a custom iterator. Definitely confusing myself. Probably a better idea to just get results running a do while loop. MDN docs said most cases could just be handled by async/await instead of generators. I think that's an opinionated statement of imperative versus functional programming paradigms, but I am forcing the functional programming here. I like the immutability and pure concepts of functional, but definitely realizing when imperative is just simplier or manages memory better. 

Regardless, seems like a do while loop will get results. It was a fun, academic exercise to try a custom iterator but I'd rather have results so I can get through this script. Tomorrow is only a sleep away! 
*/

import usingNode13 from './appUtils/node13Check/index.js'
import checkPublicIP from './appUtils/checkPublicIP/index.js'

import runTests from './test/index.js'
import tests from './test/tests.js'

const NETWORK_TIMEOUT_THRESHOLD_MS = 1000
const URL_FOR_IP_CHECK = 'http://ipecho.net/plain'


class State {
  constructor(initialState = { currentPublicIP: undefined, lastPublicIP: undefined, firstCheck: true }) {
    return {
      state: initialState,
      checkDHCP: {
        [Symbol.iterator]: () => {
          return {
            next: () => {
              // return { done: true }
              // try {
                // throw new Error('destruction')
                console.log('Running checkDHCP')
                // let checkPublicIPResult = await checkPublicIP(URL_FOR_IP_CHECK, { timeout: NETWORK_TIMEOUT_THRESHOLD_MS })
                let checkPublicIPResult = "73.163.36.7"
                console.log(checkPublicIPResult)
                this.setState({ currentPublicIP: checkPublicIPResult })
                if(this.state.firstCheck) { 
                  this.setState({ lastPublicIP: checkPublicIPResult, firstCheck: false })
                  console.log('First check, setting IP')
                  setInterval(() => { return { value: this.next, done: false } }, 10000) 
                } else if(this.state.currentPublicIP === this.state.lastPublicIP && !firstCheck) {
                  console.log('IP stayed the same')
                  setInterval(() => { return { value: this.next, done: false } }, 10000) 
                } else if(this.state.currentPublicIP !== this.state.lastPublicIP) {
                  console.log('IP changed!')
                  // kick off other functions to update DNS record and do other things asynchronously
                  setInterval(() => { return { value: this.next, done: false } }, 10000) 
                } else {
                  console.log('Unhandled case, not sure what to do, so stopping.')
                  return { done: true }
                }
              // } catch(err) {
              //   return { value: err, done: true }
              // }
              /*
              compare it to the last IP result 
              if it didn't change, ping again after a certain interval
              if it did change: 
              */
            }
          }
        }
      }
    }
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
    for (const thisDHCPCheck of state.checkDHCP) {
      console.log(thisDHCPCheck)  
    }
    // let currentPublicIP = await checkPublicIP(URL_FOR_IP_CHECK, { timeout: NETWORK_TIMEOUT_THRESHOLD_MS })
    // return state.setState({ currentPublicIP })
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