It is a service to solve the issue that when using php or simular language to send large amount of push notification or email, it takes time. So setting a medium to handle the time consuming process is critical.

This service is a running code in production, but still much to do.


##### File Structure

cert/ 				is where to put the certificate file,
					currently the dependency package used to apn can not support single file 	cert.

logs/ 				will created when debug is on

example.config.js 	the configuration file


###### How to use it

mv example.config.js config.js
vi config.js # make your own adjustment
node messenger.js # or start by anything you used to keep your service continous running. I use pm2.


###### Todo

The service is currently built on top of express, and I'm planning to move it on to of a more solid framework.


###### Contributer
Willy and Kyle