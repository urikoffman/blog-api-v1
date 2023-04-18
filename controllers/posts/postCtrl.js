const Post = require("../../model/Post/Post");
const User = require("../../model/User/User");
const appErr = require("../../utils/appErr");


Post

const createPostCtrl = async(req, res, next) => {
    const { title, description, category } = req.body;
    try {
        //Find the user
        const author = await User.findById(req.userAuth);
        //check if the user is blocked
        if (author.isBlocked) {
            return next(appErr("Access denied, account blocked", 403));
        }


        //Create the post
        const postCreated = await Post.create({
            title,
            description,
            user: author._id,
            category,
            photo: req && req.file && req.file.path

        });
        //Associate user to a post -Push the post into the user posts field
        author.posts.push(postCreated);
        //save
        await author.save();
        res.json({
            status: "success",
            data: postCreated,
        });
    } catch (error) {
        next(appErr(error.message));
    }
};
//fetch posts
const fetchPostsCtrl = async(req, res, next) => {
    try {
        const posts = await Post.find({}).populate('user').populate('category', 'title')
        const filteredPosts = posts.filter((post) => {
            const blockedUsers = post.user.blocked;
            const isBlocked = blockedUsers.includes(req.userAuth);
            // console.log(isBlocked);
            // return isBlocked ? null : post
            return !isBlocked
        })
        res.json({
            status: 'success',
            data: filteredPosts
        })
    } catch (error) {
        next(appErr(error.message));
    }
};
//toglle dislikes posts
const toggleDisLikesPostCtrl = async(req, res, next) => {
    try {
        const post = await Post.findById(req.params.id)
        const isUnliked = post.disLikes.includes(req.userAuth)
        if (isUnliked) {
            post.disLikes = post.disLikes.filter(disLikes => disLikes.toString() !== req.userAuth.toString());
            await post.save()
        } else {
            post.disLikes.push(req.userAuth)
            await post.save()
        }
        res.json({
            status: 'success',
            data: post
        })
    } catch (error) {
        next(appErr(error.message));
    }
};
//toglle likes posts
const toggleLikesPostCtrl = async(req, res, next) => {
    try {
        const post = await Post.findById(req.params.id)
        const isLiked = post.likes.includes(req.userAuth)
        if (isLiked) {
            post.likes = post.likes.filter(like => like.toString() !== req.userAuth.toString());
            await post.save()
        } else {
            post.likes.push(req.userAuth)
            await post.save()
        }
        res.json({
            status: 'success',
            data: 'post liked by you!'
        })
    } catch (error) {
        next(appErr(error.message));
    }
};
const postDetailsCtrl = async(req, res, next) => {
    try {
        const post = await Post.findById(req.params.id)
        const isViewed = post.numViews.includes(req.userAuth);
        if (isViewed) {
            res.json({
                status: 'success',
                data: post
            })
        } else {
            post.numViews.push(req.userAuth)
            await post.save()
            res.json({
                status: 'success',
                data: post
            })
        }
    } catch (error) {
        const postDetailsCtrl = async(req, res, next) => {
            try {
                //find the post
                const post = await Post.findById(req.params.id);
                //Number of view
                //check if user viewed this post
                const isViewed = post.numViews.includes(req.userAuth);
                if (isViewed) {
                    res.json({
                        status: "success",
                        data: post,
                    });
                } else {
                    //pust the user into numOfViews

                    post.numViews.push(req.userAuth);
                    //save
                    await post.save();
                    res.json({
                        status: "success",
                        data: post,
                    });
                }
            } catch (error) {
                next(appErr(error.message));
            }
        };
    }
};
const deletePostCtrl = async(req, res, next) => {
    try {
        const post = await Post.findById((req.params.id))
        if (post.user.toString() !== req.userAuth.toString()) {
            return next(appErr('You are not allowed!', 403))
        }
        await Post.findOneAndDelete(req.params.id)
        res.json({
            status: 'success',
            data: 'Post deleted'
        })
    } catch (error) {
        next(appErr(error.message));
    }
};
const updatepostCtrl = async(req, res, next) => {
    const { title, description, category } = req.body;
    try {
        //find the post
        const post = await Post.findById(req.params.id);
        //check if the post belongs to the user

        if (post.user.toString() !== req.userAuth.toString()) {
            return next(appErr("You are not allowed to delete this post", 403));
        }
        await Post.findByIdAndUpdate(
            req.params.id, {
                title,
                description,
                category,
                photo: req && req.file && req.file.path
            }, {
                new: true,
            }
        );
        res.json({
            status: "success",
            data: post,
        });
    } catch (error) {
        next(appErr(error.message));
    }
};

module.exports = { createPostCtrl, postDetailsCtrl, deletePostCtrl, fetchPostsCtrl, toggleLikesPostCtrl, toggleDisLikesPostCtrl, updatepostCtrl }