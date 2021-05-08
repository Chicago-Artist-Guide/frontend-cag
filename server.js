var express        =         require("express");
var bodyParser     =         require("body-parser");
var app            =         express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post('/api/user/sign_up', function(req, res) {
  res.status(200).end('success');
});

app.listen(5000, function() {
  console.log("Started on PORT 5000");
});