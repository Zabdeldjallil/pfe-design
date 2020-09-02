require("dotenv").config()
let mysql=require('mysql');
var dbconfig = require('./database');
var connection = mysql.createConnection(dbconfig.connection);
connection.query('USE ' + dbconfig.database);
const redis=require("redis");
const client = redis.createClient();
const moment=require("moment")
let now=moment();
const path=require("path")
const bodyParser=require("body-parser");
var cookieParser = require('cookie-parser');
const http=require("http")
const socketio=require('socket.io');
const express = require('express')
const passport=require("passport");
const session=require("express-session");
const app = express();
const server=http.createServer(app);
const io=socketio(server);
const methodOverride = require('method-override');
const flash = require('connect-flash');
const multer=require("multer")
//app.use/set
app.use(express.static("public"))
app.use(methodOverride('_method'))
app.use(flash());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true
}));
const ejs=require("ejs");
//set and use
app.set("view engine",'ejs')
app.use(bodyParser.json());
app.use(express.urlencoded({extended:true}));
const initialize=require("./passport-config")(passport);
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(cookieParser());
//router
app.use('/', require("./router"));
//routes
app.get("/messages",function(req,res){
    res.render("messages")
})
app.get("/conversation",function(req,res){
    res.render("conversation")
})
//PORTS
const REDIS_PORT=6379||process.env.PORT;
const PORT=8080||process.env.PORT;
server.listen(PORT,()=>{console.log("server started running on port:"+PORT)});