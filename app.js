require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose= require('mongoose');
// const bcrypt= require("bcrypt");
const session =  require("express-session");
const passport= require("passport");
const passportLocalMongoose= require("passport-local-mongoose");
const app = express();

app.use(express.static('public'));
app.set('view engine','ejs');
// app.use(bodyParser.urlencoded({extended:false}));
app.use(express.urlencoded({ extended: false }));


app.use(session({
    secret:'It is a secret.',
    resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/userDB");
mongoose.connect("mongodb://localhost:27017/userDB")
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.log('Failed to connect to MongoDB', err));

const userSchema =  mongoose.Schema({
    email:{
        // required:true,
        type:String
    },
    password:{
        // required:true,
        type:String
    }
});
userSchema.plugin(passportLocalMongoose)

const User = mongoose.model('User',userSchema);
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get('/',function(req,res){
    res.render("home");
});
app.get('/login',function(req,res){
    res.render("login");
});
app.get('/register',function(req,res){
    res.render("register");
});

app.get("/secrets",function(req,res){
    if(req.isAuthenticated())
    {
        res.render("secrets");
    }
    else{
        res.redirect("/");
    }
});

app.get("/logout",function(req,res){
    req.logout(function(err) {
        if(err) {
            console.log(err);
        } else {
            res.redirect("/");
        }
    });

    
});



app.post("/register",function(req,res){
    User.register({ username : req.body.username},req.body.password,function(err,user){
        if(err)
        {
            console.log(err);
            res.redirect("/register");            
        }
        else{
            passport.authenticate('local')(req,res,function(){
                res.redirect("/secrets");
            });
        }

    });

    // bcrypt.hash(req.body.password, 10, function(error, hash) {
    //     if(hash)
    //     {
    //         User({
    //             email : req.body.username,
    //             password: hash
    //         }).save().then((addedUser)=>{
    //             console.log(addedUser);
    //             res.render("secrets");
    //         }).catch((err)=>{
    //             console.log(err);
    //             res.send(err);
    //         });
    //     }
    //     else{
    //         console.log(error);
    //         res.send(error);
    //     }
    // });   
});

app.post('/login',function(req,res){

    const user = User({
        username:req.body.username,
        password:req.body.password
    });
    req.login(user,function(err){
        if(err)
        {
            console.log(err);
        }
        else{
            passport.authenticate('local')(req,res,function(){
                res.redirect("/secrets");
            });
        }
        
        
    })

    // User.findOne({
    //     email: req.body.username
    // }).then((foundedUser)=>{
    //     if(foundedUser){
    //         bcrypt.compare(req.body.password, foundedUser.password, function(err, result) {
    //             console.log(result);
    //             if(result){
    //                 res.render("secrets");
    //             }
    //             else{
    //                 res.send("Password not match");
    //             }
    //         });            
    //     }
    //     else{
    //         res.send("No user Found");
    //     }
    // }).catch((err)=>{
    //     console.log(err);
    //     res.send(err);
    // });
});


app.listen(3000, function(){
    console.log('Runing on 3000');
});

