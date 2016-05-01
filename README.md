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

Inspect resulting LevelDB database files:

    [jfathman@cloud nats-exp-02]$ ls -ltr mydb/
    -rw-r--r-- 1 jfathman jfathman  0 May  1 10:16 LOCK
    -rw-r--r-- 1 jfathman jfathman 50 May  1 10:16 MANIFEST-000002
    -rw-r--r-- 1 jfathman jfathman 16 May  1 10:16 CURRENT
    -rw-r--r-- 1 jfathman jfathman 57 May  1 10:16 LOG
    -rw-r--r-- 1 jfathman jfathman 55 May  1 10:16 000003.log


    [jfathman@cloud nats-exp-02]$ hexdump -C mydb/MANIFEST-000002 
    00000000  56 f9 b8 f8 1c 00 01 01  1a 6c 65 76 65 6c 64 62  |V........leveldb|
    00000010  2e 42 79 74 65 77 69 73  65 43 6f 6d 70 61 72 61  |.BytewiseCompara|
    00000020  74 6f 72 a4 9c 8b be 08  00 01 02 03 09 00 03 04  |tor.............|
    00000030  04 00                                             |..|
    00000032


    [jfathman@cloud nats-exp-02]$ hexdump -C mydb/CURRENT 
    00000000  4d 41 4e 49 46 45 53 54  2d 30 30 30 30 30 32 0a  |MANIFEST-000002.|
    00000010


    [jfathman@cloud nats-exp-02]$ cat mydb/LOG 
    2016/05/01-10:16:47.039565 7fbb0b7fe700 Delete type=3 #1


    [jfathman@cloud nats-exp-02]$ hexdump -C mydb/000003.log 
    00000000  da fd 29 a4 17 00 01 01  00 00 00 00 00 00 00 01  |..).............|
    00000010  00 00 00 01 04 6b 65 79  31 04 76 61 6c 31 82 69  |.....key1.val1.i|
    00000020  b5 38 12 00 01 02 00 00  00 00 00 00 00 01 00 00  |.8..............|
    00000030  00 00 04 6b 65 79 31                              |...key1|
    00000037

