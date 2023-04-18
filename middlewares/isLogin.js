const appErr = require("../utils/appErr");
const getTokenFromHeader = require("../utils/getTokenFromHeader");
const verifyToken = require("../utils/verifyToken");


const isLogin = (req, res, next) => {
    //get token from header
    const token = getTokenFromHeader(req)
        //verify the toket
    const decodedUser = verifyToken(token)
        //save the user in req obj
    req.userAuth = decodedUser.id;
    if (!decodedUser) {
        return next(appErr('Invalid/Expired token, please login again', 500))
    } else {
        next()
    }
}

module.exports = isLogin