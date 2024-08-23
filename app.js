require("dotenv").config();
const express = require("express");
const bodyParsere= require("body-parser");
const mongoose= require('mongoose');
const encrypt = require("mongoose-encryption");
const app = express();

app.use(express.static('public'));
app.set('view engine','ejs');
app.use(bodyParsere.urlencoded({extended:false}));

mongoose.connect("mongodb://localhost:27017/userDB");
const userSchema =  mongoose.Schema({
    email:{
        required:true,
        type:String
    },
    password:{
        required:true,
        type:String
    }
});


userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ['password'] });

const User = mongoose.model('User',userSchema);

app.get('/',function(req,res){
    res.render("home");
});
app.get('/login',function(req,res){
    res.render("login");
});
app.get('/register',function(req,res){
    res.render("register");
});

app.post("/register",function(req,res){
    User({
        email : req.body.username,
        password: req.body.password
    }).save().then((addedUser)=>{
        console.log(addedUser);
        res.render("secrets");
    }).catch((err)=>{
        console.log(err);
        res.send(err);
    });
});

app.post('/login',function(req,res){
    User.findOne({
        email: req.body.username
    }).then((foundedUser)=>{
        if(foundedUser){
            if(foundedUser.password === req.body.password)
            {
                res.render("secrets");
            }
            else{
                res.send("Password not match");
            }
        }
        else{
            res.send("No user Found");
        }
    }).catch((err)=>{
        console.log(err);
        res.send(err);
    });
});


app.listen(3000, function(){
    console.log('Runing on 3000');
});

