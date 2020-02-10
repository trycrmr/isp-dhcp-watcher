import usingNode13 from './app-utils/node13Check/index.js'

const ISPDHCPWatcher = async () => {
  try {
    if(!(await usingNode13())) {
      console.log('This script was written to use Node 13. Please use Node 13 or submit a PR for another version of Node.')
      process.exit
    } else {
      console.log('running ISPDHCPWatcher')
    }
  } catch(err) {
    console.error(err)
    process.exit
  }
}

export default ISPDHCPWatcher

switch(process.argv[2]) {
  case 'test': 
    console.log('running tests')
    // import runTests from './test/index.js'
    // runTests()
    break
  default: 
    ISPDHCPWatcher()
}