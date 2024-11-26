import express from 'express';
import session from 'express-session';
import routes from './routes/index.js';

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({
  secret: 'super_secret_key',
  resave: false,
  saveUninitialized: true,
}));

app.use('/', routes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

