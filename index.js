require('dotenv').config();
require('isomorphic-fetch');
const bodyParser = require('body-parser');
// Easy server creator
const express = require('express');
const qs = require("querystring");

const app = express();
// If port in environmental variable not found, then switch to port 8080
const port =parseInt(process.env.PORT, 10) || 8080;
const sqlite3 = require('sqlite3').verbose();
// Database containing stories posted by users
const db = new sqlite3.Database(process.env.DB);

// Variable that shows the number of posts shown per page in heartbreaks.html
const PostsPerPage = 3;

// If database does not already exist, then create it from scratch
db.run("CREATE TABLE IF NOT EXISTS posts (id INTEGER PRIMARY KEY AUTOINCREMENT, nickname TEXT, story TEXT, date TEXT, likes UNSIGNED BIG INT)");

// Middleware function for express, utilises google captcha for authentication purposes
function captchaMiddleware(req, res, next) {

    // if captcha doesn't exist, stop execution
    if (req.body.recaptchaToken == null) {
        res.sendStatus(400);
        return;
    }

    const body = {
        secret: process.env.CAPTCHA_SECRET,
        response: req.body.recaptchaToken
    }

    // Sending the captcha regained to google in order to verify if it is valid
    fetch("https://www.google.com/recaptcha/api/siteverify?" + qs.stringify(body))
        .then(res => res.json())
        .then(data => {
            if(!data.success) {
                res.sendStatus(403);
                return;
            }
            // continue to next middleware 
            next();
        })
        .catch(err => {
            console.error(err);
            res.sendStatus(500)
        })
}

// Handles story upload in forms.html with integrated captcha
app.post("/form", bodyParser.json(), captchaMiddleware, (req, res) => {

    // if nickname or story has not been typed, send 400 status and stop
    if (req.body.nickname==null || req.body.story==null){
        res.sendStatus(400);
        return;
    }

    // nickname has to be between 4 to 15 characters
    if (req.body.nickname.length>15 || req.body.nickname.length<4){
        res.sendStatus(403);
        return;
    }

    // story has to be between 40 to 800 characters
    if (req.body.story.length>800 || req.body.story.length<40){
        res.sendStatus(403);
        return;
    }

    // check story and nickname for forbidden words
    const forbidden_words = process.env.FORBIDDEN.split(',');
    for (const word of forbidden_words)
    {
        if (req.body.nickname.toLowerCase().includes(word))
        {
            res.sendStatus(406);
            return;
        }

        if (req.body.story.toLowerCase().includes(word))
        {
            res.sendStatus(406);
            return;
        }
    }
   
    // Makes sure the commands written for database do not run at the same time
    db.serialize(function(){
        var stmt = db.prepare("INSERT INTO posts(nickname, story, date, likes) VALUES(?,?,?,?)");
        stmt.run(req.body.nickname, req.body.story, new Date(Date.now()).toISOString(), 0);
        stmt.finalize();
    })

    res.sendStatus(200);
})

// Handles story viewing in heartbreaks.html
app.get("/heartbreaks", (req, res) => {

    // Add a unique id number to each story
    let sql1 = 'SELECT COUNT(id) AS count FROM posts';
    const Stories = [];
    // Signifies how many posts to skip
    const pageOffset = parseInt(req.query.pageNum, 10) * PostsPerPage;
    let lastpagenumber=0;

    // Sorting the database according to user preference
    let sql;
    switch(req.query.sortBy) {
        case "old":
            sql = 'SELECT * FROM posts ORDER BY date ASC LIMIT ? OFFSET ?';
            break;
        case "new":
        case null:
            sql = 'SELECT * FROM posts ORDER BY date DESC LIMIT ? OFFSET ?';
            break;
        case "likes":
            sql = 'SELECT * FROM posts ORDER BY likes DESC LIMIT ? OFFSET ?';
            break;
    }

    db.all(sql, [PostsPerPage, pageOffset], (err, rows) => {
        
        // Throw server error
        if (err != null) {
            console.error(err);
            res.sendStatus(500);
            return;
        } 
        
        db.get(sql1, [], (err, row) => {
            if (err != null) {
                console.error(err);
                res.sendStatus(500);
                return;
            }

            // Keep counting the number for last page
            if (row.count%PostsPerPage>0) lastpagenumber++;     

            // Calculates how many stories to show per page
            lastpagenumber = lastpagenumber + Math.floor(row.count/PostsPerPage);
            const isLast = lastpagenumber === parseInt(req.query.pageNum, 10) + 1;

            // Append each row returned by sqlite to stories return data
            rows.forEach(row => Stories.push(row));

            res.json({
                isLast,
                stories: Stories
            });    
        });
    });
})

// Handles like system for stories
app.post("/likes", bodyParser.json(), captchaMiddleware, (req,res) => {

    if (req.query.id==null){
        res.sendStatus(400);
        return;
    }

    let id = req.query.id;
    // Each time a post is liked, update like counter in database
    let sql = 'UPDATE posts SET likes = likes + 1 WHERE id=?';

    db.run(sql, [id], (err, rows) => {
        if (err != null) {
            console.error(err);
            res.sendStatus(500);
            return;
        } 
        res.sendStatus(200);
    });
})


app.use(express.static('frontend'))

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`)
})