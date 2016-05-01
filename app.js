#! /usr/bin/env node

// app.js

'use strict';

var levelup = require('levelup');
var moment = require('moment');
var nats = require('nats');

var db = null;
var dbname = './mydb';

var msgId = 0;

Promise.resolve()
    .then(logStartup)
    .then(natsConnect)
    .then(dbOpen)
    .then(natsSubscribe)
    .then(dbPut)
    .then(dbGet)
    .then(dbDelete)
    .then(dbGet)
    .then(dbClose)
    .then(natsClose)
    .then(logShutdown)
    .catch((err) => {
        console.log(timestamp(), 'Error:', err);
        setTimeout(function () {
            process.exit(1);
        }, 100);
    });

function logStartup() {
    console.log(timestamp(), 'startup');
}

function logShutdown() {
    console.log(timestamp(), 'shutdown');
}

function natsConnect() {
    return new Promise(function (resolve, reject) {
        void reject;
        nats = nats.connect();
        nats.on('error', function (err) {
            console.log(timestamp(), err);
        });
        resolve();
    });
}

function natsClose() {
    return new Promise(function (resolve, reject) {
        void reject;
        nats.close();
        resolve();
    });
}

function dbOpen() {
    return new Promise(function (resolve, reject) {
        db = levelup(dbname, {}, function (err) {
            if (err) {
                reject(err);
            } else {
                console.log(timestamp(), 'db.open:', dbname);
                resolve();
            }
        });
    });
}

function dbClose() {
    return new Promise(function (resolve, reject) {
        db.close(function (err) {
            if (err) {
                reject(err);
            } else {
                console.log(timestamp(), 'db.close:', dbname);
                resolve();
            }
        });
    });
}

function natsSubscribe() {
    return new Promise(function (resolve, reject) {
        void reject;
        nats.subscribe('db', function (msg, reply) {
            var req = JSON.parse(msg);
            switch (req.cmd) {
                case 'put':
                    db.put(req.key, req.val, function (err) {
                        var res = {
                            'subject': req.subject,
                            'id':      req.id,
                            'err':     err ? err.toString() : null
                        };
                        nats.publish(reply, JSON.stringify(res));
                    });
                    break;
                case 'get':
                    db.get(req.key, function (err, val) {
                        var res = {
                            'subject': req.subject,
                            'id':      req.id,
                            'val':     val ? val : null,
                            'err':     err ? err.toString() : null
                        };
                        nats.publish(reply, JSON.stringify(res));
                    });
                    break;
                case 'del':
                    db.del(req.key, function (err) {
                        var res = {
                            'subject': req.subject,
                            'id':      req.id,
                            'err':     err ? err.toString() : null
                        };
                        nats.publish(reply, JSON.stringify(res));
                    });
                    break;
                default:
                    var res = {'err': 'invalid request'};
                    nats.publish(reply, JSON.stringify(res));
                    break;
            }
        });
        resolve();
    });
}

function dbPut() {
    return new Promise(function (resolve, reject) {
        void reject;
        var msgObject = {'subject': 'db', 'id': msgId++, 'cmd': 'put', 'key': 'key1', 'val': 'val1'};
        var msgString = JSON.stringify(msgObject);
        console.log(timestamp(), 'tx:', msgObject);
        nats.request(msgObject.subject, msgString, function (reply) {
            console.log(timestamp(), 'rx:', reply);
            resolve();
        });
    });
}

function dbGet() {
    return new Promise(function (resolve, reject) {
        void reject;
        var msgObject = {'subject': 'db', 'id': msgId++, 'cmd': 'get', 'key': 'key1'};
        var msgString = JSON.stringify(msgObject);
        console.log(timestamp(), 'tx:', msgObject);
        nats.request(msgObject.subject, msgString, function (reply) {
            console.log(timestamp(), 'rx:', reply);
            resolve();
        });
    });
}

function dbDelete() {
    return new Promise(function (resolve, reject) {
        void reject;
        var msgObject = {'subject': 'db', 'id': msgId++, 'cmd': 'del', 'key': 'key1'};
        var msgString = JSON.stringify(msgObject);
        console.log(timestamp(), 'tx:', msgObject);
        nats.request(msgObject.subject, msgString, function (reply) {
            console.log(timestamp(), 'rx:', reply);
            resolve();
        });
    });
}

function timestamp() {
    return moment().format('YYYY-MM-DD HH:mm:ss.SSS');
}
