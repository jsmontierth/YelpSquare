var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');

mongoose.connect('mongodb://localhost/test');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function(callback) {
    console.log("Yay!");
});

var restaurantSchema = mongoose.Schema({
    name: String,
    zip: String,
    address: String,
    type: String
})

restaurantSchema.plugin(mongoosePaginate);

var Restaurant = mongoose.model("Restaurant", restaurantSchema);

var combinedRestSchema = mongoose.Schema({
    name: String,
    zip: String,
    address: String,
    type: String
});

combinedRestSchema.plugin(mongoosePaginate);

var CombinedRestaurant = mongoose.model("CombinedRestaurant", combinedRestSchema);


Restaurant.find({}, function(err, docs) {
	if(err) {
		console.log(err);
	}
	else {
		docs.forEach(function(doc) { doc.remove(); });
		var fourClientId = 'DAZRZTKXDJ5DDUD0JLNTR14CKKYP5J5EJG452FLYWV5MSWX3';
		var fourSecret = 'HHBUQZMCATAIY1PDBJOQTFA4XEGYUW24E1W2UVUQQ5RKARJN';
		var foursquare = require('node-foursquare-venues')(fourClientId, fourSecret);
		var yelpKey = 'EyZvW48djBH3VCPoIhMhzw';
		var yelpSecret = 'M_1QU8XTME6eBCN9FwSr-zYcg-U';
		var yelpToken = 'Eir3V-OrYiJoUv_2be61ci1z_h6PQ8m-';
		var yelpTokenSecret = 'nJ7WXUPkmw6-Pmbz5okLARg-t2w';
		var yelp = require("yelp").createClient({
		  consumer_key: yelpKey, 
		  consumer_secret: yelpSecret,
		  token: yelpToken,
		  token_secret: yelpTokenSecret
		});






		var zipCodes = ['91901', '91902', '91903', '91905', '91906', '91908', '91909',
		'91910', '91911', '91912', '91913', '91914', '91915', '91916', '91917',
		'91921',
		'91931', '91932', '91933', '91934', '91935',
		'91941', '91942', '91943', '91944', '91945', '91946', '91948',
		'91950', '91951',
		'91962', '91963',
		'91976', '91977', '91978', '91979',
		'91980', '91987',
		'92003', '92004', '92007', '92008', '92009',
		'92010', '92011', '92013', '92014', '92018', '92019',
		'92020', '92021', '92022', '92023', '92024', '92025', '92026', '92027', '92028', '92029',
		'92030', '92033', '92036', '92037', '92038', '92039',
		'92040', '92046', '92049',
		'92051', '92052', '92054', '92055', '92056', '92057', '92058', '92059',
		'92060', '92061', '92064', '92065', '92066', '92067', '92068', '92069',
		'92070', '92071', '92072', '92074', '92075', '92078', '92079',
		'92081', '92082', '92083', '92084', '92085', '92086', '92088',
		'92091', '92092', '92093', '92096',
		'92101', '92102', '92103', '92104', '92105', '92106', '92107', '92108', '92109',
		'92110', '92111', '92112', '92113', '92114', '92115', '92116', '92117', '92118', '92119',
		'92120', '92121', '92122', '92123', '92124', '92126', '92127', '92128', '92129',
		'92130', '92131', '92132', '92134', '92135', '92136', '92137', '92138', '92139',
		'92140', '92142', '92143', '92145', '92147', '92149',
		'92150', '92152', '92153', '92154', '92155', '92158', '92159',
		'92160', '92161', '92163', '92165', '92166', '92167', '92168', '92169',
		'92170', '92171', '92172', '92173', '92174', '92175', '92176', '92177', '92178', '92179',
		'92182', '92186', '92187', 
		'92190', '92191', '92192', '92193', '92195', '92196', '92197', '92198', '92199'];

		var completedYelp = 0;
		var completedFour = 0;

		var yelpRests = {};
		var fourRests = {};

		for(var i = 0; i < zipCodes.length; i++) {
		    var zip = zipCodes[i];
		    var fourSearchObj = {
		        near: zip,
		        section: 'food',
		        limit: 20
		    };
		    var yelpSearchObj = {
		        term: 'food',
		        location: zip,
		        limit: 20
		    };
		    foursquare.venues.explore(fourSearchObj, function(error, fourData) {
		    	completedFour++;
		    	console.log("Completed " + completedFour + " out of " + (zipCodes.length) + " FourSquare requests");
		        if(error) {
		            console.log(error);
		        }
		        else {
		            var restaurants = fourData.response.groups[0].items;
		            for(var j = 0; j < restaurants.length; j++) {
		                var entry = restaurants[j].venue;
		                if(fourRests.hasOwnProperty(entry.name))
		                	continue;
		                else
		                	fourRests[entry.name] = true;
		                var address = "Unknown";
		                if(entry.location) {
		                    if(entry.location.address)
		                        address = entry.location.address;
		                }
		                var restaurant = new Restaurant({
		                    name: entry.name,
		                    zip: entry.postalCode,
		                    address: address,
		                    type: "FourSquare"
		                });
		                restaurant.save(function(err) {
		                    if(err) {
		                        console.log(err);
		                    }
		                });
		            }
		        }
		        if(completedYelp == zipCodes.length && completedFour == zipCodes.length) {
		        	createCombinedCollection();
		        }
		    });

		    yelp.search({term: "food", location: "San Diego, CA", limit: 20}, function(error, yelpData) {
		        completedYelp++;
		        console.log("Completed " + completedYelp + " out of " + (zipCodes.length) + " Yelp requests");
		        if(error) {
		            console.log(error);
		        }
		        else {
		            var restaurants = yelpData.businesses;
		            for(var j = 0; j < restaurants.length; j++) {
		                var entry = restaurants[j];
		                if(yelpRests.hasOwnProperty(entry.name))
		                	continue;
		                else
		                	yelpRests[entry.name] = true;
		                var restaurant = new Restaurant({
		                    name: entry.name,
		                    zip: entry.location.postal_code,
		                    address: entry.location.address[0],
		                    type: "Yelp"
		                });
		                restaurant.save(function(err) {
		                    if(err) {
		                        console.log(err);
		                    }
		                });  
		            }
		        }
		        if(completedYelp == zipCodes.length && completedFour == zipCodes.length) {
			        createCombinedCollection();
			    }
		                    

		    }); 	
		}
	}
	
});
		
