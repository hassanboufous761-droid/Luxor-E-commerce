const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
console.log('>>> [STABILITY_V7_FINAL] LUXOR ENGINE STARTING ON PORT ' + PORT + ' <<<');

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'luxury_secret',
    resave: false,
    saveUninitialized: true
}));

// Routes
const apiRoutes = require('./routes/api');
const adminRoutes = require('./routes/admin');

app.use('/api', apiRoutes);
app.use('/admin', adminRoutes);

// Home route redirect to public/index.html (handled by express.static)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`>>> [SERVER_ONLINE] LUXOR ACCESSIBLE ON NETWORK <<<`);
    console.log(`Local machine: http://localhost:${PORT}`);
    console.log(`Any device on same network: http://192.168.1.74:${PORT}`);
});
