const express = require('express');
const app = express();

const jwt = require('jsonwebtoken')

const { expressjwt: exjwt } = require('express-jwt')
const bodyParser = require('body-parser');
const path = require('path');

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Headers', 'Content-type,Authorization');
    next();
});
 

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


const PORT = 3000;

const secretKey = 'My super secret key';
const jwtMW = exjwt({
    secret: secretKey,
    algorithms: ['HS256']
});

let users = [
    {
        id:1,
        username: 'fabio',
        password: '123'
    },
    {
        id: 2,
        username:'nolasco',
        password:'456'
    }
];

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    // Fix for 'Cannot set headers after they are sent to the client'
    let userFound = false;
    for (let user of users) {
        if (username == user.username && password == user.password) {
            let token = jwt.sign({ id: user.id, username: user.username }, secretKey, {
                expiresIn: '3m'
            });
            res.json({
                success: true,
                err: null,
                token
            });
            userFound = true;
            break;
        }
    }

        if (!userFound) {
                res.status(401).json({
                    success: false,
                    token: null,
                    err: 'Username or password is incorrect'
                });
            }
});

app.get('/api/dashboard', jwtMW, (req, res) => {
    res.json({
        success: true,
        myContent: 'Secret content that only logged in people can see!!!'
    });
});

app.get('/api/prices', jwtMW, (req, res) => {
    res.json({
        success: true,
        myContent: 'This is the price $3.99'
    });
});

app.get('/api/settings', jwtMW, (req, res) => {
    res.json({
        success: true,
        myContent: 'Settings content that only logged in people can see!!!'
    });
});

// Updated for client-side routing
app.get(['/', '/dashboard', '/settings'], (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.use(function (err, req, res, next) {
    if (err.name === 'UnauthorizedError') {
        res.status(401).json({
            success: false,
            officialError: err,
            err: 'Username or password is incorrect 2'
        });
    } else {
        next(err);
    }
});

app.listen(PORT, () => {
    console.log(`Serving on ${PORT}`);
});
