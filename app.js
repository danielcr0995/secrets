//jshint esversion:6

const express=require('express');
const bodyParser=require('body-parser');
const ejs = require('ejs');
const mongoose= require('mongoose');


const app= express();

mongoose.connect('mongodb://localhost:27017/secretsDB')

const userSchema=  {
    username:String,
    password:String
};

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
    const newPassword= req.body.password;
    User.findOne({username:newUsername}, function(err, foundUser){
        if(!err){
            if (foundUser) {
                console.log('User already exists');
                
            }else{
                const newUser = new User({
                    username:newUsername,
                    password:newPassword
                });
                newUser.save();
                console.log('Congratulations, you are now registerd');

            }
        }
    })
    
})




app.listen(process.env.PORT || 3000, function(){
    console.log('Server stated on port 3000');
})
