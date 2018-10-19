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
        console.log(doc1);
        collection1.find({},{},function(e,docs1){
            doc2 = docs1;
            console.log(doc2);
            callresponse();
        });
     });

    console.log("doc1" + doc1);
    function callresponse() {
       res.render('userlist', {            "userlist" : doc1, "adlist" : doc2        });
    }
});

/* GET New User page. */
router.get('/newuser', function(req, res) {
    res.render('newuser', { title: 'Add New User' });
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

module.exports = router;