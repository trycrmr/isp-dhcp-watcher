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