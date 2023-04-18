const User = require("../model/User/User");
const appErr = require("../utils/appErr");
const getTokenFromHeader = require("../utils/getTokenFromHeader");
const verifyToken = require("../utils/verifyToken");



const isAdmin = async(req, res, next) => {
    //get token from header
    const token = getTokenFromHeader(req)
        //verify the toket
    const decodedUser = verifyToken(token)
        //save the user in req obj
    req.userAuth = decodedUser.id;

    const user = await User.findById(decodedUser.id)
    if (user.isAdmin) {
        return next()
    } else {
        return next(appErr('Admins only', 403))
    }


}

module.exports = isAdmin