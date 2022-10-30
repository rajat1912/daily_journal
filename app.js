//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const session = require('express-session');
const connectEnsureLogin = require("connect-ensure-login");
const passportLocalMongoose = require("passport-local-mongoose");
const passport = require('passport');
const saltRounds = 10;
var _ = require("lodash");

var s;

let it = [];

const homeStartingContent = "Lacus vel facilisis volutpat est velit egestas dui id ornare. Semper auctor neque vitae tempus quam. Sit amet cursus sit amet dictum sit amet justo. Viverra tellus in hac habitasse. Imperdiet proin fermentum leo vel orci porta. Donec ultrices tincidunt arcu non sodales neque sodales ut. Mattis molestie a iaculis at erat pellentesque adipiscing. Magnis dis parturient montes nascetur ridiculus mus mauris vitae ultricies. Adipiscing elit ut aliquam purus sit amet luctus venenatis lectus. Ultrices vitae auctor eu augue ut lectus arcu bibendum at. Odio euismod lacinia at quis risus sed vulputate odio ut. Cursus mattis molestie a iaculis at erat pellentesque adipiscing.";
const aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));
app.use(session({
  secret: "Our little secret.",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

const blog = mongoose.createConnection("mongodb://localhost:27017/blogDB", {
  useNewUrlParser: true
});
const log = mongoose.createConnection("mongodb://localhost:27017/logDB", {
  useNewUrlParser: true
});
log.plugin(passportLocalMongoose);
const Post = blog.model('Post', new mongoose.Schema({
  title: String,
  content: String
}));
const Logi = log.model('Login', new mongoose.Schema({
  name: String,
  email: String,
  password: String
}));

function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { // will return true if user is logged in
    next();
  } else {
    res.redirect("/login");
  }
}

passport.use(Logi.createStrategy());

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  Logi.findById(id, function(err, user) {
    done(err, user);
  });
});


app.get("/", function(req, res) {
  Post.find({}, function(err, posts) {

    res.render("home", {

      homeStarting: homeStartingContent,

      posts: posts

    });

  })
})
app.get("/about", function(req, res) {
  res.render("about", {
    aboutme: aboutContent
  });
})
app.get("/aboutl", function(req, res) {
  res.render("aboutl", {
    aboutme: aboutContent
  });
})
app.get("/contact", function(req, res) {
  res.render("contact", {
    contactme: contactContent
  });
})
app.get("/contactl", function(req, res) {
  res.render("contactl", {
    contactme: contactContent
  });
})
app.get("/compose", isAuthenticated, function(req, res) {
  res.render("compose");
})
app.get("/login", function(req, res) {
  res.render("login");
})
app.get("/register", function(req, res) {
  res.render("register");
})
app.get("/logged", isAuthenticated, (req, res) =>
  Post.find({}, function(err, posts) {

    res.render("logged", {

      user: s,
      homeStarting: homeStartingContent,

      posts: posts

    });

  })
)
app.get("/logout", function(req, res) {
  req.logout(function(err) {
    if (err) {
      return next(err);
    }
    Post.find({}, function(err, posts) {

      res.render("home", {

        homeStarting: homeStartingContent,

        posts: posts

      });

    })
  })
});
app.post("/compose", function(req, res) {
  const post = new Post({
    title: req.body.postTitle,
    content: req.body.postBody
  });
  post.save().then(() => {
    console.log('Post added to DB.');
    Post.find({}, function(err, posts) {

      res.render("logged", {
        user: s,
        homeStarting: homeStartingContent,

        posts: posts

      });

    })
  });
})
app.post("/register", function(req, res) {
  Logi.register({
    username: req.body.username,
    name: req.body.name
  }, req.body.password, function(err, user) {
    if (err) {
      console.log(err);
      res.redirect("/register");
    } else {
      passport.authenticate("local")(req, res, function() {

        Post.find({}, function(err, posts) {

          res.render("logged", {

            user: req.body.name,
            homeStarting: homeStartingContent,

            posts: posts

          });

        })
      })
    }
  });
});

app.post("/login", function(req, res) {
      const user = new Logi({
        username: req.body.username,
        password: req.body.password
      });

        req.login(user, function(err) {
          if (err) {
            console.log(err);
          } else {
            passport.authenticate("local")(req, res, function() {
              Logi.findOne({
                username: req.body.username
              },'name', function(err, Logi) {
                if (err) {
                return handleError(err);
                } else {
                   s = Logi.name;
                }
              });
                Post.find({}, function(err, posts) {

                  res.render("logged", {
                    user: s,
                    homeStarting: homeStartingContent,

                    posts: posts

                  });

                })
              }

            );
          }
        });
      });
      app.get("/posts/:postId", isAuthenticated, function(req, res) {
        const requestedPostId = req.params.postId;
        Post.findOne({
          _id: requestedPostId
        }, function(err, post) {

          res.render("post", {

            title: post.title,

            content: post.content
          });
        });
      })
      app.listen(3000, function() {
        console.log("Server started on port 3000");
      });
