var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');


var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

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
    rating: Number
})

restaurantSchema.plugin(mongoosePaginate);

var Restaurant = mongoose.model("Restaurant", restaurantSchema);



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


for(var i = 0; i < zipCodes.length; i++) {
    console.log("Completed " + (i + 1) + "of " + zipCodes.length);
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
        if(error) {
            console.log(error);
        }
        else {
            var restaurants = fourData.response.groups[0].items;
            for(var j = 0; j < restaurants.length; j++) {
                var entry = restaurants[j];
                var address = "Unknown";
                if(entry.location) {
                    if(entry.location.address)
                        address = entry.location.address;
                }
                var restaurant = new Restaurant({
                    name: entry.name,
                    zip: entry.postalCode,
                    address: address,
                    rating: entry.rating,
                    type: "FourSquare"
                });
                restaurant.save(function(err) {
                    if(err) {
                        console.log(err);
                    }
                });
            }
        }
    });

    yelp.search({term: "food", location: "San Diego, CA", limit: 20}, function(error, yelpData) {
        if(error) {
            console.log(error);
        }
        else {
            var restaurants = yelpData.businesses;
            for(var j = 0; j < restaurants.length; j++) {
                var entry = restaurants[j];
                var restaurant = new Restaurant({
                    name: entry.name,
                    zip: entry.location.postal_code,
                    address: entry.location.address[0],
                    rating: entry.rating * 2,
                    type: "Yelp"
                });
                restaurant.save(function(err) {
                    if(err) {
                        console.log(err);
                    }
                })  
            }
        }
    });
}

console.log("Ready");


app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

app.Restaurant = Restaurant;

module.exports = app;
