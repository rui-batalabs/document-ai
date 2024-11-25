import express from 'express';
import { engine } from 'express-handlebars';
import path from 'path';
//import helmet from 'helmet';
//import morgan from 'morgan';
//import dotenv from 'dotenv';

// Load environment variables
//dotenv.config();

const app = express();

// Set security HTTP headers
//app.use(helmet());

// Enable request logging
//app.use(morgan('dev'));

// Set up Handlebars engine
app.engine('hbs', engine({ extname: '.hbs' }));
app.set('view engine', 'hbs');
app.set('views', path.resolve('views')); // Using `path.resolve` to handle absolute paths

// Serve static files from the "dist" directory with cache control
app.use(
    '/dist',
    express.static(path.resolve('dist'), {
        maxAge: '1d', // Cache static assets for 1 day
    })
);

// Define routes
app.get('/', (req, res) => {
    res.render('index');
});

// Handle 404 errors for unmatched routes
app.use((req, res, next) => {
    res.status(404).send('Page Not Found');
});

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Internal Server Error');
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});



/* //original
const express = require('express');
const { engine } = require('express-handlebars');
const path = require('path');

const app = express();

app.engine('hbs', engine({ extname: '.hbs' }));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files from the "dist" directory
app.use(express.static(path.join(__dirname, 'dist')));

// Define a route
app.get('/', (req, res) => {
    res.render('index');
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
*/
