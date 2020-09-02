var express = require('express');
var router = express.Router();
require("dotenv").config()
let mysql=require('mysql');
var dbconfig = require('./database');
var connection = mysql.createConnection(dbconfig.connection);
connection.query('USE ' + dbconfig.database);
const redis=require("redis");
const client = redis.createClient();
const moment=require("moment")
let now=moment();
const bcrypt = require('bcrypt')
const passport=require("passport");
const flash = require('connect-flash');
const nodemailer=require("nodemailer");
const smtpTransport = require('nodemailer-smtp-transport');
const random=require("random");
const validator=require("validator");
const multer=require("multer");
const path=require("path")
const {sendEmail,main,usersRoom,userLeave,getUserId,joinChat,formatMessage,oldMsg,storeMsg,role,cons,usernameFind,dede,trouver}=require("./fonctions")
//gets
router.get("/",function(req,res){
    res.render("login",{message:req.flash('loginMessage')})
    })
router.get("/signup",function(req,res){
        res.render("signup")
    })
router.get("/index",isLoggedIn,function(req,res){
        res.render("index")
    })
//posts    
router.post("/registered",function(req,res){
    //console.log(req.body)
    if(!validator.isEmail(req.body.email)){res.render("signup",{message:"Email erroned"})}
     if(req.body.password.length<8||req.body.password!=req.body.passwordconfirm){res.render("signup",{message:"Your password must contain atleast 8 characters and be confirmed correctly"})}
     if(validator.isEmail(req.body.email)&&req.body.password.length>=8&&req.body.password==req.body.passwordconfirm){
       connection.query(`SELECT * FROM users WHERE email=?`,[req.body.email],async function (err,rows) {
         if(err) throw err;
         if(rows.length){res.render('signup',{message:"You are already registred"})}
         else{
           let toto=await random.int(1,1000000);
            let HPSW=bcrypt.hashSync(req.body.password, 10, null)
            let activated=false;
         connection.query("INSERT INTO users (Firstname,Lastname,email, password,activated,akey,role,sex) values (?,?,?,?,?,?,?,?)",[req.body.firstname,req.body.lastname,req.body.email,HPSW,activated,toto,'user',req.body.sex],function(err,rows) { 
          if(err) throw err;
      // main(req.body.email,toto);
          res.redirect("/")
         })
       }
       })
   }
})
router.post("/index",passport.authenticate('local-login', {
    successRedirect: '/index',
    failureRedirect: '/',
    failureFlash: true
   }),function(req,res){
    if(req.body.remember){
      req.session.cookie.maxAge = 1000 * 60 * 3;
     }else{
      req.session.cookie.expires = false;
     }
    })
    function isLoggedIn(req, res, next){
        if(req.isAuthenticated())
         return next();
       
        res.redirect('/');
       }
module.exports = router;