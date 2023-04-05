'use strict';

const express = require('express');
const favicon = require('serve-favicon');
const bodyParser = require('body-parser');
const session = require('express-session');
const consolidate = require('consolidate'); // Templating library adapter for Express
const swig = require('swig');
const MongoClient = require('mongodb').MongoClient; // Driver for connecting to MongoDB
const http = require('http');
const marked = require('marked');
const app = express(); // Web framework to handle routing requests
const routes = require('./app/routes');
const { port, db, cookieSecret } = require('./config/config'); // Application config properties
const fs = require('fs');
const https = require('https');
const path = require('path');
const helmet = require('helmet');

MongoClient.connect(db, (err, db) => {
  if (err) {
    console.log('Error: DB: connect');
    console.log(err);
    process.exit(1);
  }
  console.log(`Connected to the database`);

  app.use(express.csrf());
  app.use(function (req, res, next) {
    res.locals.csrftoken = req.csrfToken();
    next();
  });

  app.disable('x-powered-by');
  app.use(helmet.xframe());
  app.use(helmet.noCache());
  app.use(helmet.csp());
  app.use(helmet.hsts());
  app.use(nosniff());
  // Adding/ remove HTTP Headers for security
  app.use(favicon(__dirname + '/app/assets/favicon.ico'));

  app.use(express.cookieParser());

  // Express middleware to populate "req.body" so we can access POST variables
  app.use(bodyParser.json());
  app.use(
    bodyParser.urlencoded({
      // Mandatory in Express v4
      extended: false,
    })
  );

  // Enable session management using express middleware
  app.use(
    session({
      secret: cookieSecret,
      // Both mandatory in Express v4
      saveUninitialized: true,
      resave: true,
      key: 'sessionId',
      cookie: {
        httpOnly: true,
        secure: true,
      },
    })
  );

  // Register templating engine
  app.engine('.html', consolidate.swig);
  app.set('view engine', 'html');
  app.set('views', `${__dirname}/app/views`);
  app.use(express.static(`${__dirname}/app/assets`));

  // Initializing marked library
  marked.setOptions({
    sanitize: true,
  });
  app.locals.marked = marked;

  // Application routes
  routes(app, db);

  // Template system setup
  swig.init({
    root: __dirname + '/app/views',
    autoescape: true, //default value
  });

  // HTTP connection
  http.createServer(app).listen(port, () => {
    console.log(`Express http server listening on port ${port}`);
  });
});
