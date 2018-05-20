var express = require('express');
var router = express.Router();
var Agenda = require('agenda');
var logger = require('winston');

/* GET users listing. */
router.post('/', function(req, res, next) {

  var time = req.body.when;
  var name = req.body.event;

  async function run() {
    var agenda = new Agenda({db: {address: 'mongodb://localhost:27017/aidtech'}});
    
    agenda.define('event reminder', function(job) {
      var data = job.attrs.data;
      var date =  new Date(data.time);
      logger.info("REMINDER: " + data.name + " at " + date.toUTCString());
    });

    agenda.define('event happening', function(job) {
      var data = job.attrs.data;
      var date =  new Date(data.time);
      logger.info("HAPPENING NOW: " + data.name + " (scheduled for: " + date.toUTCString() + ")");
    });

    agenda.on('error', function(err) {
      console.log("AGENDA ERR: ", err);
    });

    agenda.on('ready', function() {
      eventData = {name: name, time: time}
      agenda.schedule(time, 'event happening', eventData);
      agenda.now('event reminder', eventData);
      agenda.start();
    });

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
});



module.exports = router;
