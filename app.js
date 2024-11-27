import express from 'express';
import session from 'express-session';
import routes from './routes/index.js';
import exphbs from 'express-handlebars'

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use('/static', express.static('static'))
app.use(session({
  secret: 'super_secret_key',
  resave: false,
  saveUninitialized: true,
  cookie: {maxAge: 600000}
}));
app.engine('handlebars', exphbs.engine({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

app.use('/', routes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

