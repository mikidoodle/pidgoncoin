var express = require('express');
var app = express();
var path = require('path');
var nodemailer = require('nodemailer')
const cookieParser = require('cookie-parser')
var cook = require('js-cookie')
var pidgon = require('pidgonscript')
const transporter = nodemailer.createTransport({
  service: "iCloud",
  auth: {
    user: "xxx@xxx.com",
    pass: "xxx"
  }
})
var PORT = 3000;
const { v1: uuidv1 } = require('uuid');
const { v4: uuidv4 } = require('uuid');
const { v5: uuidv5 } = require('uuid');
const Database = require("easy-json-database");
const users = new Database('./db/users.json')
const log = new Database('./db/log.json')
const fs = require('fs')
const router = express.Router();
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/api/json', express.static('db'))
const short = require('short-uuid');
const translator = short("0123456789");
app.get('/', function(req, res) {
if('apcuuid' in req.cookies) {
  var uu = new Database(`./db/users/${req.cookies.apcuuid}.json`)
    if(uu.get('pidgon') == 'yes') {
      res.redirect('/pidgon')
    } else res.redirect('/user')
  } else res.sendFile(path.join(__dirname + '/public/index.html'))
})

app.get('/mine', function(req, res) {
  res.sendFile(path.join(__dirname + '/public/mine.html'))
})

app.post('/mine', function(req, res) {
  var uj = new Database('./db/users/'+req.cookies.apcuuid+'.json')
  var ud = uuidv4()
  if(uj.has('username')) {
    var am = parseFloat(uj.get('balance'))
    var newam = am + parseFloat(req.body.tSOP)
    uj.set('balance', newam)
    res.send(`<link href="//pidgon.com/style.css" rel="stylesheet"><body align="center"><h1>:O</h1>${req.body.tSOP} PidgonCoins have been added to your account! <br> <button onclick='window.location.replace("/")'>Go Home</button></body>`)
     uj.set('pidgonID ' + ud, `"Mined ${req.body.tSOP} PidgonCoins on ${new Date()}`)
      log.set('pidgonID ' + ud, `${uj.get('username')} mined ${req.body.tSOP} PidgonCoins on ${new Date()}`) 
  } else {res.redirect('/login'); res.cookie('apcmine', 'no')}
 
})

app.get('/out', function(req, res) {
res.cookie('apcuuid', '', {
  expires: new Date(Date.now())
});
res.redirect('/')
})

app.get('/login', function(req, res) {
  res.sendFile(path.join(__dirname + '/public/login.html'))
})

app.post('/transfer', function(req, res) {
  var amount = parseFloat(req.body.amount)
  var person = req.body.person
  var user = req.cookies.apcuuid
  var userdb = new Database(`./db/users/${user}.json`)
  var username = userdb.get('username')
  if(amount > 0) {
    if(amount > 0.001) {
  if(users.has(person)) {
    var uu = users.get(person)
    var uj = new Database(`./db/users/${uu}.json`)
    if(userdb.get('balance') >= amount) {
      var uud = uuidv4()
      if ('message' in req.body) {
      userdb.subtract('balance', amount)
      uj.add('balance', amount)
      var message = req.body.message
      userdb.set('pidgonID ' + uud, `Transferred ${amount} to "${person}" with message "${message}" on ${new Date()}`)
      uj.set('pidgonID ' + uud, `"${username}" has given you ${amount} pidgonCoins with a message: "${message}" on ${new Date()}`)
      log.set('pidgonID ' + uud, `Transferred ${amount} to "${person}" from "${user}" with message on ${new Date()}`)
      res.send(`<link href="//pidgon.com/style.css" rel="stylesheet"><body align="center"><h1>O_o</h1>Transaction completed! <br> You have transfered ${amount} pidgonCoins to ${person} with the message ${message}! <br> <button onclick="window.location.replace('/appeal/${person}/${uud}/')">Pull Transaction</button><br><button onclick='window.location.replace("/")'>Go Home</button></body>`)
      } else {
        userdb.subtract('balance', amount)
        uj.add('balance', amount)
        userdb.set('pidgonID ' + uud, `Transferred ${amount} to ${person} on ${new Date()}`)
        uj.set('pidgonID ' + uud, `"${person}" has given you ${amount} pidgonCoins on ${new Date()}!"`)
        log.set('pidgonID ' + uud, `Transferred ${amount} to ${person} from ${user} on ${new Date()}`)
        res.send(`<link href="//pidgon.com/style.css" rel="stylesheet"><body align="center"><h1>O_o</h1>Transaction completed! <br> You have transfered ${amount} pidgonCoins to ${person}! <br> <button onclick="window.location.replace('/appeal/${person}/${uud}/')">Pull Transaction</button><br><button onclick='window.location.replace("/")'>Go Home</button></body>`)
      }
      
    } else res.send(`<link href="//pidgon.com/style.css" rel="stylesheet"><body align="center"><h1>O_o</h1>Transaction failed.<br> you do not have enough money to make that transaction. None of your coins have been removed.<br><button onclick='window.location.replace("/")'>Go Home</button></body>`)
  } else res.send(`<link href="//pidgon.com/style.css" rel="stylesheet"><body align="center"><h1>O_o</h1>Transaction failed.<br> The recipient does not exist. If you added an "@" symbol at the starting of the username, remove it and try again. None of your coins have been removed.<br><button onclick='window.location.replace("/")'>Go Home</button></body>`)
  } else res.send(`<link href="//pidgon.com/style.css" rel="stylesheet"><body align="center"><h1>O_o</h1><br>You cannot transfer money lesser than 0.001. <br><button onclick='window.location.replace("/")'>Go Home</button></body>`)
  } else {
    userdb.subtract('balance', 2)
    res.send(`<link href="//pidgon.com/style.css" rel="stylesheet"><body align="center"><h1>O_o</h1>hold up.<br> You just tried removing money from someone else! 2 pidgonCoins have been removed from your account because you mean.<br><button onclick='window.location.replace("/")'>Go Home</button></body>`)
    }
})

