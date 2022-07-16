const mongoose = require('mongoose');
const User = require('./Users');
const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');

app.use(cors({
    origin: '*'
}));

app.use(
    bodyParser.json()
)

mongoose.connect('mongodb://localhost:27017/thesoup', () => {
    console.log('Connected to mongodb');
}, err => {
    console.log(err);
});

app.delete('/users/:id', (req, res) => {
    User.findByIdAndRemove(req.params.id, (err, user) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.send('Deleted: ' + req.params.id);
        }
    });
});

app.put('/users/:id', (req, res) => {
    User.findById(req.params.id, function(err, user) {
        if (!user)
            return next(new Error('Could not load Document'));
        else {
            user.name = req.body.name ? req.body.name : user.name;
            user.email = req.body.email ? req.body.email : user.email;
            user.password = req.body.password ? req.body.password : user.password;
            user.save(function(err) {
                if (err)
                    console.log('Error in Saving user: ' + err);
                else
                    console.log('Updated User')
            });
        }
    });
});


app.post('/users', async(req, res) => {
    //const user = new User(req.body);
    //user.save((err, user) => {
    //    if (err) {
    //        res.send(err);
    //    }
    //    console.log(user)
    //    res.send('User Added');
    //});

    const user = await User.create(req.body)
    res.send(user);
});

app.get('/users', async(req, res) => {
    User.find({}, (err, users) => {
        if (err) {
            res.send(err);
        }
        res.send(users);
    });
});

app.listen(5000, () => {
    console.log('listening on port 5000');
});