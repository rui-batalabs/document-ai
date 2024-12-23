import dotenv from 'dotenv';
import express from 'express';
import session from 'express-session';
import routes from './routes/index.js';
import exphbs from 'express-handlebars';

dotenv.config({path: './.env'});

const app = express();
const PORT = 3000;
const rewriteUnsupportedBrowserMethods = (req, res, next) => {
    if (req.body && req.body._method) {
      req.method = req.body._method;
      delete req.body._method;
    }
    // let the next middleware run:
    next();
  };

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use(express.static('public'));
app.use('/static', express.static('static'));
app.use(rewriteUnsupportedBrowserMethods);

app.use(
    session({
        name: 'cookieKey',
        secret: 'super_secret_key',
        resave: false,
        saveUninitialized: true,
        cookie: {maxAge: 1800000},
    })
);

app.engine(
    'handlebars',
    exphbs.engine({
        defaultLayout: 'main',
        layoutsDir: 'views/layouts',
        partialsDir: 'views/partials',
    })
);
app.set('view engine', 'handlebars');

app.use('/', routes);

app.use((req, res) =>{
    res.redirect('/');
})
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
