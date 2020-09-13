const express = require("express");
const mysql = require('mysql');
const app = express();

var conn = mysql.createConnection({
  host:'localhost',
  user:'root',
  password:'Adity@75',
  database:'Public_Verdict'
});

conn.connect(function(err){
  if(err) throw err;
  console.log('Connected')
});


// Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded({ extended: true }))
// Parse JSON bodies (as sent by API clients)
app.use(express.json());
app.set("view engine", "ejs");

app.get('/',(req,res) =>{
  res.redirect('/1');
})

app.get('/:id',(req, res) => {
  var _id = req.params.id;
  var sql = 'SELECT MAX(ID) as MAX FROM issues';
  conn.query(sql , function(err,result) {
    if(err){
      res.end("Some Error Occured");
    }
    if(_id > result[0].MAX || _id <=0 ){
      res.end("It Seems You have answered All the questions | Thank You for your support | Please Come After Sometime to view new questions.")
    }
  });
  if(_id != 'favicon.ico'){
    var sql = "SELECT * FROM issues WHERE ID = "+ _id +";";
    conn.query(sql, function (err, result) {
      if (err){
        console.log(err.message);
        res.end("error");
      }
      console.log(result[0])
      res.render('main.ejs', result[0]);
    });
  }else {
    res.end("Error")
  }
});

app.get('/verdict/create',(req, res) => {
  res.render('create_poll.ejs');
});

app.get('/verdict/search',(req, res) => {
  res.render('find_poll.ejs');
});

app.post('/submitPoll',(req,res)=>{

  res.setHeader('content-type', 'application/json');

  var sql = "INSERT INTO issues (heading, description , option_1  , option_2 , option_1_votes  , option_2_votes) VALUES ("+"'"+req.body.issue_heading+"','"+req.body.issue_description+"','"+req.body.option_1+"','"+req.body.option_2+"',0,0);";
  conn.query(sql, function (err, result) {
    if (err){
      res.end("error")
    }
    res.end(String(result.insertId));
  });
});

app.post('/submitOption1' , (req,res)=>{

  res.setHeader('content-type', 'application/json');
  var sql = "UPDATE issues SET option_1_votes = option_1_votes + 1 WHERE ID = " + req.body.id + ";";
  conn.query(sql, function(err,result){
    if(err){
      res.end("error")
    }else{
      res.end("success");
    }
  })
});

app.post('/submitOption2' , (req,res)=>{

  res.setHeader('content-type', 'application/json');
  var sql = "UPDATE  issues SET option_2_votes = option_2_votes + 1 WHERE ID = " + req.body.id + ";";
  conn.query(sql, function(err,result){
    if(err){
      res.end("error")
    }else{
      res.end("success");
    }
  })
});

app.post('/searchPoll', (req,res)=>{
  res.setHeader('content-type', 'application/json');
  var stopwords = ["a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any","are","aren't","as","at","be","because","been","before","being","below","between","both","but","by","can't","cannot","could","couldn't","did","didn't","do","does","doesn't","doing","don't","down","during","each","few","for","from","further","had","hadn't","has","hasn't","have","haven't","having","he","he'd","he'll","he's","her","here","here's","hers","herself","him","himself","his","how","how's","i","i'd","i'll","i'm","i've","if","in","into","is","isn't","it","it's","its","itself","let's","me","more","most","mustn't","my","myself","no","nor","not","of","off","on","once","only","or","other","ought","our","ours","ourselves","out","over","own","same","shan't","she","she'd","she'll","she's","should","shouldn't","so","some","such","than","that","that's","the","their","theirs","them","themselves","then","there","there's","these","they","they'd","they'll","they're","they've","this","those","through","to","too","under","until","up","very","was","wasn't","we","we'd","we'll","we're","we've","were","weren't","what","what's","when","when's","where","where's","which","while","who","who's","whom","why","why's","with","won't","would","wouldn't","you","you'd","you'll","you're","you've","your","yours","yourself","yourselves"];
  var keyword_array = req.body.search_word.split(" ");
  filtered_array = keyword_array.filter(n => !stopwords.includes(n));
  console.log(filtered_array);
  query = []
  for(i = 0 ; i < filtered_array.length ; i++){
    sql = 'SELECT * FROM issues WHERE heading LIKE "%'+filtered_array[i]+'%" AND ID != 1 ';
    query.push(sql);
  }
  conn.query(query.join(" UNION ") , function(err, result) {
    if(err){
      res.end("error")
    }
    else {
      console.log(result)
      res.send(result)
    }
  });
  res.setHeader('content-type','application/json');

});

app.listen(3000, () => console.log("Server Up and running"));
