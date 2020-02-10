import { execSync } from 'child_process'
 
 export default async () => {
  return new Promise((resolve, reject) => {
    let checkNodeVersion = 'node -v'
    let handleNodeVersion = (error, stdout, stderr) => {
      if (error) {
        reject(error)
      } else {
        if(stdout.includes('v13')) {
          resolve(true)
        } else {
          reject(false) // exception
        }
      }
    }
    try {
      const isNode13 = execSync(checkNodeVersion, handleNodeVersion)
      isNode13 ? resolve(isNode13) : reject(isNode13)
    } catch(err) {
      reject(err)
    }
  })
}