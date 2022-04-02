var express        =         require('express');
var bodyParser     =         require('body-parser');
var app            =         express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post('/api/user/register', function(req, res) {
  res.status(200).json({
    userId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    email: req.body.email,
    active_status: true,
    session_id: '0x12345',
    img_url: null,
    agreed_18: true,
    agreed_privacy: true
  });
});

app.listen(5000, function() {
  console.log('Started on PORT 5000');
});