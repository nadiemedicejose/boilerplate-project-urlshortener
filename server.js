require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const dns = require('dns');

// Basic Configuration
const port = process.env.PORT || 3000;

// Database Setup
const DB_URI = process.env['DB_URI'];
mongoose.connect(DB_URI, {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false});

app.use(cors());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

/**
 * TODO: Create a short url schema called shortUrlSchema.
 * TODO: Create a model called ShortUrl from the shortUrlSchema.
 */
const Schema = mongoose.Schema;

const shortUrlSchema = new Schema({
  original_url: {type: String, required: true},
  short_url: {type: Number, required: true}
});

const ShortUrl = mongoose.model('ShortUrl', shortUrlSchema);

/**
 * TODO: POST a URL to /api/shorturl and get a JSON response with original_url and short_url properties.
 * Here's an example: { original_url : 'https://freeCodeCamp.org', short_url : 1}
 * NOTE: Do not forget to use a body parsing middleware to handle the POST requests.
 * You can use the function dns.lookup(host, cb) from the dns core module to verify a submitted URL.
 */
app.post('/api/shorturl', (req, res, done) => {
  const inputUrl = req.body.url;
  const lookupUrl = inputUrl.replace("https://", "");
  // console.log(inputUrl); // get input url

  dns.lookup(lookupUrl, (err, address, family) => {
    if (err) res.json({ error: 'Invalid url' });
    else {
      ShortUrl.countDocuments({}, (err, count) => {
        if (err) return console.error(err);

        ShortUrl.findOne({original_url: inputUrl}, (err, doc) => {
          if (err) return console.error(err);

          if (doc == null) {
            var _shortUrl = new ShortUrl({
              original_url: inputUrl,
              short_url: count + 1
            });
            _shortUrl.save();

            res.json({
              original_url: _shortUrl.original_url,
              short_url: _shortUrl.short_url
            });
          } else {
            res.json({
              original_url: doc.original_url,
              short_url: doc.short_url
            });
          }
        });
      });
    }
  });
});

/**
 * TODO: When you visit /api/shorturl/<short_url>, you will be redirected to the original URL.
 */
app.get('/api/shorturl/:urlId', (req, res) => {
  let urlId = Number(req.params.urlId);

  ShortUrl.findOne({short_url: urlId}, (err, doc) => {
    if (err) res.json({err: err})
    else if (doc.length == 0) {
      res.json({
        error: "No short URL found for the given input"
      });
    } else {
      res.redirect(doc.original_url);
    }
  });  
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
