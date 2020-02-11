# isp-dhcp-watcher
Watches for changes to the public IP of your network by your ISP, and, optionally, updates a DNS record. 

Written in Node.js because I'm honing my Node.js right now. With that said, going to try to pull in as few dependencies as possible. Not worried about backwards compatibility and working with Node 13.


TODOs

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