app.get('/signup', function(req, res) {
  res.sendFile(path.join(__dirname + '/public/signup.html'))
})

app.post('/login', function(req, res) {
  var ur = req.body.username.toString().replace(/\./g, ',').toLowerCase()
  console.log(ur)
  if(users.has(ur)) {
    var uu = new Database(`./db/users/${users.get(ur)}.json`)
    if(uu.get('password') == req.body.password) {
      if(uu.get('pidgon') == 'yes') {
        res.cookie('apcuuid', users.get(ur))        
        res.redirect('/pidgon')
      } else { 
        res.cookie('apcuuid', users.get(ur))
        res.redirect('/user')
        }
    } res.send(`<link href="//pidgon.com/style.css" rel="stylesheet"><body align="center"><h1>O_o</h1>Your password is wrong. <br><button onclick='window.location.replace("/login")'>Go Back</button></body>`)
  } else res.send(`<link href="//pidgon.com/style.css" rel="stylesheet"><body align="center"><h1>O_o</h1>username does not exist. <br><button onclick='window.location.replace("/login")'>Go Back</button></body>`)
})

app.post('/signup', function(req, res) {
  if(users.has(req.body.username.split('.').join())) {
    res.send(`<link href="//pidgon.com/style.css" rel="stylesheet"><body align="center"><h1>O_o</h1>This username already exists.<br><button onclick='window.location.replace("/signup")'>Go Back</button></body>`)
  } else {
      var uui = uuidv4()
      var udb = new Database(`./db/users/${uui}.json`)
      users.set(req.body.username.split('.').join().toLowerCase(), uui)
      var us = new Database(`./db/users/${uui}.json`)
      us.set('username', req.body.username.toLowerCase())
      us.set('password', req.body.password)
      us.set('pidgon', 'no')
      us.set('balance', 2)      
      res.cookie('apcuuid', uui)
      res.redirect('/user')
  }
})

app.post('/pidgon/add', function(req, res) {
  var amount = parseFloat(req.body.amount)
  var appdb = new Database(`./db/users/${req.cookies.apcuuid}.json`)
  if(appdb.get('pidgon') == 'yes') {
    if(users.has(req.body.person)) {
      var uud = uuidv4()
      var userdb = new Database(`./db/users/${users.get(req.body.person)}.json`)
      userdb.add('balance', amount)
      res.send(`<link href="//pidgon.com/style.css" rel="stylesheet"><body align="center"><h1>O_o</h1>Success! ${amount} pidgonCoins have been added to ${req.body.person}.<br><button onclick='window.location.replace("/")'>Go Home</button></body>`)
      log.set('pidgonID ' + uud, `Given ${amount} to ${req.body.person} from an Ultimate Pidgon.`)
    } else res.send(`<link href="//pidgon.com/style.css" rel="stylesheet"><body align="center"><h1>O_o</h1>User does not exist.<br><button onclick='window.location.replace("/")'>Go Home</button></body>`)   
  } else res.send(`<link href="//pidgon.com/style.css" rel="stylesheet"><body align="center"><h1>O_o</h1>You are not an Ultimate Pidgon [Admin]. die.<br><button onclick='window.location.replace("/")'>Go Home</button></body>`)
})

