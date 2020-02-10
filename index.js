import usingNode13 from './app-utils/node13Check/index.js'
import runTests from './test/index.js'
import tests from './test/tests.js'

const ISPDHCPWatcher = async () => {
  return new Promise((resolve, reject) => {
    try {
      if(!(usingNode13())) {
        reject('This script was written to use Node 13. Please use Node 13 or submit a PR for another version of Node.')
      } else {
        resolve('running ISPDHCPWatcher')

        /* BIG DREAMS
        get my current IP
        compare it to the last IP result 
        if it didn't change, ping again after a certain interval
        if it did change: 
          pause pinging for IP changes (?necessary?)
          update aws route 53 DNS record with the new IP
            if that fails, email me?
            if that is successful, resume the intervals, and email me?
        
        if the IP hasn't changed for 8640 tries (presuming a ping interval every 10 seconds), email me that it hasn't, break the loop, and recursively call the function to start checking the IP again. This will provide me a daily update that the script is still working and keep the variable counting the loops from getting really long and eventually breaking. 

        Maybe put a timeout on the network requesting loop if the network requests are timing out. That probably means my internet is down and I wouldn't want some endpoint to get flooded with requests from me when my internet came back up. Then it could check each minute if the internet is back up. When the internet is back up, resume pinging. 

        Can this run on a Raspberry Pi? Specifically, my Raspberry Pi? 

        Start this script on startup of whatever it runs on. 

        Hide the appropriate configs. Use an AWS key with limited privledges (obvi) and email from something@terrycreamer.codes using AWS SES .
        
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
}