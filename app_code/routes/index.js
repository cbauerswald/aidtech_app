var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  if (req.query.setReminder && req.query.setReminder == "success") {
    res.render('index', {"message": "Your reminder was set successfully!"});
  } else if (req.query.setReminder && req.query.setReminder == "failed"){
    res.render('index', {"message": "There was a problem setting your reminder."});
  } else {
    res.render('index');
  }
  
});

module.exports = router;
