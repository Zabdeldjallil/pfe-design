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
    connection.query("SELECT * FROM posts",function(err,result){
        if(err) throw err;
        res.render("index",{posts:result})
    })
    })
router.get("/add-post",isLoggedIn,function(req,res){
    res.render("add-post")
})
router.get("/settings",isLoggedIn,function(req,res){
    res.render("settings",{user:req.user})
})
router.get('/profil',isLoggedIn,function(req,res){
    connection.query("SELECT * FROM posts WHERE email=?",[req.user.email],function(err,result){
        if (err) throw err;
        res.render("profil",{user:req.user,posts:result})
    })
})
router.get("/messages",isLoggedIn,function(req,res){
    res.render("messages")
})
router.get('/update-user',isLoggedIn,function(req,res){
    res.render("update-user")
})
router.get("/conversation/:number",isLoggedIn,function(req,res){
    /*connection.query(`SELECT * FROM room${req.params.number}`,function(err,result){
        if(err) throw err;
        //console.log(req.user)
        res.render("conversation",{msgs:result,user:req.user});
    })*/
    res.render("conversation",{user:req.user});
})
router.get('/404',function(req,res){
    res.render("404")
})
//not certain
/*router.get("/single",function(res,res){
    res.render("single-post")
})*/
//disconnect
router.get('/logout', (req, res) => {
    req.logOut()
    res.redirect('/')
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
       main(req.body.email,toto);
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
router.post("/add-post",isLoggedIn,function(req,res){
    if(req.body.titre.trim().length===0){res.render("add-post",{msg:"Le titre doit être spécifié"});}
  else  if(req.body.contenu.trim().length===0){res.render("add-post",{msg:"Le contenu du post ne peut être vide"});}
  else { connection.query("INSERT into posts SET email=?,firstname=?,lastname=?,time=?,date=?,title=?,text=?",[req.user.email,req.user.Firstname,req.user.Lastname,now.format("h:mm:ss a"),now.format("DD-MM-YYYY"),req.body.titre,req.body.contenu],function(err,result){
        if (err) throw err;
        res.redirect("/index")
    })}
})
//here need fix
router.post("/update-user",isLoggedIn,function(req,res){
   connection.query("SELECT * FROM users WHERE email=?",[req.user.email],function(err,result){
    if(err) throw err;
    if (bcrypt.compareSync(req.body.password,result[0].password)){
        if(req.body.npassword.length>=8){
            let nhashed=bcrypt.hashSync(req.body.npassword, 10, null);
            connection.query("UPDATE users SET Lastname=?,Firstname=?,sex=?,password=? WHERE email=?",[req.body.nom,req.body.prenom,req.body.sex,nhashed,req.user.email],function(err,resu){
                if(err) throw err;
            })
        }
        else{
            res.render("update-user",{msg:'Nouveau mot de passe incompatible'});
        }
   }
   else{
       res.render("update-user",{msg:'Mot de passe incorrect'});
   }
   })
    
})
//verification function
function isLoggedIn(req, res, next){
        if(req.isAuthenticated())
         return next();
       
        res.redirect('/');
       }
module.exports = router;