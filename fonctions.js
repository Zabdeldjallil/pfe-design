const redis=require("redis");
const client = redis.createClient();
const users=[];
const kick=[];
const mongoose=require("mongoose");
mongoose.connect('mongodb://localhost/my_database', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
mongoose.connection.once("open",()=>{
  console.log("connection done")
}).on("error",(err)=>{
    console.log(err)
})
var userSchema = mongoose.Schema({
  _id: String,
  username: String, 
  lastname: String, 
  email: String, 
  room: String   
}); 
var users2 = mongoose.model('user', userSchema);
const nodemailer=require("nodemailer");
const smtpTransport = require('nodemailer-smtp-transport');
let mysql=require('mysql');
const moment=require("moment")
let now=moment();
var dbconfig = require('./database');
const { assign } = require("nodemailer/lib/shared");
var connection = mysql.createConnection(dbconfig.connection);
connection.query('USE ' + dbconfig.database);
//sending email to a user
async function sendEmail(email,text){
    let testAccount= await nodemailer.createTestAccount();
      let transporter=nodemailer.createTransport(smtpTransport({
         service:'gmail',
         host:"smtp.gmail.com",
         auth:{
             user:"nodemailer04@gmail.com",
             pass:'djallilMCA10'
         } 
      }))
      //send the email
      let mailOptions={
        from:"nodemailer04@gmail.com",
        to:`${email}`,
        subject:"Sending email with nodemailer",
        text:`${text}`
    };
    transporter.sendMail(mailOptions,function(error,info){
        if(error) console.log(error);
        else console.log("Email sent"+info.response);
    })
  }
//sending verification email fonction
async function main(email,key){
    let testAccount= await nodemailer.createTestAccount();
    let transporter=nodemailer.createTransport(smtpTransport({
       service:'gmail',
       host:"smtp.gmail.com",
       auth:{
           user:"nodemailer04@gmail.com",
           pass:'djallilMCA10'
       } 
    }))
    //send the email
    let mailOptions={
        from:"noreply@noreply.com",
        to:`${email}`,
        subject:"Sending email with nodemailer",
        text:`http://localhost:8080/activation/${email}/${key}`
    };
    transporter.sendMail(mailOptions,function(error,info){
        if(error) console.log(error);
        else console.log("Email sent"+info.response);
    })
}
//delete everything(dev only)
const dede=function() {
  users2.find(function(err, result){
 if(err) throw err;
 else{
for (let index = 0; index < result.length; index++) {
  users2.remove({_id:`${result[index]._id}`},function (err,res) {
    if(err) throw err;
    else console.log(res,'well done')
  })
}
 }
  })
}
//users of the room
const usersRoom=function (room,cb) {
  users2.find(function(err, result){
    if (err){
        console.log(err)
    }
    else{
      var t=[];
for (let index = 0; index < result.length; index++) {
  if(result[index].room==room){
    t.push(result[index]);
  }
}
    }
    cb(t)
  })
  }
//user leaves the chat
const userLeave=function (id,cb) {
  getUserId(id,cb)
  users2.remove({_id: `${id}`}, function(err, piscine){
    if (err){
        console.log(err) 
    }
    else{console.log(`${id} left the chat`)} 
}); 
   }
 // get user with id
 const getUserId=function (id,cb) {
    users2.findById(`${id}`,(err,result)=>{
      if(err) console.log(err)
      else{
          cb(result)
      }
    })
  }

//join the chat
const joinChat=function (id,username,lastname,email,room,cb) {
    //const user={id,username,lastname,email,room};
    //users.push(user);
    var user2=new users2();
    user2._id=id;
    user2.username=username;
    user2.lastname=lastname;
    user2.email=email;
    user2.room=room;
    user2.save(function(err,product){
      if(err){
        console.log(err);
      }
     cb(product)
    })
    //return user;
  } 
//give the user's message a shape  
const formatMessage=function(id,email,username,lastname,text){
    return{
        id, 
        email, 
        username,
        lastname,
        text,
        time:moment().format("h:mm a"),
        date:moment().format("DD-MM-YYYY")
    }
} 
//bring old messages
 function oldMsg(socket,room){
    connection.query(`SELECT* FROM room${room}`,async (err,result)=>{
    if(err) throw err;
   // let yoyo=ress[0]
        //let houhou=ress[1]
        socket.emit("afficherMsg",result);
   /* await client.LRANGE(room,0,-1, function(err,ress){
      if(err) throw err;
        let yoyo=ress[0]
        let houhou=ress[1]
        socket.emit("afficherMsg",result,yoyo,houhou);
    })*/
  })
  }
//store message into DB
function storeMsg(room,email,username,lastname,message){ 
  connection.query(`INSERT INTO room${room} SET email=?,username=?,lastname=?,message=?,time=?,date=?`,[email,username,lastname,message,new Date().toLocaleTimeString(),new Date().toLocaleDateString()],(err,result)=>{
      if(err) throw err;
  })
   }
//role of the user
function role(email,cb){
  connection.query("SELECT role FROM users WHERE email=?",[email],(err,res)=>{
    if(err) throw err;
    cb(res[0].role);
  })
}
//find user with his email
function trouver(email,cb) {
 var verif=false
  users2.find((err,res)=>{
    if(err) console.log(err)
    for (let index = 0; index < res.length; index++) {
      if(res[index].email==email){verif=true}
    }
    cb(verif,res)
  })
  
}
function cons(email){return(users.find(user=>user.email===email))}
//find user with his username
function usernameFind(username,lastname,room) {
var toto=0
  for (let index = 0; index < users.length; index++) {
    if(users[index].username==username && users[index].lastname==lastname && users[index].room==room){toto++}
  }
return toto
}     
module.exports={sendEmail,main,usersRoom,userLeave,getUserId,joinChat,formatMessage,oldMsg,storeMsg,role,cons,usernameFind,dede,trouver};