var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var passport = require('passport');
var configAuth = require('../config/auth');
var Twit = require('twit');
var request = require('request');
// var FB = require('fb');
// var graph = require('fbgraph');
var fs = require('fs');
var T;
var twilio = require('twilio');
var geocoder = require('geocoder');
var tracery = require('tracery-grammar');
var nlp = require('nlp_compromise');
var Status = require("../models/status.js");

var tweet;

var tweetsList = [];
var peopleList = [];
var placesList = [];
var timeList = [];
var nounList = [];
var whyList = [];
var howList = [];
var thinkList = [];
var feelList = [];


var whoSentence;
var whatSentence;
var whenSentence;
var whereSentence;
var whySentence;
var howSentence;

var client = twilio(configAuth.TwilioAuth.SID, configAuth.TwilioAuth.token);

router.get('/twilioJSON', function(req, res) {

    var jsonData = {
        'name': 'node-express-api-boilerplate',
        'api-status': 'OK',
        'instructions': "Send a text to (646) 762-0870",
        'format': 'I\'m your alternate, mirror self, that lives on the other side of the screen. Send me a text to say hello!'
    }

    // respond with json data
    res.render('index.html');
});

router.get('/', function(req, res, next) {
    res.render('index', {
        title: 'Express'
    });
});

router.get('/login', function(req, res, next) {
    res.render('login.ejs', {
        message: req.flash('loginMessage')
    });
});

router.get('/profile', isLoggedIn, function(req, res) {

  // THE FACEBOOK STUFF //

    // console.log('LOGGED INTO FACEBOOK');
    // console.log(req.user.facebook.id);
    // console.log(req.user.facebook.token);

    //   FB.setAccessToken(req.user.facebook.token);
    //
    //   FB.api('PageName/feed', 'get', gotPage);
    //
    //   function gotPage(res) {
    //     var posts = res.data;
    //     console.log(posts);
    // }

    // graph.setAccessToken(req.user.facebook.token);
    // graph.setAppSecret(req.user.facebook.tokenSecret);
    //
    // graph.batch([
    // {
    //   method: "GET",
    //   relative_url: req.user.facebook.id + "/posts"
    // }], function(err, res) {
    //   console.log(res);
    // });

  // THE TWITTER STUFF //

    console.log('GETTING TWITTER DATA');

    T = new Twit({
      consumer_key: configAuth.twitterAuth.consumerKey,
      consumer_secret: configAuth.twitterAuth.consumerSecret,
      access_token: req.user.twitter.token,
      access_token_secret: req.user.twitter.tokenSecret,
    })

    var userName = req.user.twitter.username;


    T.get('friends/list', {
      screen_name: userName },
      function (err, data, response) {
        for (i = 0; i < data.users.length; i++) {
          var name = data.users[i].name;
          var location = data.users[i].location;
          peopleList.push(name);
          placesList.push(location);
        }
      })

    T.get('statuses/user_timeline', {
        screen_name: userName,
        include_rts: 'false',
        count: 1000
    }, function(err, data, response) {

        // go through my tweets

        for (i = 0; i < data.length; i++) {
          tweet = data[i].text;

            // CLEAN THE TWEETS

            if (tweet.indexOf("@")>-1) {
              tweet = tweet.replace(/@\S+\s/g, '');
              lowercase(tweet);
            }

            if (tweet.indexOf("http")>-1) {
              tweet = tweet.replace(/http\S+/g, '');
              lowercase(tweet);
            }

            if (tweet.indexOf("&amp;")>-1) {
              tweet = tweet.replace(/&amp;/g, '&');
              lowercase(tweet);
            }

            if (tweet.indexOf("&lt;3")>-1) {
              tweet = tweet.replace(/&lt;3/g, '');
              lowercase(tweet);
            }

            lowercase(tweet);

            tweetsList.push(tweet);

            function lowercase(string) {
              return string.charAt(0).toLowerCase() + string.slice(1);
            }

            // List of people
            var person = nlp.text(tweet).people()[0];
            if (person != null) {
                var people = (person.text).replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
                if (people !== "I") {
                    if (people !== "you") {
                      if (people !== "He") {
                        if (people !== "you're") {
                          peopleList.push(people);
                        }
                      }
                    }
                }
            }

            // List of nouns
            var nouns = nlp.text(tweet).nouns();
            for (k = 0; k < nouns.length; k++) {
                var noun = nouns[k].text
                if (noun !== "I") {
                  nounList.push(noun);
                }
            }

            // List of times
            var time = nlp.text(tweet).dates()[0];
            if (time !== undefined) {
                // console.log(place)
                var times = (time.text).replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
                timeList.push(times);
            }

            // List of places
            var place = nlp.text(tweet).places()[0];
            if (place !== undefined) {
                var places = (place.text).replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
                var genericplaces = ["New York", "New York City", "Berlin", "New Jersey", "Florida", "Brooklyn", "Over there", "United States", "U.S.A"]
                placesList.push(places);
            }

            // WHY?
            if (tweet.indexOf("because")>-1 || tweet.indexOf("Because")>-1 || tweet.indexOf("explains")>-1 || tweet.indexOf("I don't know")>-1) {
                whyList.push(tweet);
            }

            // HOW?
            if (tweet.indexOf("by")>-1 || tweet.indexOf("By")>-1 || tweet.indexOf("in order")>-1) {
                howList.push(tweet);
            }

            // THINK WORDS
            if (tweet.indexOf("think")>-1 || tweet.indexOf("thinks")>-1 || tweet.indexOf("thought")>-1 || tweet.indexOf("my idea")>-1) {
                thinkList.push(tweet);
            }

            // FEEL WORDS
            if (tweet.indexOf("feel")>-1 || tweet.indexOf("feels")>-1 || tweet.indexOf("felt")>-1 || tweet.indexOf("I like")>-1 || tweet.indexOf("I liked")>-1) {
                feelList.push(tweet);
            }

        }

        parseResponse();
    })

    res.render('profile.ejs', {
        user: req.user
    });
});

