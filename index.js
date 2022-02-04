require('dotenv').config()
require('isomorphic-fetch')
const { json } = require('body-parser');
const bodyParser = require('body-parser')
const express = require('express')
const qs = require("querystring");

const app = express()
const port = 8080
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('forms.db');

const PostsPerPage = 3;

db.run("CREATE TABLE IF NOT EXISTS posts (id INTEGER PRIMARY KEY AUTOINCREMENT, nickname TEXT, story TEXT, date TEXT, likes UNSIGNED BIG INT)");

app.post("/form", bodyParser.json(), (req, res) => {
    if (req.body.recaptchaToken == null) {
        res.sendStatus(400);
        return;
    }

    const body = {
        secret: process.env.CAPTCHA_SECRET,
        response: req.body.recaptchaToken
    }

    fetch("https://www.google.com/recaptcha/api/siteverify?" + qs.stringify(body))
        .then(res => res.json())
        .then(data => {
            if(!data.success) {
                res.sendStatus(403);
                return;
            }

            if (req.body.nickname==null || req.body.story==null)
            {
                res.sendStatus(400);
                return;
            }

            if (req.body.nickname.length>15 || req.body.nickname.length<4){
                res.sendStatus(403);
                return;
            }

            if (req.body.story.length>800 || req.body.story.length<40){
                res.sendStatus(403);
                return;
            }

            db.serialize(function() {
                var stmt = db.prepare("INSERT INTO posts(nickname, story, date, likes) VALUES(?,?,?,?)");
                stmt.run(req.body.nickname, req.body.story, new Date(Date.now()).toISOString(), 0);
                stmt.finalize();
            })
            res.sendStatus(200);
        })
        .catch(err => {
            console.error(err);
            res.sendStatus(500)
        })
})


app.get("/heartbreaks", (req, res) => {
    let sql1 = 'SELECT COUNT(id) AS count FROM posts';
    const Stories = [];
    const pageOffset = parseInt(req.query.pageNum, 10) * PostsPerPage;
    let lastpagenumber=0;

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
        if (err) throw err;
        
        db.get(sql1, [], (err, row) => {
            if (err) throw err;

            if (row.count%PostsPerPage>0) lastpagenumber++;     
            
            lastpagenumber = lastpagenumber + Math.floor(row.count/PostsPerPage);
            const isLast = lastpagenumber === parseInt(req.query.pageNum, 10) + 1;

            rows.forEach(row => {
                Stories.push(row);
            });

            res.json({
                isLast,
                stories: Stories
            });    
        });
    });

})

app.post("/likes",(req,res)=>
{
    if (req.query.id==null){
        res.sendStatus(400);
        return;
    }

    
    let id = req.query.id;
    let sql = 'UPDATE posts SET likes = likes + 1 WHERE id=?';

    db.run(sql, [id], (err, rows) => {
        if (err) throw err;
        res.sendStatus(200);
    });

})

app.use(express.static('frontend'))

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`)
})