var express = require('express');
var router = express.Router();
var Restaurant = require('./app.js');



/* GET home page. */
router.get('/', function(req, res) {
	console.log(Restaurant);
	Restaurant.paginate({}, 1, 10, function(error, pageCount, paginatedResults, itemCount) {
	  if (error) {
	    console.error(error);
	  } else {
	    console.log('Pages:', pageCount);
	    console.log(paginatedResults);
	    res.render('index', { count: pageCount, results: paginatedResults});
	  }
	});
});

module.exports = router;