app.post('/pidgon/subtract', function(req, res) {
  var amount = parseFloat(req.body.amount)
  var appdb = new Database(`./db/users/${req.cookies.apcuuid}.json`)
  if(appdb.get('pidgon') == 'yes') {
    if(users.has(req.body.person)) {
      var uud = uuidv4()
      var userdb = new Database(`./db/users/${users.get(req.body.person)}.json`)
      userdb.subtract('balance', amount)
      res.send(`<link href="//pidgon.com/style.css" rel="stylesheet"><body align="center"><h1>O_o</h1>Success! ${amount} pidgonCoins have been subtracted from ${req.body.person}.<br><button onclick='window.location.replace("/")'>Go Home</button></body>`)
      log.set('pidgonID ' + uud, `Subtracted ${amount} from ${req.body.person} by Ultimate pidgon on ${new Date()}`)
    } else res.send(`<link href="//pidgon.com/style.css" rel="stylesheet"><body align="center"><h1>O_o</h1>User does not exist.<br><button onclick='window.location.replace("/")'>Go Home</button></body>`)   
  } else res.send(`<link href="//pidgon.com/style.css" rel="stylesheet"><body align="center"><h1>O_o</h1>You are not an Ultimate Pidgon.<br><button onclick='window.location.replace("/")'>Go Home</button></body>`)
})

app.get('/user', function(req, res) {
  if(fs.existsSync(`db/users/${req.cookies.apcuuid}.json`)) {
    res.sendFile(path.join(__dirname + '/public/user.html'))
  } else res.redirect('/login') 
})

app.get('/pidgon', function(req, res) {
  if(fs.existsSync(`db/users/${req.cookies.apcuuid}.json`)) {
    console.log('exists')
    var uus = new Database(`./db/users/${req.cookies.apcuuid}.json`) 
    if(uus.get('pidgon') == 'yes') {
      console.log('is pidgon')
      res.sendFile(path.join(__dirname + '/public/super.html'))
    } else {console.log('not pidgon'); res.redirect('/user')}

  } else res.redirect('/login') 
})

app.get('/appeal/:person/:uuid', function(req, res) {
  var person = users.get(req.params.person)
  var user = req.cookies.apcuuid
  var uuid = req.params.uuid
  if(log.has('pidgonID ' + uuid)) {
    if(log.get('pidgonID ' + uuid).endsWith('- PULLED')) {
    res.send(`<link href="//pidgon.com/style.css" rel="stylesheet"><body align="center"><h1>O_o</h1>Error. Your transaction has already been pulled.<br><button onclick='window.location.replace("/")'>Go Home</button></body>`)
    } else {
    var udb = new Database(`./db/users/${user}.json`)
    var pdb = new Database(`./db/users/${person}.json`)
    var stm = log.get('pidgonID ' + uuid)
    var sspl = stm.split(' ')
    var amount = parseFloat(sspl[1])
    log.add('pidgonID ' + uuid, ' - PULLED')
    udb.delete('pidgonID ' + uuid)
    udb.add('balance', amount)
    pdb.subtract('balance', amount)
    res.send(`<link href="//pidgon.com/style.css" rel="stylesheet"><body align="center"><h1>O_o</h1>Success! Your transaction was pulled.<br><button onclick='window.location.replace("/")'>Go Home</button></body>`)
    }
  } else res.send(`<link href="//pidgon.com/style.css" rel="stylesheet"><body align="center"><h1>O_o</h1>Error. Your transaction does not exist.<br><button onclick='window.location.replace("/")'>Go Home</button></body>`)
})

app.get('/source/bloop', function(req, res) {
    res.sendFile(path.join(__dirname + '/public/bloop.js'))
})

app.get('/source/em', function(req, res) {
    res.sendFile(path.join(__dirname + '/public/34.js'))
})

app.get('/card/css', function(req, res) {
    res.sendFile(path.join(__dirname + '/public/card.css'))
})
app.get('/card/js', function(req, res) {
    res.sendFile(path.join(__dirname + '/public/card.js'))
})

app.get('/card/learn', function(req, res) {
    res.sendFile(path.join(__dirname + '/public/learn.html'))
})

