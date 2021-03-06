var express = require('express');
var nodemailer = require('nodemailer');
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
    console.log("USER " + req.body.user);
    var userName = req.body.user.split("AAAAA", 3);
    console.log("USERNAME " + userName);
    var userAd = req.body.ad.split("AAAAA",2);
    var userStart = new Date(req.body.userstart);
    var userEnd = new Date(req.body.userend);
    var userOneoff = req.body.useroneoff;
    var userAlt = req.body.useralternate;
    var userOneoffDone = '';
    var userAltStart = '';
    var reminder ='';
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
        "useremail" : userName[2],
        "adid" : userAd[0],
        "addesc" : userAd[1],
        "start": userStart,
        "end": userEnd,
        "oneoff": userOneoff,
        "alternate": userAlt,
        "oneoffdone": userOneoffDone,
        "altstart": userAltStart,
        "reminder": reminder
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

function getNextDayOfWeek(date, dayOfWeek) {
    // Code to check that date and dayOfWeek are valid left as an exercise ;)
   var resultDate = new Date(date.getTime());
    resultDate.setDate(date.getDate() + (7 + dayOfWeek - date.getDay()) % 7);
    return resultDate;
}

router.get('/weeklyad/:id', function(req, res) {
    console.log("ID = " + req.params.id);
    var id = req.params.id;
    var wk = Number(getWeek(new Date())) + +id;
    var iss = 194 + wk;

    var wk1 = getNextDayOfWeek(new Date(), 5);
    var wk11;
    wk11 =   wk1.getDate()+'/' + (wk1.getMonth()+1) + '/'+wk1.getFullYear();

    if (id === undefined)
        id =0;
    var db = req.db;
    var doc1 = [];
    var collection = db.get('usercollection');
    var doc2 = [];
    var collection1 = db.get('adcollection');
    var doc3 = [];
    var collection2 = db.get('pubcollection');
    
    /*collection2.aggregate([
            { "$addFields": {
                "start": {
                    "$toDate": "$start"
                }
            } }
        ]);*/
    
    /*collection2.update({
        query: { oneoff: "off" },
        update: { $set :{"end":el.end, "start":el.start }},
        upsert: true
    });
    collection2.find({},{},function(e,el){
            el.start = new Date(el.start);
            el.end = new Date(el.end);
            collection2.update(
                {"_id":el.id},{ $set :{"end":el.end, "start":el.start}
            }, function (err, doc) {
                if (err) {
                    // If it failed, return error
                    res.send("There was a problem adding the information to the database.");
                }
                else {
                    // If it worked, set the header so the address bar doesn't still say /adduser
                    //res.location("userlist");
                    // And forward to success page
                    res.redirect("weeklyad/0");
                }
            });

    }); */
    collection.find({},{},function(e,docs){
       doc1 = docs;
        collection1.find({},{},function(e,docs1){
            doc2 = docs1;
            var wkoddeven = Number(wk % 2);
            console.log("Week" + wk);
            collection2.find(
                {$or:[
                    { $and: [ {start : { $lte : new Date()}} ,{end : { $gte : new Date()}}, {oneoff :{ $ne : "on"}},{alternate :{ $ne : "on"}}  ] },
                    { $and: [  {oneoff :{ $eq : "on"}},{oneoffdone :{ $eq : Number(getWeek(new Date())+ +id) }} ] },
                    { $and: [ {end : { $gte : new Date()}}, {alternate :{ $eq : "on"}},{ altstart :{ $eq : (Number((getWeek(new Date())+ +id))%2)}} ] }
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
       //console.log(doc3);
       var date;
        for(var i=0; i<doc3.length; i++){
            console.log ( "i =="+ i+ "    o=" + new Date(doc3[i].end) + "     n=" + (new Date() + 36000000000) + "        " + (new Date(doc3[i].end) - new Date()) );
            if ((new Date(doc3[i].end) - (new Date()) < 599220582 * 1.9) || ( doc3.alternate == 'yes' && (new Date(doc3[i].end) - (new Date()) < 599220582 * 2.9)))
                doc3[i].reminder = 'Y';
            else
                doc3[i].reminder = 'N';
            date = doc3[i].end;
            doc3[i].end =   date.getDate()+'/' + (date.getMonth()+1) + '/'+date.getFullYear();
            date = doc3[i].start;
            doc3[i].start =   date.getDate()+'/' + (date.getMonth()+1) + '/'+date.getFullYear();
        }
       
       res.render('adlist', {            "userlist" : doc1, "adlist" : doc2, 'publist': doc3, 'week': wk, 'wk11': wk11, 'iss': iss      });
    }

});



router.get('/sendmail/:id/:email', function(req, res) {
    //res.render('index', { title: 'Express' });
    console.log("ID = " + req.params.id);
    console.log("Email = " + req.params.email);
    var email = req.params.email;
    var id = req.params.id;
    /*var transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'bhbhbh2002.one@gmail.com',
        pass: 'xxx'
      }
    });*/
    
    const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'lav6hmaqow52elb3@ethereal.email',
        pass: 'Dy9ca4xqebn6ajT2uT'
    }
    });
    
    var mailOptions = {
      from: 'info@gujweekly.com',
      to: email,
      subject: 'Weekly Ad Reminder',
      text: 'Hello '+ id +', good afternoon! If you have any changes in your ad for this weeks issue of Gujarat Weekly, kindly send it to us by WEDNESDAY MORNING at the LATEST. Any ad changes received after Wednesday morning will appear in next weeks issue.  If you have no changes in your ad, please kindly disregard this email. Thank you for your understanding. Have a great week!'
    };
    
    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
    res.redirect("/weeklyad/0");

});

router.get('/updad/:id', function(req, res) {
    //res.render('index', { title: 'Express' });
    console.log("ID = " + req.params.id);
    var id = req.params.id;

    if (id === undefined)
        id =0;
    var db = req.db;
    var doc1 = [];
    var doc2 = [];
    var collection = db.get('pubcollection');
        collection.find({_id: id},{},function(e,docs){
            doc1 = docs;
            });
    var collection1 = db.get('adcollection');
        collection.find({},{},function(e,docs){
            doc2 = docs;
            });
            res.render('updatead', {            'publist': doc1, 'adlist': doc2     });


});

/* Updating Ad */
router.post('/updatead1', function(req, res) {

    // Set our internal DB variable
    var db = req.db;

    // Get our form values. These rely on the "name" attributes
    console.log("USER " + req.body.id);
    var userEnd = new Date(req.body.userend);
    var id = req.body.id;
    // Set our collection

    var collection = db.get('pubcollection');

    // Submit to the DB
    collection.update(
        {"_id":id},{ $set :{"end":userEnd}
    }, function (err, doc) {
        if (err) {
            // If it failed, return error
            res.send("There was a problem adding the information to the database.");
        }
        else {
            // If it worked, set the header so the address bar doesn't still say /adduser
            //res.location("userlist");
            // And forward to success page
            res.redirect("weeklyad/0");
        }
    });
});

module.exports = router;