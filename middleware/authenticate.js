const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Authenticate = async (req, res, next) => {
    try {
        var token = req.headers.authorization;
        console.log("header-auth:", req.headers);
        console.log('jwt', token);
        var verifyUser = jwt.verify(token, 'secretkey');      //to verify currentuser_id   
        console.log("verify userrrrrr",verifyUser);  
        var rootUser = await User.findOne({_id:verifyUser, 'tokens.token': token });
        console.log(rootUser);
        if (!rootUser) {
            throw new Error('user not found');
        }
        req.token = token;
        req.rootUser = rootUser; 
        req.userId = rootUser._id;
        next();
    }
    catch (err) {
        res.status(401).send('unauthorized:no token provided');
        console.log(err);
    }
}
module.exports = Authenticate;