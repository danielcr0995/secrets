//jshint esversion:6

const express=require('express');
const bodyParser=require('body-parser');
const ejs = require('ejs');

const app= express();


app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true})); // read data that is entered in a form

app.use(express.static('public')); // name of folder where the styles and the images of the webpage are





app.listen(process.env.PORT || 3000, function(){
    console.log('Server stated on port 3000');
})
