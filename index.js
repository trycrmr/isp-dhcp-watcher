import http from 'http'

import usingNode13 from './appUtils/node13Check/index.js'
import checkPublicIP from './appUtils/checkPublicIP/index.js'

import runTests from './test/index.js'
import tests from './test/tests.js'

const IP4_REGEX = '^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$' // https://stackoverflow.com/a/25969006/5935694
const NETWORK_TIMEOUT_THRESHOLD_MS = 1000
const URL_FOR_IP_CHECK = 'http://ipecho.net/plain'

const ISPDHCPWatcher = async () => {
  return new Promise((resolve, reject) => {
    try {
      if(!(usingNode13())) {
        reject('This script was written to use Node 13. Please use Node 13 or submit a PR for another version of Node.')
      } else {
        let handleResponse = ((thisResponse) => {
          if(thisResponse instanceof Error)
            reject(thisResponse)
          if(thisResponse.statusCode !== 200)
            reject(thisResponse) // Handled as exception? Network request happened, but it wasn't successful (kind of, not sure how 300s are handled here.)

          let rawData = ''
          thisResponse.on('setTimeout', (NETWORK_TIMEOUT_THRESHOLD_MS, () => { reject(`Network request timed out after ${NETWORK_TIMEOUT_THRESHOLD_MS}ms`)}))
          thisResponse.on('data', chunk => rawData += chunk );
          thisResponse.on('end', () => {
            try {
              if(rawData.match(IP4_REGEX)) // response from ipecho is expected to be an IP address 
                resolve(rawData);
              reject(`Response was not an IP address, ${rawData}`)
            } catch (err) {
              reject(err);
            }
          })
        })

        http.get(URL_FOR_IP_CHECK, { timeout: NETWORK_TIMEOUT_THRESHOLD_MS }, handleResponse)
        .on('error', err => reject(err))
        .on('timeout', () => { reject(`Network request timed out after ${NETWORK_TIMEOUT_THRESHOLD_MS}ms`) })
      }
    } catch(err) {
      reject(err)
    }
  })
}

export default ISPDHCPWatcher

switch(process.argv[2]) {
  case 'test': 
    console.log('running tests')

    runTests(ISPDHCPWatcher, tests)
    .then(results => console.log(results))
    .catch(err => console.log(err))
    .finally(() => process.exit)
    
    break
  default: 
    ISPDHCPWatcher()
    .then(results => console.log(results))
    .catch(err => console.log(err))
    .finally(() => process.exit)
}