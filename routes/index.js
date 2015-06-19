var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var CombinedRestaurant = mongoose.model('CombinedRestaurant');


/* GET home page. */
router.get('/', function(req, res) {
	console.log(CombinedRestaurant);
	var page = 1;
	var limit = 10;
	if(req.query.page)
		page = req.query.page;
	if(req.query.limit)
		limit = req.query.limit;
	CombinedRestaurant.paginate({}, page, limit, function(error, pageCount, paginatedResults, itemCount) {
	  if (error) {
	    console.error(error);
	  } else {
	    console.log('Pages:', pageCount);
	    console.log(paginatedResults);
	    res.render('index', { pageCount: pageCount, results: paginatedResults, itemCount: itemCount});
	  }
	});
});

module.exports = router;
