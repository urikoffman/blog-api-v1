const express = require('express')
const storage = require('../../config/cloudinary');
const multer = require("multer");
const { createPostCtrl, fetchPostsCtrl, deletePostCtrl, toggleLikesPostCtrl, updatepostCtrl, toggleDisLikesPostCtrl, postDetailsCtrl } = require('./../../controllers/posts/postCtrl');
const isLogin = require('../../middlewares/isLogin');
const postRouter = express.Router()
const upload = multer({ storage })

postRouter.post('/', isLogin, upload.single('image'), createPostCtrl)
    //GET/api/v1/posts/likes/:id
postRouter.get('/likes/:id', isLogin, toggleLikesPostCtrl)
    //GET/api/v1/posts/dislikes/:id
postRouter.get('/dislikes/:id', isLogin, toggleDisLikesPostCtrl)
    //GET/api/v1/posts/:id
postRouter.get('/:id', isLogin, postDetailsCtrl)
    //GET/api/v1/posts
postRouter.get('/', isLogin, fetchPostsCtrl)
    //DELETE/api/v1/posts/:id
postRouter.delete('/:id', isLogin, deletePostCtrl)
    //PUT/api/v1/posts/:id

postRouter.put("/:id", isLogin, upload.single("image"), updatepostCtrl);
module.exports = postRouter