router.get('/logout', function(req, res) {
  req.logout(),
  res.redirect('/');
});

router.post('/login', passport.authenticate('local-login', {
  successRedirect: '/',
  failureRedirect: '/',
}));

router.get('/auth/facebook', passport.authenticate('facebook', { scope: 'email' }));

router.get('/auth/facebook/callback', passport.authenticate('facebook', {
  successRedirect: '/',
  failureRedirect: '/',
}));

router.get('/auth/twitter', passport.authenticate('twitter'));

router.get('/auth/twitter/callback', passport.authenticate('twitter', {
  successRedirect: '/',
  failureRedirect: '/',
}));

module.exports = router;

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated())
      return next();
  res.redirect('/');
}

function parseResponse(resp) {
  console.log('MAKING RESPONSE');

  randomTweet();
  constructWho();
  constructWhat();
  constructWhen();
  constructWhere();
  constructWhy();
  constructHow();

  function uppercase(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  // RANDOM TWEET
  function randomTweet() {
    var randomSyntax = {
      "sentence": ["#randomTweet#. What do you think?"],
      "randomTweet": tweetsList
    };
    var randomGrammar = tracery.createGrammar(randomSyntax);
    randomSentence = uppercase(randomGrammar.flatten('#sentence#'));
    console.log(randomSentence)
    return randomSentence;
  }

  // WHO?
  function constructWho() {
    var whoSyntax = {
      "sentence": ["Yeah it's #name#. Why do you ask?", "I think #name#.", "#name#. Why?", "#name#?", "I'm guessing #name#. Why?", "#randomTweet#. Why do you ask?"],
      "name": peopleList,
      "randomTweet": tweetsList
    };
    var whoGrammar = tracery.createGrammar(whoSyntax);
    whoSentence = uppercase(whoGrammar.flatten('#sentence#'));
    console.log(whoSentence)
    return whoSentence;
  }

  // WHAT?
  function constructWhat() {
    var whatSyntax = {
      "sentence": ["#noun#", "A #noun#. What do you think?", "#noun#. #randomTweet#", "#feelTweet#. And you?", "#thinkTweet#", "#randomTweet#. What's your take?"],
      "noun": nounList,
      "feelTweet": feelList,
      "thinkTweet": thinkList,
      "randomTweet": tweetsList
    };
    var whatGrammar = tracery.createGrammar(whatSyntax);
    whatSentence = uppercase(whatGrammar.flatten('#sentence#'));
    console.log(whatSentence);
    return whatSentence;
  }

  // WHEN?
  function constructWhen() {
    var whenSyntax = {
      "sentence": ["#time#. You?", "At #time. And you?", "#time#. #randomTweet#?"],
      "time": timeList,
      "randomTweet": tweetsList
    };
    var whenGrammar = tracery.createGrammar(whenSyntax);
    whenSentence = uppercase(whenGrammar.flatten('#sentence#'));
    console.log(whenSentence)
    return whenSentence;
  }

  // WHERE?
  function constructWhere() {
    var whereSyntax = {
      "sentence": ["In #place#", "#place#"],
      "place": placesList
    };
    var whereGrammar = tracery.createGrammar(whereSyntax);
    whereSentence = uppercase(whereGrammar.flatten('#sentence#'));
    console.log(whereSentence)
    return whereSentence;
}

  // WHY?
  function constructWhy() {
    var whySyntax = {
      "sentence": ["Because #because#. Make sense?", "Because of #noun#. #randomTweet#", "Due to #randomTweet#", "Because #feelTweet#. What do you think?", "Because #thinkTweet#. You?", "#randomTweet# #randomTweet#"],
      "because": howList,
      "noun": nounList,
      "feelTweet": feelList,
      "thinkTweet": thinkList,
      "randomTweet": tweetsList
    };
    var whyGrammar = tracery.createGrammar(whySyntax);
    whySentence = uppercase(whyGrammar.flatten('#sentence#'));
    console.log(whySentence);
    return whySentence;
  }

  // HOW?
  function constructHow() {
    var howSyntax = {
      "sentence": ["By #because#. #randomTweet#. Why?", "By using a #nouns#. Why do you ask?", "#feelTweet#. Why?", "#thinkTweet#. Why?", "#randomTweet#. Why do you ask?"],
      "because": howList,
      "nouns": nounList,
      "feelTweet": feelList,
      "thinkTweet": thinkList,
      "randomTweet": tweetsList
    };
    var howGrammar = tracery.createGrammar(howSyntax);
    howSentence = uppercase(howGrammar.flatten('#sentence#'));
    console.log(howSentence);
    return howSentence;
  }
}

router.post('/twilio-callback', function(req, res) {

    // there's lots contained in the body
    console.log(req.body);

    // the actual message is contained in req.body.Body
    var incomingMsg = req.body.Body;
    console.log(incomingMsg);

    var incomingNum = req.body.From;

    var twilioResp = new twilio.TwimlResponse();

	var response = null;

	console.log("before or");

    if (incomingMsg.indexOf("Hello")>-1 || incomingMsg.indexOf("hello")>-1 || incomingMsg.indexOf("hey")>-1 || incomingMsg.indexOf("Hey")>-1 || incomingMsg.indexOf("hi")>-1) {
      response = "Hey! I'm your mirror self. You can ask me anything.";
    } else if (incomingMsg.indexOf("favorite")>-1) {
        response = "I nornally don't like to play favorites.";
    } else if (incomingMsg.indexOf("Who")>-1 || incomingMsg.indexOf("who")>-1) {
        response = whoSentence;
    } else if ((incomingMsg.indexOf('What is')>-1 || incomingMsg.indexOf('what is')>-1 || incomingMsg.indexOf('what\'s')>-1 || incomingMsg.indexOf('What\'s')>-1) && incomingMsg.indexOf('name')>-1) {
        response = "Hmmmm. " + whoSentence
    } else if (tweet.indexOf("What will")>-1 || tweet.indexOf("what will")>-1 || tweet.indexOf("What should")>-1 || tweet.indexOf("what should")>-1) {
        response = "I can't predict the future." + randomTweet
    } else if (incomingMsg.indexOf('What is')>-1 || incomingMsg.indexOf('what is')>-1 || incomingMsg.indexOf('what\'s')>-1 || incomingMsg.indexOf('What\'s')>-1) {
        response = whatSentence;
    } else if (incomingMsg.indexOf('Where')>-1 || incomingMsg.indexOf('where')>-1) {
        response = whereSentence;
    } else if (incomingMsg.indexOf('When')>-1 || incomingMsg.indexOf('when')>-1) {
        response = whenSentence;
    } else if (incomingMsg.indexOf('Why')>-1 || incomingMsg.indexOf('why')>-1) {
        response = whySentence;
    } else if (incomingMsg.indexOf('How')>-1 || incomingMsg.indexOf('how')>-1) {
        response = howSentence;
    } else if (incomingMsg.indexOf('Do')>-1 || incomingMsg.indexOf('do')>-1) {
        response = "Yes! Do you?";
    } else if (incomingMsg.indexOf('Are you')>-1 || incomingMsg.indexOf('are you')>-1) {
        response = "Nope. Are you?";
    } else if (incomingMsg.indexOf('Are they')>-1 || incomingMsg.indexOf('are they')>-1) {
        response = "They are not. You?";
    } else if (incomingMsg.indexOf('Thanks')>-1 || incomingMsg.indexOf('thanks')>-1 || incomingMsg.indexOf('Thank you')>-1 || incomingMsg.indexOf('thank you')>-1) {
        response = "You're welcome.";
    } else if (incomingMsg.indexOf('Cool')>-1 || incomingMsg.indexOf('cool')>-1) {
        response = "Cool cool. ";
    } else if (incomingMsg.indexOf('Sounds right')>-1 || incomingMsg.indexOf('sounds right')>-1 || incomingMsg.indexOf('Sounds good')>-1 || incomingMsg.indexOf('sounds good')>-1 || incomingMsg.indexOf('Sounds')>-1) {
        response = "Yep. Want to ask me anything else?";
    } else if (incomingMsg.indexOf('Sure')>-1 || incomingMsg.indexOf('sure')>-1 || incomingMsg.indexOf('OK')>-1 || incomingMsg.indexOf('ok')>-1) {
        response = "Cool.";
    } else if (incomingMsg.indexOf('Bye')>-1 || incomingMsg.indexOf('bye')>-1) {
        response = "Bye!";
    } else if (incomingMsg.indexOf('Fuck')>-1 || incomingMsg.indexOf('fuck')>-1 || incomingMsg.indexOf('suck')>-1 || incomingMsg.indexOf('Suck')>-1 || incomingMsg.indexOf('Hate')>-1 || incomingMsg.indexOf('hate')>-1) {
        response = "You're not very nice...";
    } else if (incomingMsg.indexOf('Yes')>-1 || incomingMsg.indexOf('yes')>-1 || incomingMsg.indexOf('Sure')>-1 || incomingMsg.indexOf('sure')>-1 || incomingMsg.indexOf('OK')>-1 || incomingMsg.indexOf('ok')>-1) {
        response = "Perfect.";
    } else if (incomingMsg.indexOf('Love')>-1 || incomingMsg.indexOf('love')>-1) {
        response = "You're sweet." + randomTweet;
    } else if (incomingMsg.indexOf('Because')>-1 || incomingMsg.indexOf('because')>-1) {
        response = "Well I can't really disagree. Why do you feel that way?";
    } else {
        var negate = nlp.statement(incomingMsg).negate().text()
        console.log(negate);
        response = negate;
    }
//response = "hello";
twilioResp.message(response);
	console.log(response);
    //twilioResp.sms(response);
	res.writeHead(200, {'Content-Type': 'text/xml'});
    res.end(twilioResp.toString());

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



module.exports = router;
