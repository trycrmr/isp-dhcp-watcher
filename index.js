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

        /* BIG DREAMS
        1 get my current IP
        compare it to the last IP result 
        if it didn't change, ping again after a certain interval
        if it did change: 
          pause pinging for IP changes (?necessary?)
          update aws route 53 DNS record with the new IP
            if that fails, email me?
            if that is successful, resume the intervals, and email me?
        
        2 if the IP hasn't changed for 8640 tries (presuming a ping interval every 10 seconds), email me that it hasn't, break the loop, and recursively call the function to start checking the IP again. This will provide me a daily update that the script is still working and keep the variable counting the loops from getting really long and eventually breaking. 

        Maybe put a timeout on the network requesting loop if the network requests are timing out. That probably means my internet is down and I wouldn't want some endpoint to get flooded with requests from me when my internet came back up. Then it could check each minute if the internet is back up. When the internet is back up, resume pinging. 

        4 Can this run on a Raspberry Pi? Specifically, my Raspberry Pi? 

        3 Start this script on startup of whatever it runs on. 

        2.5 Hide the appropriate configs. Use an AWS key with limited privledges (obvi) and email from something@terrycreamer.codes using AWS SES .
        
        */
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