// Import express to create and configure the HTTP server.
var express = require('express');
var sqlite3 = require('sqlite3').verbose();
var fs = require('fs');
var bodyParser = require('body-parser');
// Create a HTTP server app.
var app = express();
app.use(bodyParser());
var db = new sqlite3.Database(':memory:');

var data = JSON.parse(fs.readFileSync('diamonds.json','utf8'));

db.serialize(function(){
  db.run("CREATE TABLE diamonds (id INTEGER PRIMARY KEY NOT NULL, carat REAL, cut TEXT, color TEXT,clarity TEXT,depth REAL,tablefield INTEGER,price REAL,x REAL,y REAL,z REAL)");
  var stmt = db.prepare("INSERT INTO diamonds VALUES (NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
  data.forEach(function(entry){
    stmt.run(entry.carat, entry.cut, entry.color, entry.clarity, entry.depth, entry.table, entry.price, entry.x, entry.y, entry.z);
  });
  stmt.finalize();
});

// When a user goes to /, return a small help string.
app.get('/', function(req, res) {
  res.send("This is the Diamond API.");
});

app.get('/diamonds/:id', function(req, res){
  var responseText;
  db.each("SELECT * from diamonds where id = " + req.params.id, function(err, row){
    res.send("Carat: " + row.carat + "\t Cut: " + row.cut + "\t Color: " + row.color + "\t Clarity: " + row.clarity + "\t Depth: " + row.depth + "\t Table: " + row.tablefield + "\t Price: $" + row.price + "\n<br>");
  });

});

app.post('/diamonds/add/', function(req, res){
  var stmt = db.prepare("INSERT INTO diamonds VALUES (NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
  stmt.run(req.body.carat, req.body.cut, req.body.color, req.body.clarity, req.body.depth, req.body.table, req.body.price, req.body.x, req.body.y, req.body.z);
  stmt.finalize();
  res.send("Diamond Added\n");
});

app.put('/diamonds/edit/:id', function(req, res){
  var stmt = db.prepare("INSERT INTO diamonds VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
  stmt.run(req.params.id, req.body.carat, req.body.cut, req.body.color, req.body.clarity, req.body.depth, req.body.tablefield, req.body.price, req.body.x, req.body.y, req.body.z);
  stmt.finalize();
  res.send("Diamond " + req.params.id + " edited.\n");
});

app.delete('/diamonds/delete/:id', function(req, res){
  var stmt = db.prepare("DELETE from diamonds where id = ?");
  stmt.run(req.params.id);
  stmt.finalize();
  res.send("Delted diamond " + req.params.id);
});

// Start the server.
var server = app.listen(8000);
