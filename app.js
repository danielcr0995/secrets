//jshint esversion:6
require('dotenv').config()
const express=require('express');
const bodyParser=require('body-parser');
const ejs = require('ejs');
const mongoose= require('mongoose');
const { get } = require('express/lib/response');
// // const encrypt = require('mongoose-encryption');
// // const md5 = require('md5');
// const bcrypt = require('bcrypt');
// const saltRounds=10;
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate');


const app= express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true})); // read data that is entered in a form

app.use(express.static('public')); // name of folder where the styles and the images of the webpage are

app.use(session({
    secret:'Our little secret.',
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect('mongodb://localhost:27017/secretsDB')

const userSchema= new mongoose.Schema ({ //dont need to add this if you are not doing anything fancy
    username:String,
    password:String
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

// userSchema.plugin(encrypt,{secret:process.env.SECRET, encryptedFields:['password']});

const User = mongoose.model('User', userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secrets"
  },
  function(accessToken, refreshToken, profile, cb) { //accesToke allow to get data, refreshToken
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));

app.get('/' ,function(req,res){
    res.render('home');
})

app.get('/login' ,function(req,res){
    res.render('login');
})

app.get('/register' ,function(req,res){
    res.render('register');
})

app.get('/secrets', function(req,res){
    if (req.isAuthenticated()){
        res.render('secrets');
    }else res.redirect('/login');
})

app.get('/logout', function (req,res) {
    req.logout();
    res.redirect('/');
})

app.post('/register', function(req,res){
    const newUsername=req.body.username;
    const newPassword= req.body.password;

    User.register({username:newUsername}, newPassword, function (err, user) {
        if (err) {
            console.log(err);
            res.redirect('/register')   
        }else{
            passport.authenticate('local')(req,res,function(){
                res.redirect('/secrets'); // will run this only if the user is authenticated
            })
        }
    })
    
    
    
});

app.post('/login', function (req,res) {
    const existingUsername= req.body.username;
    const existingPassword= req.body.password;

    const user = new User({
        username: existingUsername,
        password: existingPassword
    });

    req.login(user, function (err){
        if(!err){
            passport.authenticate('local')(req,res,function () {
                res.redirect('/secrets')
            })
        }else console.log(err);
    })
})




app.listen(process.env.PORT || 3000, function(){
    console.log('Server stated on port 3000');
})
