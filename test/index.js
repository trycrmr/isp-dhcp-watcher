const runTest = async function(thisFuncToTest, expectedResult, funcArgs) {
  return new Promise((resolve, reject) => {
    if(!thisFuncToTest) {reject('Please pass a function to test')} // Handled as exception?
    if(!funcArgs) {reject('Please pass an argument for the function to test')}
    if(!expectedResult) {reject('Please pass an argument as the expected result')}
    if(thisFuncToTest instanceof Promise) { reject('Please promisify the function to be tested') }

    thisFuncToTest(...funcArgs)
    .then(result => {
      if(result === expectedResult) {
        resolve({ // test passed
          isPass: true,
          expected: expectedResult,
          result: result,
          isError: false
        })
      } else { // exception case, function ran successfully but didn't pass
        reject({
          isPass: false,
          expected: expectedResult,
          result: result,
          isError: false,
        })
      }
    })
    .catch(err => {
      reject({ // error case, function to test errored
        isPass: false,
        expected: expectedResult,
        result: err,
        isError: true,
      })
    })
    
  })
}

const runTests = async (funcToTest, tests) => {
  return Promise.allSettled(tests.map(thisTest => runTest(funcToTest, thisTest.expected, thisTest.args)))
}

export default runTests