app.get('/card/transfer', function(req, res) {
    res.sendFile(path.join(__dirname + '/public/cardtrans.html'))
})

app.get('/card/transfer/:name/:pin', function(req, res) {
    res.sendFile(path.join(__dirname + '/public/cardtransAuto.html'))
})

app.get('/card', function(req, res) {
  if(fs.existsSync(`db/users/${req.cookies.apcuuid}.json`) && req.cookies.apcuuid !== null && req.cookies.apcuuid !== 'undefined'&& req.cookies.apcuuid !== undefined) {
var user = new Database(`./db/users/${req.cookies.apcuuid}.json`)
    if(user.has('cardnumber') && user.has('pin')){
      res.sendFile(path.join(__dirname + '/public/card.html'))
    } else {
     res.sendFile(path.join(__dirname + '/public/setpin.html'))
      
    }
    
  } else res.redirect('/signup')
    
})

app.get('/setpin', function(req, res) {
  res.sendFile(path.join(__dirname + '/public/setpin.html'))
})
app.post('/setpin', function(req, res) {
  console.log(req.cookies.apcuuid)
 var user = new Database(`./db/users/${req.cookies.apcuuid}.json`)
 user.set('cardnumber', translator.new().slice(0, 12))
  user.set('pin', pidgon.encrypt(req.body.pin))
  res.redirect('/card')
})


app.post('/card/transact', function(req, res) {
  const uud = uuidv4()
 if(users.has(req.body.username) && users.has(req.body.otherusername)) {
   var user = new Database(`./db/users/${users.get(req.body.username)}.json`)
      var otheruser = new Database(`./db/users/${users.get(req.body.otherusername)}.json`)
   if(pidgon.decrypt(user.get('pin')) == req.body.pin) {
     user.subtract('balance', parseInt(req.body.money))
     otheruser.add('balance', parseInt(req.body.money))
     user.set('pidgonID ' + uud, `Transferred ${req.body.money} to ${req.body.otherusername} by PidgonCard on ${new Date()}`)
        otheruser.set('pidgonID ' + uud, `"${req.body.username}" has given you ${req.body.money} pidgonCoins on ${new Date()}!"`)
        log.set('pidgonID ' + uud, `Transferred ${req.body.money} to ${req.body.otherusername} from ${req.body.username} by PidgonCard on ${new Date()}`)
         res.send(`<link href="//pidgon.com/style.css" rel="stylesheet"><body align="center"><h1:O</h1>Your PidgonCard transaction has completed!<br><button onclick='window.location.replace("/")'>Go Home</button></body>`)
   } else res.send(`<link href="//pidgon.com/style.css" rel="stylesheet"><body align="center"><h1>O_o</h1>Your PidgonCard PIN is wrong<br><button onclick='window.location.replace("/card/transfer")'>Try again</button></body>`)
 } else res.send(`<link href="//pidgon.com/style.css" rel="stylesheet"><body align="center"><h1>O_o</h1>The cardholder or the transactee does not exist.<br><button onclick='window.location.replace("/card/transfer")'>Try again</button></body>`)
})


app.get('/card/mail', function(req, res) {
     res.sendFile(path.join(__dirname + '/public/cardmail.html'))
})

