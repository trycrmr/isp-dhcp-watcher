import usingNode13 from './app-utils/node13Check/index.js'

(async (args) => {
  try {
    if(!(await usingNode13())) {
      console.log('This script was written to use Node 13. Please use Node 13 or submit a PR for another version of Node.')
      process.exit
    } else {
      
    }
  } catch(err) {
    console.error(err)
    process.exit
  }

  // usingNode13()
  // .then(result => console.log(`Success: ${result}`), result => console.log(`Exception occurred: ${result}`))
  // .catch(err => console.log(`Error occurred: ${err}`))
  // .finally(() => { process.exit })

})(...process.argv)