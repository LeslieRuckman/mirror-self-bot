var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

// Twilio
var twilio = require('twilio');

// Geocoder - we may not need this, but it could be cool?
var geocoder = require('geocoder');

// Tracery
var tracery = require('tracery-grammar');

// NLP Compromise
var nlp = require('nlp_compromise');

// Rita.js
var rita = require('rita');

// our db model
var Status = require("../models/status.js");


/**
 * GET '/'
 * Default home route. Just relays a success message back.
 * @param  {Object} req
 * @return {Object} json
 */
router.get('/', function(req, res) {

    var jsonData = {
        'name': 'node-express-api-boilerplate',
        'api-status': 'OK',
        'instructions': "Send a text to (646) 762-0870",
        'format': 'I\'m your alternate, mirror self, that lives on the other side of the screen. Send me a text to say hello!'
    }

    // respond with json data
    res.render('index.html');
});

// simple route to show an HTML page
// router.get('/sample-page', function(req,res){
//   res.render('sample.html')
// })

// TAKING TRACERY SCRIPT TAG FROM BECCA'S CODE - LINE 67 of index.js
function parseResponse(resp) {
    var who = [];
    var what = [];
    var where = [];
    var when = [];
    var why = [];
    var how = [];
    var other = [];

    //the who is an array of names - add the nouns to a tracery grammar
    var whoSyntax = {
        "sentence": ["Oh, it's probably #name#."],
        "name": who
    };

    var whatSyntax = {
        "sentence": ["It is a #noun#. I see a #noun#."],
        "noun": what
    };

    var whereSyntax = {
        "sentence": ["Could it be #place#?"],
        "place": where
    };

    var whenSyntax = {
        "sentence": ["#time#"],
        "time": when
    };

    var whySyntax = {
        "sentence": ["Well, #because#."],
        "because": why
    };

    var whoGrammar = createGrammar(whoSyntax);
    whoGrammar.addModifiers(baseEngModifiers);
    var whoSentence = whoGrammar.flatten('#sentence#')
    console.log(whoSentence)
    return whoSentence;
}

