const bodyParser = require('body-parser')
const express = require('express')

const app = express()
const port = 8080
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('forms.db');

const PostsPerPage = 3;

db.run("CREATE TABLE IF NOT EXISTS posts (id INTEGER PRIMARY KEY AUTOINCREMENT, nickname TEXT, story TEXT, date TEXT)");

app.post("/form", bodyParser.json(), (req, res) => {
    db.serialize(function() {
        var stmt = db.prepare("INSERT INTO posts(nickname, story, date) VALUES(?,?,?)")
        stmt.run(req.body.nickname, req.body.story, new Date(Date.now()).toISOString())
        stmt.finalize()
    })
    res.sendStatus(200)
})

app.get("/heartbreaks", (req, res) => {
    let sql = 'SELECT * FROM posts ORDER BY date DESC LIMIT ? OFFSET ?';
    const Stories = [];

    db.all(sql, [PostsPerPage, req.query.pageNum * PostsPerPage], (err, rows) => {
         if (err) {
              throw err;
        }
        rows.forEach((row) => {
            console.log(row);
            Stories.push(row);
        });

        res.json(Stories);    
    });
})

app.use(express.static('frontend'))

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`)
})