app.get('/card/@:name', function(req, res) {
  if(users.has(req.params.name)) {
    var user = new Database(`./db/users/${users.get(req.params.name)}.json`)
    res.send(`<html>
  <head><style>
    @import url('https://fonts.googleapis.com/css2?family=Rubik:wght@700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400&display=swap');
* {
  background-repeat: no-repeat;
}

h1 {
  font-family: 'Rubik';
}
.g {
  font-family: 'Rubik'
}
html {
  height: 100%;
  width: 100%;
  overflow: hidden;
}

body {
  height: 100%;
  display: flex;
  background: linear-gradient(to left, red, violet)
}

.card_body {
  padding: 0.75rem 1.75rem;
}
.active .floating:before {
  opacity: 1;
  transition: 500ms;
}
.floating:before {
  font-family: "Quicksand";
  font-weight: bold;
  width: 100%;
  text-align: center;
  font-size: 2rem;
  position: absolute;
  top: -70px;
  opacity: 0;
  transition: 300ms;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.floating {
  font-family: Inconsolata; 
  margin: auto; 
  width: 453px;
  height: 280px;
  box-shadow: -20px 14px 54px rgba(0, 0, 0, 0.55);
  font-size: 18px;
  border-radius: 8px;
  transform-style: preserve-3d;
  transform-origin: 50% 50%;
  transform: rotateX(17deg) rotateY(18deg);
}
.floatingtoo {
  font-family: Inconsolata; 
  margin: auto; 
  width: 453px;
  height: 280px;
  box-shadow: -20px 14px 54px rgba(0, 0, 0, 0.55);
  font-size: 18px;
  border-radius: 8px;
  transform-style: preserve-3d;
  transform-origin: 50% 50%;
  transform: rotateX(17deg) rotateY(-18deg);
}
.logo {
  height: 60px;
  transform: translateZ(30px);
  text-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
  margin-right: -50px;
  font-weight: normal;
  filter: drop-shadow(-6.4px 6.2px 8px rgba(0, 0, 0, 0.6));
  z-index: 20;
  content: "PidgonCard";
  color: white;
}

.chips {
  margin-top: 17px;
  margin-left: -1px;
  height: 70px;
  width: 80px;
  filter: drop-shadow(-6.4px 6.2px 8px rgba(0, 0, 0, 0.6));
  transform: translateZ(25px);
  background-repeat: no-repeat;
  background-image: url("data:image/svg+xml;charset=utf8,%3Csvg version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' width='50px' x='0px' y='0px' viewBox='0 0 40 40' style='enable-background:new 0 0 40 40;' xml:space='preserve'%3E%3Cg id='surface1'%3E%3Cpath fill='%23F5CE85' d='M8.9,34.5c-6.4,0.1-6.4,0.1-6.4-6.4V11.9c0-3.5-0.1-6.4,3.4-6.4h25.3c6.4,0,6.4,0,6.4,6.4v16.3 c0,6.4,0,6.4-6.4,6.4L8.9,34.5z'/%3E%3Cpath fill='%23967A44' d='M31.1,6C37,6,37,6,37,11.9v16.3c0,5.9,0,5.9-5.9,5.9H8.9c-5.9,0-5.9,0-5.9-6V11.9C3,8.2,2.7,6,6,6H31.1 M31.1,5H9.2C2.3,5,2,5,2,11.9v16.3C2,35,2,35,8.9,35h22.3c6.9-0.1,6.9-0.1,6.9-6.9V11.9C38.1,5,38.1,5,31.1,5z'/%3E%3Cpath fill='%23967A44' d='M29,35c-3.3,0-6-2.7-6-6s2.7-6,6-6h8.5v1H29c-2.8,0-5,2.2-5,5s2.2,5,5,5V35z'/%3E%3Cpath fill='%23967A44' d='M11,35v-1c2.8,0,5-2.2,5-5s-2.2-5-5-5H2.5v-1H11c3.3,0,6,2.7,6,6S14.3,35,11,35z'/%3E%3Cpath fill='%23967A44' d='M37.5,17H27c-2.2,0-4-1.8-4-4s1.8-4,4-4h2.1v1H27c-1.7,0-3,1.3-3,3s1.3,3,3,3h10.5V17z'/%3E%3Cpath fill='%23967A44' d='M28,16h1v7.5h-1V16z'/%3E%3Cpath fill='%23967A44' d='M13,17H2.5v-1H13c1.7,0,3-1.3,3-3s-1.3-3-3-3h-2.1V9H13c2.2,0,4,1.8,4,4S15.2,17,13,17z'/%3E%3Cpath fill='%23967A44' d='M11,16h1v7.5h-1V16z'/%3E%3C/g%3E%3C/svg%3E");
}

.paywave {
  transform: translateZ(30px);
  float: right;
  position: absolute;
  margin: 15px 5px;
  top: 0;
  right: 0;
  filter: drop-shadow(0px 0px 5px rgba(0, 0, 0, 0.5));
  filter: drop-shadow(-6.4px 6.2px 8px rgba(0, 0, 0, 0.6));
  height: 50px;
  width: 50px;
  background-repeat: no-repeat;
  background-image: url("data:image/svg+xml;charset=utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='30' height='56' viewBox='0 0 46 56'%3E%3Ctitle%3EContactlessIndicator 000%3C/title%3E%3Cpath fill='none' stroke='%23FFF' stroke-width='6' stroke-linecap='round' d='m35,3a50,50 0 0,1 0,50M24,8.5a39,39 0 0,1 0,39M13.5,13.55a28.2,28.5 0 0,1 0,28.5M3,19a18,17 0 0,1 0,18'/%3E%3C/svg%3E");
}

.other {
  color: white;
  font-family: 'Rubik'
}
.paypal_center {
  height: 300px;
  width: 300px;
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateZ(5px);
  margin-left: -75px;
  z-index: 1;
  filter: drop-shadow(-6.4px 6.2px 8px rgba(0, 0, 0, 0.6));
  background-image: url("");
}

.card_no {
  transform: translateZ(40px);
  font-family: 'Roboto Mono';
  font-size: 1.8rem;
  color: azure;
  position: absolute;
  letter-spacing: 3px;
  bottom: 90px;
  z-index: 2;
  text-shadow: 0 0 5px rgba(0, 0, 0, 0.13);
  text-shadow: -9px 8.7px 6px rgba(0, 0, 0, 0.13);
  width: calc(100% - 3.5rem);
  text-align: center;
}

.valid {
  position: absolute;
  bottom: 56px;
  color: #fff;
  font-size: 0.58rem;
  left: 146px;
  text-shadow: 0 0 5px rgba(0, 0, 0, 0.8);
  text-shadow: -9px 8.7px 6px rgba(0, 0, 0, 0.8);
  transform: translateZ(30px);
}

.valid_date {
  position: absolute;
  font-family: 'Roboto Mono';
  font-size: 1.5rem;
  font-weight: bold;
  color: #fff;
  text-shadow: 0 0 5px rgba(0, 0, 0, 0.8);
  text-shadow: -9px 8.7px 6px rgba(0, 0, 0, 0.8);
  bottom: 54px;
  left: 180px;
  z-index: 20;
  transform: translateZ(30px);
  letter-spacing: 2px;
}

.holder {
  position: absolute;
  font-family: 'Rubik';
  font-size: 1.5rem;
  font-weight: bold;
  color: #fff;
  text-shadow: 0 0 5px rgba(0, 0, 0, 0.13);
  text-shadow: -9px 8.7px 6px rgba(0, 0, 0, 0.13);
  bottom: 20px;
  
  left: 30px;
  z-index: 20;
  letter-spacing: 2px;
  transform: translateZ(50px); 
}
    
.thickness {
  width: 453px;
  height: 280px;
  border-radius: 8px;
  position: absolute;
  background: linear-gradient( 109.6deg,  rgba(61,245,167,1) 11.2%, rgba(9,111,224,1) 91.1% );
  transform: translateZ(-4px);
}
.thickness:nth-child(2) {
  transform: translateZ(-8px);
}
.thickness:nth-child(3) {
  transform: translateZ(-11px);
}

  </style></head>
<body class="active">
 
  <div class="floating">
    <div class="thickness"></div>
    <div class="thickness"></div>
    <div class="thickness"></div>
     <div class="thickness"></div>
    <div class="card_body">
      <div class="logo svg"><h1>PidgonCard</h1></div>
      <div class="paywave svg"></div>
      <div class="chips svg"></div>
      <div class="card_no text">
        ${user.get('cardnumber').split('-').join('').match(/.{1,4}/g).join('-')}
      </div>
      <div class="valid_date text" style="font-family: 'Rubik';" align="center">
      </div>
      <div class="holder text">${req.params.name}</div>
    </div>
  </div>
</body>
</html>`)
  } else res.send(`<h1>Error</h1>`)
})
app.post('/card/mail', function(req, res) {
  var user = new Database(`./db/users/${users.get(req.body.name)}.json`)
   var message = {
        from: 'noreply@pidgon.com',
        to: req.body.email,
        subject: 'Your PidgonCard!',
        html: `<html>
  <head><style>
    @import url('https://fonts.googleapis.com/css2?family=Rubik:wght@700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400&display=swap');
* {
  background-repeat: no-repeat;
}

h1 {
  font-family: 'Rubik';
}
.g {
  font-family: 'Rubik'
}
html {
  height: 100%;
  width: 100%;
  overflow: hidden;
}

body {
  height: 100%;
  display: flex;
  background: linear-gradient(to left, red, violet)
}

.card_body {
  padding: 0.75rem 1.75rem;
}
.active .floating:before {
  opacity: 1;
  transition: 500ms;
}
.floating:before {
  font-family: "Quicksand";
  font-weight: bold;
  width: 100%;
  text-align: center;
  font-size: 2rem;
  position: absolute;
  top: -70px;
  opacity: 0;
  transition: 300ms;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.floating {
  font-family: Inconsolata; 
  margin: auto; 
  width: 453px;
  height: 280px;
  box-shadow: -20px 14px 54px rgba(0, 0, 0, 0.55);
  font-size: 18px;
  border-radius: 8px;
  transform-style: preserve-3d;
  transform-origin: 50% 50%;
  transform: rotateX(17deg) rotateY(18deg);
}
.floatingtoo {
  font-family: Inconsolata; 
  margin: auto; 
  width: 453px;
  height: 280px;
  box-shadow: -20px 14px 54px rgba(0, 0, 0, 0.55);
  font-size: 18px;
  border-radius: 8px;
  transform-style: preserve-3d;
  transform-origin: 50% 50%;
  transform: rotateX(17deg) rotateY(-18deg);
}
.logo {
  height: 60px;
  transform: translateZ(30px);
  text-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
  margin-right: -50px;
  font-weight: normal;
  filter: drop-shadow(-6.4px 6.2px 8px rgba(0, 0, 0, 0.6));
  z-index: 20;
  content: "PidgonCard";
  color: white;
}

.chips {
  margin-top: 17px;
  margin-left: -1px;
  height: 70px;
  width: 80px;
  filter: drop-shadow(-6.4px 6.2px 8px rgba(0, 0, 0, 0.6));
  transform: translateZ(25px);
  background-repeat: no-repeat;
  background-image: url("data:image/svg+xml;charset=utf8,%3Csvg version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' width='50px' x='0px' y='0px' viewBox='0 0 40 40' style='enable-background:new 0 0 40 40;' xml:space='preserve'%3E%3Cg id='surface1'%3E%3Cpath fill='%23F5CE85' d='M8.9,34.5c-6.4,0.1-6.4,0.1-6.4-6.4V11.9c0-3.5-0.1-6.4,3.4-6.4h25.3c6.4,0,6.4,0,6.4,6.4v16.3 c0,6.4,0,6.4-6.4,6.4L8.9,34.5z'/%3E%3Cpath fill='%23967A44' d='M31.1,6C37,6,37,6,37,11.9v16.3c0,5.9,0,5.9-5.9,5.9H8.9c-5.9,0-5.9,0-5.9-6V11.9C3,8.2,2.7,6,6,6H31.1 M31.1,5H9.2C2.3,5,2,5,2,11.9v16.3C2,35,2,35,8.9,35h22.3c6.9-0.1,6.9-0.1,6.9-6.9V11.9C38.1,5,38.1,5,31.1,5z'/%3E%3Cpath fill='%23967A44' d='M29,35c-3.3,0-6-2.7-6-6s2.7-6,6-6h8.5v1H29c-2.8,0-5,2.2-5,5s2.2,5,5,5V35z'/%3E%3Cpath fill='%23967A44' d='M11,35v-1c2.8,0,5-2.2,5-5s-2.2-5-5-5H2.5v-1H11c3.3,0,6,2.7,6,6S14.3,35,11,35z'/%3E%3Cpath fill='%23967A44' d='M37.5,17H27c-2.2,0-4-1.8-4-4s1.8-4,4-4h2.1v1H27c-1.7,0-3,1.3-3,3s1.3,3,3,3h10.5V17z'/%3E%3Cpath fill='%23967A44' d='M28,16h1v7.5h-1V16z'/%3E%3Cpath fill='%23967A44' d='M13,17H2.5v-1H13c1.7,0,3-1.3,3-3s-1.3-3-3-3h-2.1V9H13c2.2,0,4,1.8,4,4S15.2,17,13,17z'/%3E%3Cpath fill='%23967A44' d='M11,16h1v7.5h-1V16z'/%3E%3C/g%3E%3C/svg%3E");
}

.paywave {
  transform: translateZ(30px);
  float: right;
  position: absolute;
  margin: 15px 5px;
  top: 0;
  right: 0;
  filter: drop-shadow(0px 0px 5px rgba(0, 0, 0, 0.5));
  filter: drop-shadow(-6.4px 6.2px 8px rgba(0, 0, 0, 0.6));
  height: 50px;
  width: 50px;
  background-repeat: no-repeat;
  background-image: url("data:image/svg+xml;charset=utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='30' height='56' viewBox='0 0 46 56'%3E%3Ctitle%3EContactlessIndicator 000%3C/title%3E%3Cpath fill='none' stroke='%23FFF' stroke-width='6' stroke-linecap='round' d='m35,3a50,50 0 0,1 0,50M24,8.5a39,39 0 0,1 0,39M13.5,13.55a28.2,28.5 0 0,1 0,28.5M3,19a18,17 0 0,1 0,18'/%3E%3C/svg%3E");
}

.other {
  color: white;
  font-family: 'Rubik'
}
.paypal_center {
  height: 300px;
  width: 300px;
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateZ(5px);
  margin-left: -75px;
  z-index: 1;
  filter: drop-shadow(-6.4px 6.2px 8px rgba(0, 0, 0, 0.6));
  background-image: url("");
}

.card_no {
  transform: translateZ(40px);
  font-family: 'Roboto Mono';
  font-size: 1.8rem;
  color: azure;
  position: absolute;
  letter-spacing: 3px;
  bottom: 90px;
  z-index: 2;
  text-shadow: 0 0 5px rgba(0, 0, 0, 0.13);
  text-shadow: -9px 8.7px 6px rgba(0, 0, 0, 0.13);
  width: calc(100% - 3.5rem);
  text-align: center;
}

.valid {
  position: absolute;
  bottom: 56px;
  color: #fff;
  font-size: 0.58rem;
  left: 146px;
  text-shadow: 0 0 5px rgba(0, 0, 0, 0.8);
  text-shadow: -9px 8.7px 6px rgba(0, 0, 0, 0.8);
  transform: translateZ(30px);
}

.valid_date {
  position: absolute;
  font-family: 'Roboto Mono';
  font-size: 1.5rem;
  font-weight: bold;
  color: #fff;
  text-shadow: 0 0 5px rgba(0, 0, 0, 0.8);
  text-shadow: -9px 8.7px 6px rgba(0, 0, 0, 0.8);
  bottom: 54px;
  left: 180px;
  z-index: 20;
  transform: translateZ(30px);
  letter-spacing: 2px;
}

.holder {
  position: absolute;
  font-family: 'Rubik';
  font-size: 1.5rem;
  font-weight: bold;
  color: #fff;
  text-shadow: 0 0 5px rgba(0, 0, 0, 0.13);
  text-shadow: -9px 8.7px 6px rgba(0, 0, 0, 0.13);
  bottom: 20px;
  
  left: 30px;
  z-index: 20;
  letter-spacing: 2px;
  transform: translateZ(50px); 
}
    
.thickness {
  width: 453px;
  height: 280px;
  border-radius: 8px;
  position: absolute;
  background: linear-gradient( 109.6deg,  rgba(61,245,167,1) 11.2%, rgba(9,111,224,1) 91.1% );
  transform: translateZ(-4px);
}
.thickness:nth-child(2) {
  transform: translateZ(-8px);
}
.thickness:nth-child(3) {
  transform: translateZ(-11px);
}

  </style></head>
<body class="active">
 
  <div class="floating">
    <div class="thickness"></div>
    <div class="thickness"></div>
    <div class="thickness"></div>
     <div class="thickness"></div>
    <div class="card_body">
      <div class="logo svg"><h1>PidgonCard</h1></div>
      <div class="paywave svg"></div>
      <div class="chips svg"></div>
      <div class="card_no text">
        ${user.get('cardnumber').split('-').join('').match(/.{1,4}/g).join('-')}
      </div>
      <div class="valid_date text" style="font-family: 'Rubik';" align="center">
      </div>
      <div class="holder text">${req.body.name}</div>
    </div>
  </div>
</body>
</html>`
      };
      
      transporter.sendMail(message, function(error, info){
        if(error){
          console.log(error)
        }else{
           console.log(info.response);
        };
      });
  res.send(`<link href="//pidgon.com/style.css" rel="stylesheet"><body align="center"><h1>O_o</h1>Success! Your card has been emailed to you!<br><button onclick='window.location.replace("/")'>Go Home</button></body>`)
})

app.get('*', function(req, res){
  res.sendFile(path.join(__dirname + '/public/404.html'))
  //res.status(404).send(`<html><head><title>404 | PidgonCoin</title><link rel="stylesheet" href="https://unpkg.com/purecss@2.0.6/build/pure-min.css" integrity="sha384-Uu6IeWbM+gzNVXJcM9XV3SohHtmWE+3VGi496jvgX1jyvDTXfdK+rfZc8C1Aehk5" crossorigin="anonymous">	<link href="//pidgon.com/style.css" rel="stylesheet"></head><body align="center"> <h1>¯\(°_o)/¯</h1> <p>rong paeg</p>  <p>trenslashun: wrong page</p><br><button onclick='window.location.replace("/")'>Go Home</button></body></html>`);
});

//porting
app.use('/', router);
app.listen(3000);
console.log('Pidgon Initiated. \n App running at port 3000');