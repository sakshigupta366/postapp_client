const mongoose = require("mongoose");
const express = require("express");
const app = express();
const employees = require('./model');
const router = express.Router();
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const cors = require('cors');
const port = 5000;

app.use(cors());

var uri = "mongodb://localhost:27017/postapp";
mongoose.connect(uri, { useUnifiedTopology: true, useNewUrlParser: true });

const connection = mongoose.connection;

connection.once("open", function () {
    console.log("MongoDB database connection established successfully");
});

// create application/json parser
app.use(bodyParser.json())

// create application/x-www-form-urlencoded parser
app.use(bodyParser.urlencoded({ extended: false }))
app.use("/", router);
app.use(authRoutes);
app.use(userRoutes);
app.get('/', (req, res) => {
    // res.setHeader('Content-Type', 'application/json');
    res.json({ status: "ok", message: "You are in the root route" });
 
});
app.post('/', (request, response) => {
    response.setHeader('Content-Type', 'application/json');
    const emp = new employees({
        name: request.body.name        
    })
    emp.save()
        .then(data => {
            response.json(data)
        }).catch(error => {
            response.json(error)
        })
})

app.listen(port, function () {
    console.log("Server is running on Port: " + port);
});