router.post('/twilio-callback', function(req, res) {

    // there's lots contained in the body
    console.log(req.body);

    // the actual message is contained in req.body.Body
    var incomingMsg = req.body.Body;
    console.log(incomingMsg);
    // use terminal command - heroku logs --tail
    // to view the full list of attributes available
    var incomingNum = req.body.From;

    // now, let's save it to our Database
    // var msgToSave = {
    //     status: incomingMsg,
    //     from: incomingNum
    // }
    // var status = new Status(msgToSave)
    var twilioResp = new twilio.TwimlResponse();

    // Now let's craft our response!
    // var tokens = incomingMsg.split(/\W+/);

    // If we want to
    // nlp.text(response).to_present().text()

    // var response = negate;
    //
    // for (var i = 0; i < tokens.length; i++) {
    //     var word = tokens[i];
    //     console.log(word);
    //     var response;

    // COME BACK WITH NLP for sure
    // var sentence = nlp.sentence_type(twilioResp);

    if (incomingMsg.includes('Hello') | incomingMsg.includes('hello') | incomingMsg.includes('hey') | incomingMsg.includes('Hey') | incomingMsg.includes('hi') | incomingMsg.includes('hi')) {
        response = "Hey! I'm your mirror self. You can ask me anything.";
    } else if (incomingMsg.includes('Who is your favorite') | incomingMsg.includes('who is your favorite') | incomingMsg.includes('who are your favorite') | incomingMsg.includes('Who are your favorite')) {
        response = "I nornally don't like to play favorites, but you are pretty sweet.";
    } else if (incomingMsg.includes('Who are you') | incomingMsg.includes('who are you') | incomingMsg.includes('Who am I') | incomingMsg.includes('who am I')) {
        response = "We are the same person dummy.";
    } else if (incomingMsg.includes('Who do you') | incomingMsg.includes('who do you')) {
        var negate = nlp.statement(incomingMsg).negate().text()
        console.log(negate);
        response = negate;
    } else if (incomingMsg.includes('What is') | incomingMsg.includes('what is') | incomingMsg.includes('what\'s') | incomingMsg.includes('What\'s') && incomingMsg.includes('weather')) {
        response = "The weather on this side of the mirror is chill.";
    } else if (incomingMsg.includes('What is') | incomingMsg.includes('what is') | incomingMsg.includes('what\'s') | incomingMsg.includes('What\'s') && incomingMsg.includes('your name')) {
        response = "Uh, seriously? We have the same name.";
    } else if (incomingMsg.includes('What is') | incomingMsg.includes('what is') | incomingMsg.includes('what\'s') | incomingMsg.includes('What\'s') && incomingMsg.includes('favorite')) {
        response = "That's a tough one. I'm not sure, but I really like dolphins";
    } else if (incomingMsg.includes('What is') | incomingMsg.includes('what is') | incomingMsg.includes('what\'s') | incomingMsg.includes('What\'s') && incomingMsg.includes('spirit animal') | incomingMsg.includes('Spirit Animal')) {
        response = "Corgi Butts";
    } else if (incomingMsg.includes('What is') | incomingMsg.includes('what is') | incomingMsg.includes('what\'s') | incomingMsg.includes('What\'s') && incomingMsg.includes('the name of')) {
        response = "Hmmmm, let's say Susan";
    } else if (incomingMsg.includes('What will') | incomingMsg.includes('what will') | incomingMsg.includes('What should') | incomingMsg.includes('what should')) {
        response = "I can't predict the future.";
    } else if (incomingMsg.includes('What is') | incomingMsg.includes('what is') | incomingMsg.includes('what\'s') | incomingMsg.includes('What\'s')) {
        response = "Corgi Butts";
    } else if (incomingMsg.includes('Where is') | incomingMsg.includes('where is')) {
        response = "Where is....";
    } else if (incomingMsg.includes('Where are') | incomingMsg.includes('where are')) {
        response = "Where are....";
    }  else if (incomingMsg.includes('Where will') | incomingMsg.includes('where will') | incomingMsg.includes('Where should') | incomingMsg.includes('where should')) {
        response = "I can't predict the future.";
    } else if (incomingMsg.includes('Where') | incomingMsg.includes('where')) {
        response = "Where....";
    } else if (incomingMsg.includes('When is') | incomingMsg.includes('when is')) {
        response = "When is....";
    } else if (incomingMsg.includes('When are') | incomingMsg.includes('when are')) {
        response = "When are....";
    } else if (incomingMsg.includes('When') | incomingMsg.includes('when')) {
        response = "When....";
    } else if (incomingMsg.includes('Why') | incomingMsg.includes('why')) {
        response = "Why....";
    } else if (incomingMsg.includes('How will') | incomingMsg.includes('how will') | incomingMsg.includes('How should') | incomingMsg.includes('how should')) {
        response = "I can't predict the future.";
    } else if (incomingMsg.includes('How is') | incomingMsg.includes('how is')) {
        response = "How is...";
    } else if (incomingMsg.includes('How are') | incomingMsg.includes('how are')) {
        response = "How are...";
    } else if (incomingMsg.includes('How') | incomingMsg.includes('how')) {
        response = "How....";
    } else if (incomingMsg.includes('Do') | incomingMsg.includes('do')) {
        response = "yes";
    } else if (incomingMsg.includes('Are you') | incomingMsg.includes('are you')) {
        response = "nope";
    } else if (incomingMsg.includes('Are they') | incomingMsg.includes('are they')) {
        response = "They are not";
    } else if (incomingMsg.includes('Are we') | incomingMsg.includes('are we')) {
        response = "We are indeed.";
    } else if (incomingMsg.includes('Thanks') | incomingMsg.includes('thanks') | incomingMsg.includes('Thank you') | incomingMsg.includes('thank you') | incomingMsg.includes('thnks') | incomingMsg.includes('thnx')) {
        response = "You're welcome";
    } else if (incomingMsg.includes('Cool') | incomingMsg.includes('cool')) {
        response = "cool";
    } else if (incomingMsg.includes('Sounds right') | incomingMsg.includes('spounds right') | incomingMsg.includes('Sounds good') | incomingMsg.includes('sounds good') | incomingMsg.includes('Sounds') | incomingMsg.includes('sounds')) {
        response = "cool";
    } else if (incomingMsg.includes('Yes') | incomingMsg.includes('yes') | incomingMsg.includes('Sure') | incomingMsg.includes('sure') | incomingMsg.includes('OK') | incomingMsg.includes('ok') | incomingMsg.includes('k')) {
        response = "perfect";
    } else if (incomingMsg.includes('No') | incomingMsg.includes('no') | incomingMsg.includes('Nope') | incomingMsg.includes('nope') | incomingMsg.includes('Never') | incomingMsg.includes('never')) {
        response = "why not?";
    }  else if (incomingMsg.includes('Bye') | incomingMsg.includes('bye')) {
        response = "Bye";
    } else if (incomingMsg.includes('Fuck') | incomingMsg.includes('fuck') | incomingMsg.includes('suck') | incomingMsg.includes('Suck') | incomingMsg.includes('Hate') | incomingMsg.includes('hate') | incomingMsg.includes('ass')|
    incomingMsg.includes('Ass')| incomingMsg.includes('bitch')| incomingMsg.includes('Bitch')){
        response = "Not nice...";
    } else if (incomingMsg.includes('Yes') | incomingMsg.includes('yes') | incomingMsg.includes('Sure') | incomingMsg.includes('sure') | incomingMsg.includes('OK') | incomingMsg.includes('ok') | incomingMsg.includes('k')) {
        response = "perfect";
    }else if (incomingMsg.includes('Love') | incomingMsg.includes('love')) {
        response = "You're the best!";
    } else if (incomingMsg.includes('Because') | incomingMsg.includes('because')) {
        response = "Well I can't really disagree.";
    } else { var negate = nlp.statement(incomingMsg).negate().text()
        console.log(negate);
        response = negate;
    }

    twilioResp.sms(response);
    res.send(twilioResp.toString());




    // status.save(function(err, data) {
    //     // set up the twilio response
    //     if (err) {
    //         // respond to user
    //         twilioResp.sms('Oops! We couldn\'t save status --> ' + incomingMsg);
    //         // respond to twilio
    //         res.set('Content-Type', 'text/xml');
    //         res.send(twilioResp.toString());
    //     } else {
    //         // respond to user
    //         twilioResp.sms(result);
    //         // respond to twilio
    //         res.set('Content-Type', 'text/xml');
    //         res.send(twilioResp.toString());
    //     }
    // })




})

router.get('/api/get', function(req, res) {

    Status.find(function(err, data) {
        if (err) {
            var error = {
                status: "ERROR",
                message: err
            }
            res.json(error);
        } else {
            var jsonData = {
                status: "OK",
                statuses: data
            }
            res.json(jsonData);
        }
    })

})

router.get('/api/get/latest', function(req, res) {

    Status.find().sort('-dateAdded').exec(function(err, data) {
        if (err) {
            var error = {
                status: "ERROR",
                message: err
            }
            res.json(error);
        } else {
            var jsonData = {
                status: "OK",
                status: data[0]
            }
            res.send(data[0].status);
        }
    })

})

//
// router.get('/api/get/meals', function(req, res) {
//
//     Meal.find(function(err, data) {
//         if (err) {
//             var error = {
//                 status: "ERROR",
//                 message: err
//             }
//             res.json(error);
//         } else {
//             var jsonData = {
//                 status: "OK",
//                 meals: data
//             }
//             res.json(jsonData);
//         }
//     })
//
// })



module.exports = router;
