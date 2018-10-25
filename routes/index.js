var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
    res.render('index', { title: 'Express' });
});

/* GET Hello World page. */
router.get('/helloworld', function(req, res) {
	res.render('helloworld', { title: 'Hello, World!' })
});

/* GET Userlist page. */
router.get('/userlist', function(req, res) {
    var db = req.db;
    var doc1 = [];
    var collection = db.get('usercollection');
    var doc2 = [];
    var collection1 = db.get('adcollection');
    collection.find({},{},function(e,docs){
       doc1 = docs;
       // console.log(doc1);
        collection1.find({},{},function(e,docs1){
            doc2 = docs1;
         //   console.log(doc2);
            callresponse();
        });
     });

   // console.log("doc1" + doc1);
    function callresponse() {
       res.render('userlist', {            "userlist" : doc1, "adlist" : doc2        });
    }
});

/* GET New User page. */
router.get('/newuser', function(req, res) {
    res.render('newuser', { title: 'Add New User' });
});

router.get('/newad', function(req, res) {
    var db = req.db;
    var doc1 = [];
    var collection = db.get('usercollection');
    var doc2 = [];
    var collection1 = db.get('adcollection');
    collection.find({},{},function(e,docs){
       doc1 = docs;
       // console.log(doc1);
        collection1.find({},{},function(e,docs1){
            doc2 = docs1;
            console.log(doc2);
            callresponse();
        });
     });

    //console.log("doc1" + doc1);
    function callresponse() {
    res.render('newad', { title: 'Add New AD', "userlist" : doc1, "adlist" : doc2 });

//       res.render('userlist', {            "userlist" : doc1, "adlist" : doc2        });
    }

});


/* POST to Add User Service */
router.post('/adduser', function(req, res) {

    // Set our internal DB variable
    var db = req.db;

    // Get our form values. These rely on the "name" attributes
    var userName = req.body.username;
    var userEmail = req.body.useremail;
    var userStart = req.body.userstart;
    var userEnd = req.body.userend;
    var userOneoff = req.body.useroneoff;
    var userPhone = req.body.userphone;

    // Set our collection
    var collection = db.get('usercollection');

    // Submit to the DB
    collection.insert({
        "username" : userName,
        "email" : userEmail,
        "start" : userStart,
        "end" : userEnd,
        "oneoff" : userOneoff,
        "phone" : userPhone
    }, function (err, doc) {
        if (err) {
            // If it failed, return error
            res.send("There was a problem adding the information to the database.");
        }
        else {
            // If it worked, set the header so the address bar doesn't still say /adduser
            //res.location("userlist");
            // And forward to success page
            res.redirect("userlist");
        }
    });
});

/* POST to Add User Service */
router.post('/addad', function(req, res) {

    // Set our internal DB variable
    var db = req.db;

    // Get our form values. These rely on the "name" attributes
    var userName = req.body.user.split("AAAAA", 2);
    var userAd = req.body.ad.split("AAAAA",2);
    var userStart = new Date(req.body.userstart);
    var userEnd = new Date(req.body.userend);
    var userOneoff = req.body.useroneoff;
    var userAlt = req.body.useralternate;
    var userOneoffDone = '';
    var userAltStart = '';
    // Set our collection
    console.log("useroneoff   "+ userOneoff);
    console.log("userAlt    "+userAlt);
    if(userOneoff == "on")
        userOneoffDone = getWeek(userStart);
    else   
        userOneoff = "off";
        
    if (userAlt == "on")
         userAltStart =getWeek(userStart)%2;
    else
        userAlt = "off";
    
    var collection = db.get('pubcollection');

    // Submit to the DB
    collection.insert({
        "userid" : userName[0],
        "username" : userName[1],        
        "adid" : userAd[0],
        "addesc" : userAd[1],
        "start": userStart,
        "end": userEnd,
        "oneoff": userOneoff,
        "alternate": userAlt,
        "oneoffdone": userOneoffDone,
        "altstart": userAltStart
    }, function (err, doc) {
        if (err) {
            // If it failed, return error
            res.send("There was a problem adding the information to the database.");
        }
        else {
            // If it worked, set the header so the address bar doesn't still say /adduser
            //res.location("userlist");
            // And forward to success page
            res.redirect("newad");
        }
    });
});

// Returns the ISO week of the date.
function getWeek (userStart) {
  var date = new Date (userStart);
  date.setHours(0, 0, 0, 0);
  // Thursday in current week decides the year.
  date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
  // January 4 is always in week 1.
  var week1 = new Date(date.getFullYear(), 0, 4);
  // Adjust to Thursday in week 1 and count number of weeks from date to week1.
  return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000
                        - 3 + (week1.getDay() + 6) % 7) / 7);
}


router.get('/weeklyad', function(req, res) {
    var db = req.db;
    var doc1 = [];
    var collection = db.get('usercollection');
    var doc2 = [];
    var collection1 = db.get('adcollection');
    var doc3 = [];
    var collection2 = db.get('pubcollection');
    collection.find({},{},function(e,docs){
       doc1 = docs;
        collection1.find({},{},function(e,docs1){
            doc2 = docs1;
            var wk = Number(getWeek(new Date()));
            var wkoddeven = Number(wk % 2);
            console.log("Week" + wk);
            collection2.find(
                {$or:[
                    { $and: [ {start : { $lte : new Date()}} ,{end : { $gte : new Date()}}, {oneoff :{ $ne : "on"}},{alternate :{ $ne : "on"}}  ] },
                    { $and: [  {oneoff :{ $eq : "on"}},{oneoffdone :{ $eq : Number(getWeek(new Date())) }} ] },
                    { $and: [ {end : { $gte : new Date()}}, {alternate :{ $eq : "on"}},{ altstart :{ $eq : Number((getWeek(new Date()))%2)}} ] }
                ]}
               /*$and: [ {start : { $lte : new Date()}} ,{end : { $gte : new Date()}}, {oneoff :{ $eq : "on" }}, {oneoffdone : { $eq : Number(getWeek(new Date())) }} ] }*/
                ,{},function(e,docs2){
                doc3 = docs2;
                //console.log(doc3);
                callresponse();
            });
        });
     });

    function callresponse() {
//    res.render('userlist');

       res.render('adlist', {            "userlist" : doc1, "adlist" : doc2, 'publist': doc3, 'week': getWeek(new Date())        });
    }

});


module.exports = router;