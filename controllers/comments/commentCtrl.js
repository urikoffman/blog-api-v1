const Comment = require("../../model/Comment/Comment");
const Post = require("../../model/Post/Post");
const User = require("../../model/User/User");
const appErr = require("../../utils/appErr");

const createCommentCtrl = async(req, res, next) => {
    const { description } = req.body
    try {
        //find the post
        const post = await Post.findById(req.params.id)
            //find the user
        const user = await User.findById(req.userAuth)
            //create the comment
        const comment = await Comment.create({
                post: post._id,
                description,
                user: req.userAuth
            })
            //push the comment to the post
        post.comments.push(comment._id)
            //push to the user
        user.comments.push(comment._id)
            //save
        await post.save({ validateBeforeSave: false })
        await user.save({ validateBeforeSave: false })
        res.json({
            status: 'success',
            data: comment
        })
    } catch (error) {
        return next(appErr(error.message))
    }
}

const updateCommentCtrl = async(req, res, next) => {
    const { description } = req.body
    try {
        const comment = await Comment.findById(req.params.id);
        if (comment.user.toString() !== req.userAuth.toString()) {
            return next(appErr("You are not allowed to update this comment", 403));
        }
        const category = await Comment.findByIdAndUpdate(req.params.id, { description }, { new: true, runValidators: true })
        res.json({
            status: 'success',
            data: category
        })
    } catch (error) {
        return next(appErr(error.message))
    }
}
const deleteCommentCtrl = async(req, res, next) => {
    try {
        const comment = await Comment.findById(req.params.id);
        if (comment.user.toString() !== req.userAuth.toString()) {
            return next(appErr("You are not allowed to update this comment", 403));
        }
        await Comment.findByIdAndDelete(req.params.id)
        res.json({
            status: 'success',
            data: 'Comment deleted!'
        })
    } catch (error) {
        return next(appErr(error.message))
    }
};

module.exports = { createCommentCtrl, updateCommentCtrl, deleteCommentCtrl }