## nats-exp-02 ##

Experiment with NATS.io in Front of LevelDB with Node.js Promises

  * NATS.io used as message bus
  * LevelDB as key/value data store
  * Node.js v6.0.0 using Promises
  * Monitor using NATS.io > wildcard

Anticipates

  * Microservices on IoT device
  * Running in Docker containers on Raspberry Pi
  * LevelDB for IoT device configuration data
  * Message bus instead of point-to-point IPC
  * Monitor all microservice communication on message bus

### Run ###

Start NATS.io server:

    [jfathman@cloud dnld]$ ./gnatsd -a localhost
    [13859] 2016/05/01 08:03:20.071902 [INF] Starting gnatsd version 0.7.2
    [13859] 2016/05/01 08:03:20.072909 [INF] Listening for client connections on localhost:4222
    [13859] 2016/05/01 08:03:20.073404 [INF] gnatsd is ready

Start monitor:

    [jfathman@cloud nats-exp-02]$ ./monitor.js 

Run app:

    [jfathman@cloud nats-exp-02]$ ./app.js 
    2016-05-01 10:05:52.539 startup
    2016-05-01 10:05:52.608 db.open: ./mydb
    2016-05-01 10:05:52.611 tx: { subject: 'db', id: 0, cmd: 'put', key: 'key1', val: 'val1' }
    2016-05-01 10:05:52.655 rx: {"subject":"db","id":0,"err":null}
    2016-05-01 10:05:52.656 tx: { subject: 'db', id: 1, cmd: 'get', key: 'key1' }
    2016-05-01 10:05:52.659 rx: {"subject":"db","id":1,"val":"val1","err":null}
    2016-05-01 10:05:52.660 tx: { subject: 'db', id: 2, cmd: 'del', key: 'key1' }
    2016-05-01 10:05:52.667 rx: {"subject":"db","id":2,"err":null}
    2016-05-01 10:05:52.667 tx: { subject: 'db', id: 3, cmd: 'get', key: 'key1' }
    2016-05-01 10:05:52.671 rx: {"subject":"db","id":3,"val":null,"err":"NotFoundError: Key not found in database [key1]"}
    2016-05-01 10:05:52.676 db.close: ./mydb
    2016-05-01 10:05:52.683 shutdown

Observe monitor output:

    [jfathman@cloud nats-exp-02]$ ./monitor.js 
    2016-05-01 10:05:52.652 [req]: {"subject":"db","id":0,"cmd":"put","key":"key1","val":"val1"}
    2016-05-01 10:05:52.674 [res]: {"subject":"db","id":0,"err":null}
    2016-05-01 10:05:52.677 [req]: {"subject":"db","id":1,"cmd":"get","key":"key1"}
    2016-05-01 10:05:52.680 [res]: {"subject":"db","id":1,"val":"val1","err":null}
    2016-05-01 10:05:52.680 [req]: {"subject":"db","id":2,"cmd":"del","key":"key1"}
    2016-05-01 10:05:52.680 [res]: {"subject":"db","id":2,"err":null}
    2016-05-01 10:05:52.681 [req]: {"subject":"db","id":3,"cmd":"get","key":"key1"}
    2016-05-01 10:05:52.681 [res]: {"subject":"db","id":3,"val":null,"err":"NotFoundError: Key not found in database [key1]"}


