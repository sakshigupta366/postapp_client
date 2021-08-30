const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const authenticate = require('../middleware/authenticate');
const mongoose = require('mongoose');
const Post =require("../models/posts");

router.get('/', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.json("location is root.")
});

router.post('/register', async (req, res) => {
  // res.setHeader('Content-Type', 'application/json');
  const { email, username, password } = req.body;
  if ( !email || !username || !password) {
    return res.status(422).json({ error: "please fill the fields properly" })
  }
  try {
    const userExist = await User.findOne({ email: email });
    if (userExist) {
      return res.status(422).json({ error: "Email already Exist" });
    }
    const user = new User({ email, username, password });
    await user.save();
    res.status(200).json({ message: "user registered successfully" });
  }
  catch (err) {
    console.log(err);
  }
});

router.get('/profile', authenticate, (req, res, next) => {
  // res.setHeader('Content-Type', 'application/json');
  res.status(200).json({ user: req.user, message: "you are in the profile route." });
});

router.post('/signin', async (req, res, next) => {
  // res.setHeader('Content-Type', 'application/json');
  try {
    let token;
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "please fill the data" });
    }
    const userLogin = await User.findOne({ email: email });
    if (userLogin) {
      const isMatch = await bcrypt.compare(password, userLogin.password);
      token = await userLogin.generateAuthToken();
      console.log(token);
      console.log(userLogin);
      // storing token into cookies
      // res.cookie('token', token, {
      //   expires: new Date(Date.now() + 25892000000),   //30days in ms
      //   httpOnly: true
      // });
      if (!isMatch) {
        res.status(400).json({ error: "invalid credentials" });
      }
      else {
        res.json({ message: "user sign-in successfully", token: token });
      }
    }
    else {
      res.status(400).json({ error: "invalid credentials" });
    }
  }
  catch (err) {
    console.log(err);
  }
});

router.post('/createpost', authenticate, (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  const { title, body } = req.body
  if (!title || !body) {
    return res.status(422).json({ error: "Plase add all the fields" })
  }
  const post = new Post({
    title,
    body, postedBy: req.userId
  })
  post.save().then(result => {
    res.json({ post: result })
  })
    .catch(err => {
      console.log(err)
    })
})

router.put('/like',authenticate,(req,res)=>{
    Post.findByIdAndUpdate(req.body.postId,{
        $push:{likes:req.userId}
    },{
        new:true
    }).exec((err,result)=>{
        if(err){
            return res.status(422).json({error:err})
        }else{
            res.json(result)
        }
    })
})

router.put('/unlike', authenticate, (req, res) => {
  Post.findByIdAndUpdate(req.body.postId, {
    $pull: { likes: req.userId }
  }, {
    new: true
  }).exec((err, result) => {
    if (err) {
      return res.status(422).json({ error: err })
    } else {
      res.json(result)
    }
  })
})


router.put('/comment', authenticate, (req, res) => {
  const comment = {
    text: req.body.text,
    postedBy: req.userId
  }
  Post.findByIdAndUpdate(req.body.postId, {
    $push: { comments: comment }
  }, {
    new: true
  })
    .populate("comments.postedBy", "_id name")
    .populate("postedBy", "_id name")
    .exec((err, result) => {
      if (err) {
        return res.status(422).json({ error: err })
      } else {
        res.json(result)
      }
    })
})



router.get('/getposts', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  Post.find((err, data) => {
    if (err) {
      res.json({ err: err });
    }
    else
      res.json({ posts: data });
  });
});

module.exports = router;