function createCombinedCollection() {
	var restsChecked = 0;

	CombinedRestaurant.find({}, function(err, docs) {
	if(err) {
		console.log(err);
	}
	else {
		docs.forEach(function(doc) { doc.remove(); });

		Restaurant.find(function(err, restaurants) {
			if(err) 
				console.log(err);
			else {
				//var rests = {};
				var finishedRestaurants = 0;
				for(var i = 0; i < restaurants.length; i++) {
					var restaurant = restaurants[i];
					//console.log(restaurant.name);
					//console.log(rests);
					/*
					if(rests.hasOwnProperty(restaurant.name))
						continue;
					else
						rests[restaurant.name] = true;*/
					var type = restaurant.type;
					var otherType = "";
					if(type == "Yelp")
						otherType = "FourSquare";
					else
						otherType = "Yelp";
					Restaurant.find({"name": restaurant.name, "type": otherType }, function(err, results) {
						if(err)
							console.log(err);
						else {
							if(results.length > 0) {
								//console.log(results);
								var combined = new CombinedRestaurant({
									name: results[0].name,
				                    zip: results[0].zip,
				                    address: results[0].address,
				                    type: "Combined"
								});
								combined.save(function(err) {
									if(err) console.log(err);
								});
							}
						}
					});
				}
			}

		});
	}
});
	console.log("Ready");
}


module.exports = db;