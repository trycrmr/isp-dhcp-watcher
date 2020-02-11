import http from 'http'

const IP4_REGEX = '^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$' // https://stackoverflow.com/a/25969006/5935694

const checkPublicIP = (url, options) => {
  return new Promise((resolve, reject) => {
    http.get(url, options)
    .on('error', err => reject(err))
    .on('timeout', () => { reject(`Network request timed out after ${options.timeout}ms`) })
    .on('response', (thisResponse) => {
      if(thisResponse instanceof Error)
        reject(thisResponse)
      if(thisResponse.statusCode !== 200)
        reject(thisResponse) // Handled as exception? Network request happened, but it wasn't successful (kind of, not sure how 300s are handled here.)
    
      let rawData = ''
      // thisResponse  = !options.timeout ? thisResponse : thisResponse.on('setTimeout', (options.timeout, () => { reject(`Network request timed out after ${options.timeout}ms`)}))
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
  })
}

export default checkPublicIP