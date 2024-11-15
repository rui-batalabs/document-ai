//adapting...

import express from 'express';
import exphbs from 'express-handlebars';

const app = express();
import session from 'express-session';
import configRoutes from './routes/index.js';

app.use(express.json());

app.use(
  session({
    name: 'Document-AI',
    secret: "Why am I a secret.. Are you ashamed of me?",
    saveUninitialized: false,
    resave: false,
    cookie: {maxAge: 60000}
  })
);

app.use('/private', (req, res, next) => {
  console.log(req.session.id);
  if (!req.session.user) {
    return res.redirect('/');
  } else {
    next();
  }
});

app.use('/login', (req, res, next) => {
  if (req.session.user) {
    return res.redirect('/private');
  } else {
    //here I',m just manually setting the req.method to post since it's usually coming from a form
    req.method = 'POST';
    next();
  }
});

configRoutes(app);

app.listen(3000, () => {
  console.log("We've now got a server!");
  console.log('Your routes will be running on http://localhost:3000');
});
