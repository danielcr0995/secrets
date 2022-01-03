//jshint esversion:6
require('dotenv').config()
const express=require('express');
const bodyParser=require('body-parser');
const ejs = require('ejs');
const mongoose= require('mongoose');
const { get } = require('express/lib/response');
// const encrypt = require('mongoose-encryption');
const md5 = require('md5');


const app= express();

mongoose.connect('mongodb://localhost:27017/secretsDB')

const userSchema= new mongoose.Schema ({ //dont need to add this if you are not doing anything fancy
    username:String,
    password:String
});


// userSchema.plugin(encrypt,{secret:process.env.SECRET, encryptedFields:['password']});

const User = mongoose.model('User', userSchema);

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true})); // read data that is entered in a form

app.use(express.static('public')); // name of folder where the styles and the images of the webpage are

app.get('/' ,function(req,res){
    res.render('home');
})

app.get('/login' ,function(req,res){
    res.render('login');
})

app.get('/register' ,function(req,res){
    res.render('register');
})

app.post('/register', function(req,res){
    const newUsername=req.body.username;
    const newPassword= md5(req.body.password);
    User.findOne({username:newUsername}, function(err, foundUser){
        if(!err){
            if (foundUser) {
                // alert('Username already exists')
                res.redirect('/register')
                
            }else{
                const newUser = new User({
                    username:newUsername,
                    password:newPassword
                });
                newUser.save(function(err){
                    if (err) {
                        console.log(err);
                    }else{
                        res.render('secrets')
                    }
                });
                // console.log('Congratulations, you are now registerd');

            }
        }
    });
    
});

app.post('/login', function (req,res) {
    const existingUsername= req.body.username;
    const existingPassword= md5(req.body.password);
    User.findOne({
        username:existingUsername}, function (err, foundUser) {
            if (!err) {
                if (foundUser) {
                    if (foundUser.password===existingPassword) {
                        res.render('secrets')
                    }else res.redirect('/login');                    
                }else{
                    res.redirect('/login');
                }
            }else console.log(err);
        });
})




app.listen(process.env.PORT || 3000, function(){
    console.log('Server stated on port 3000');
})
