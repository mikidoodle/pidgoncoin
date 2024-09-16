# Welcome!
In this file:<Br /><Br />
[Welcome!](#Welcome!)  
[Screenshots](#Screenshots)  
[Setup](#Setup)  
[Improvements](#Improvements)<Br /><Br />
PidgonCoin is a toy currency I built when I was 11, using HTML/CSS, jQuery, Node.js (via Express.js) and JSON for the database.
<Br >

The site is minimal and all options are simple and esasy to understand. Users can log in and sign up without an email and can transfer and mine money. I also had plans for a physical card, so you can see a bit of the early infrastructure for the card on the site.
Super users on the site are called "Ultimate Pidgons" and can add/subtract money from users. They can also view a log of all transactions. Users also earn badges for the amount of transactions they've completed.

# Screenshots
![Login Page](https://github.com/mikidoodle/pidgoncoin/assets/91926675/90ba5509-15eb-46bd-9ccd-04464076f8a3)
<Br />
![Home Page](https://github.com/mikidoodle/pidgoncoin/assets/91926675/f620132c-9bfc-4f50-990e-153f1b4d040b)
<Br />
![Transactions](https://github.com/mikidoodle/pidgoncoin/assets/91926675/48fe240c-8f81-442d-b489-fd255739f167)

# Setup

Setup is simple. Just run `npm i && node index.js` to download all packages, following which the site should go live. You can view the site at `http://localhost:3000`. The only thing that wouldn't work is the "Email me my PidgonCard" feature. If you are familiar with Nodemailer, I've initialised it in the first few lines of `index.js` where you can enter in your email details.

# Improvements

This site is obviously not optimally written, and there are a bunch of improvements I could make if I had the time. If you are interested in doing so, feel free to submit a pull request with your changes. Here are a few improvements you could do:
- Move the database from JSON to Postgres/SQL
- Convert HTML files to jsx or eJS
- Fix/Align UI elements
- Add exception handling, which for some reason I didn't do
