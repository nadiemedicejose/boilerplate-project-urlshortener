require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const dns = require("dns");
const url = require("url");

// Basic Configuration
const port = process.env.PORT || 3000;

// Database setup
const mongoose = require("mongoose");
const DB_URI = process.env.DB_URI;
mongoose.connect(DB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

// Schema and model
const { Schema } = mongoose;
const shortUrlSchema = new Schema({
  url: {type: String, required: true}
});
const ShortUrl = mongoose.model('ShortUrl', shortUrlSchema);

app.use(cors());
app.use(express.urlencoded({extended: false})); // body-parser is deprecated
app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// TODO: POST a URL to /api/shorturl and get a JSON response with original_url and short_url properties.
app.post('/api/shorturl', (req, res) => {
  const inputUrl = req.body.url;
  let urlObject = url.parse(inputUrl, true);
  const hostname = urlObject.hostname;

  dns.lookup(hostname, (error, address) => {
    /**
     * TODO: If you pass an invalid URL that doesn't follow the valid format, the JSON response will be as mentioned:
     * Valid format: http://www.example.com
     * JSON response: { error: 'invalid url' }
     */
    if( !address ) {
      res.json({error: "Invalid URL"});
    } else {
      const url = new ShortUrl({url: inputUrl});
      
      url.save((err, data) => {
        res.json({
          original_url: data.url,
          short_url: data.id
        });
      });
    }
  });
});

// TODO: When you visit /api/shorturl/<short_url>, you will be redirected to the original URL.
app.get('/api/shorturl/:urlId', (req, res) => {
  const urlId = req.params.urlId;

  ShortUrl.findById(urlId, (err, data) => {
    if ( !data ) {
      res.json({error: "Invalid URL"});
    } else { 
      res.redirect(data.url);
    }
  });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
