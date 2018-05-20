var express = require('express');
var router = express.Router();
var request = require('request');

router.get('/', function(req, res, next) {
  var event = new Date('May 13, 2018 17:11:00 UTC+1');

  var jsonDate = event.toJSON();

  postData = {
    when: jsonDate,
    event: "Birthday Party!"
  }
  request({
    uri: "http://localhost:3000/appointment",
    body: JSON.stringify(postData),
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    }
  },
  function (error, response) {
    console.log(error,response);
    return;
  });
});

module.exports = router;
