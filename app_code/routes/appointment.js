var express = require('express');
var router = express.Router();
var Agenda = require('agenda');
var database = require('../config/db.js');
var winston=require('../app').winstonLogger;

var tz_string_to_offset = {
  'America/New_York': -4,
  'Etc/GMT': 0,
  'America/Los_Angeles': -8,
  'America/Chicago': -6,
  'Europe/Amsterdam': +1,
  'Africa/Cairo': +2, 
  'Asia/Hong_Kong': +8,
  'Australia/Brisbane': +10,
  'Pacific/Tongatapu': +13

}


router.post('/', function(req, res, next) {

  //retreive time, name, and timezone from post data
  var time = new Date(req.body.when);
  var name = req.body.event;
  var timezone = req.body.timezone;

  //very simple check if data is valid
  if (time=="" || name=="" || !(timezone in tz_string_to_offset)) {
    res.redirect("/?setReminder=failed");
  }

  // set up reminder times in GMT but keep display time for user in their local timezone
  var eventTimeInTimeZone = new Date(req.body.when);
  var displayTime = eventTimeInTimeZone.toLocaleString() + ", Timezone: " + req.body.timezone;
  var timezoneOffset = tz_string_to_offset[timezone];
  time.setHours(time.getHours() - timezoneOffset);

  async function run() {

    var agenda = new Agenda({db: {address: database.bitnami.url}});

    // define jobs to be scheduled
    agenda.define('event reminder', function(job) {
      var data = job.attrs.data;
      winston.info("REMINDER: " + data.name + " at " + data.time);
    });

    agenda.define('event happening', function(job) {
      var data = job.attrs.data;
      winston.info("HAPPENING NOW: " + data.name + " (scheduled for: " + data.time + ")");
    });

    //set events 
    agenda.on('error', function(err) {
      console.log("AGENDA ERR: ", err);
    });

    agenda.on('ready', function() {
      eventData = {name: name, time: displayTime}
      agenda.now('event reminder', eventData);
      agenda.schedule(time, 'event happening', eventData);
      agenda.start();
    });

    // graceful exit 
    function graceful() {
      agenda.stop(function() {
        process.exit(0);
      });
    }

    process.on('SIGTERM', graceful);
    process.on('SIGINT' , graceful);
  }

  run().catch(error => {
    console.error(error);
    process.exit(-1);
  });

  res.redirect("/?setReminder=success");
});



module.exports = router;
