const bcrypt = require('bcryptjs')
const User = require("./../../model/User/User");
const generateToken = require('../../utils/generateToken');
const getTokenFromHeader = require('../../utils/getTokenFromHeader');
const appErr = require('./../../utils/appErr');
const Post = require('../../model/Post/Post');
const Category = require('../../model/Category/Category');
const Comment = require('../../model/Comment/Comment');


//Register
const userRegisterCtrl = async(req, res, next) => {
        const { firstname, lastname, email, password } = req.body
        try {
            //Check if email exists
            const userFound = await User.findOne({ email })
            if (userFound) {
                return next(appErr("User already exists", 500))
            }
            //hash password
            const salt = await bcrypt.genSalt(10)
            const hashedPassword = await bcrypt.hash(password, salt)
                //create user
            const user = User.create({ firstname, lastname, email, password: hashedPassword })
            res.json({
                status: 'success',
                data: user
            })
        } catch (error) {
            next(appErr(error.message))
        }
    }
    //Login
const userLoginCtrl = async(req, res, next) => {
        const { email, password } = req.body;
        try {
            //check if email exsits
            const userFound = await User.findOne({ email })
            if (!userFound) {
                return next(appErr('Invalid login credentials'))

            }
            //verify password
            const isPasswordMatched = await bcrypt.compare(password, userFound.password)
            if (!isPasswordMatched) {
                return next(appErr('Invalid login credentials'))

            }
            res.json({
                status: 'success',
                data: {
                    firstname: userFound.firstname,
                    lastname: userFound.lastname,
                    email: userFound.email,
                    isAdmin: userFound.isAdmin,
                    token: generateToken(userFound._id)
                }
            })
        } catch (error) {
            next(appErr(error.message))
        }
    }
    //Profile
const userProfileCtrl = async(req, res, next) => {
        try {
            const user = await User.findById(req.userAuth)
            res.json({
                status: 'success',
                data: user
            })
        } catch (error) {
            next(appErr(error.message))
        }
    }
    //Following
const followingCtrl = async(req, res, next) => {
        try {
            const userToFollow = await User.findById(req.params.id)
            const userWhoFollowed = await User.findById(req.userAuth)
            if (userToFollow && userWhoFollowed) {
                const isUserAlreadyFollowed = userToFollow.following.find(follower => {
                    follower.toString() === userWhoFollowed._id.toString()
                })
                if (isUserAlreadyFollowed) {
                    return next(appErr('Already following!'))
                } else {
                    userToFollow.followers.push(userWhoFollowed._id)
                    userWhoFollowed.following.push(userToFollow._id)
                    await userToFollow.save()
                    await userWhoFollowed.save()
                    res.json({
                        status: 'success',
                        data: 'You are now following this user'
                    })
                }
            }
        } catch (error) {
            next(appErr(error.message))
        }
    }
    //Unfollow
const unFollowCtrl = async(req, res, next) => {
        try {
            const userToBeUnfollowed = await User.findById(req.params.id)
            const userWhoUnfollowed = await User.findById(req.userAuth)
            if (userToBeUnfollowed && userWhoUnfollowed) {
                const isUserAlreadyFollowed = userToBeUnfollowed.followers.find((follower) => follower.toString() === userWhoUnfollowed._id.toString())
                if (!isUserAlreadyFollowed) {
                    return next(appErr('You are not following this user'))

                } else {
                    userToBeUnfollowed.followers = userToBeUnfollowed.followers.filter((follower) => follower.toString() !== userWhoUnfollowed._id.toString())
                    await userToBeUnfollowed.save();
                    userWhoUnfollowed.following = userWhoUnfollowed.following.filter((following) => following.toString() !== userToBeUnfollowed._id.toString())
                    await userWhoUnfollowed.save();

                    res.json({
                        status: 'success',
                        data: 'You have successfully unfollowed this user!'
                    })
                }
            }
        } catch (error) {
            next(appErr(error.message))
        }
    }
    //Block
const blockUsersCtrl = async(req, res, next) => {
        try {
            const userToBeBlocked = await User.findById(req.params.id)
            const userWhoBlocked = await User.findById(req.userAuth)
            if (userWhoBlocked && userToBeBlocked) {
                const isUserAlreadyBlocked = userWhoBlocked.blocked.find(blocked => blocked.toString() === userToBeBlocked._id.toString())
                if (isUserAlreadyBlocked) {
                    return next(appErr('You are already blocking this user!'))
                }
                userWhoBlocked.blocked.push(userToBeBlocked._id)
                await userWhoBlocked.save()
                res.json({
                    status: 'success',
                    data: 'You have successfully blocked this user!'
                })
            }
        } catch (error) {
            next(appErr(error.message))
        }
    }
    //unblock
const unblockUsersCtrl = async(req, res, next) => {
        try {
            const userToBeUnBlocked = await User.findById(req.params.id)
            const userWhoUnBlocked = await User.findById(req.userAuth)
            if (userToBeUnBlocked && userWhoUnBlocked) {
                const isUserAlreadyBlocked = userWhoUnBlocked.blocked.find(blocked =>
                    blocked.toString() === userToBeUnBlocked._id.toString()
                )
                if (!isUserAlreadyBlocked) {
                    return next(appErr('You have not block this user'))
                }
                userWhoUnBlocked.blocked = userWhoUnBlocked.blocked.filter(blocked =>
                    blocked.toString() !== userToBeUnBlocked._id.toString()
                )
                await userWhoUnBlocked.save()
                res.json({
                    status: 'success',
                    data: 'You have successfully unblocked this user'
                })
            }
        } catch (error) {
            next(appErr(error.message))
        }
    }
    //Admin-Unblock
const adminUnblockUserCtrl = async(req, res, next) => {
        try {
            const userToBeunblocked = await User.findById(req.params.id)
            if (!userToBeunblocked) {
                return next(appErr('User not found!'))
            }
            userToBeunblocked.isBlocked = false
            await userToBeunblocked.save()
            res.json({
                status: 'success',
                data: 'Admin-unblocked this user'
            })
        } catch (error) {
            next(appErr(error.message))
        }
    }
    //Admin-block
const adminBlockUserCtrl = async(req, res, next) => {
        try {
            const userToBeBlocked = await User.findById(req.params.id)
            if (!userToBeBlocked) {
                return next(appErr('User not found!'))
            }
            userToBeBlocked.isBlocked = true
            await userToBeBlocked.save()
            res.json({
                status: 'success',
                data: 'Admin-blocked this user'
            })
        } catch (error) {
            next(appErr(error.message))
        }
    }
    //All
const usersCtrl = async(req, res, next) => {
        try {
            const users = await User.find()
            res.json({
                status: 'success',
                data: users
            })
        } catch (error) {
            next(appErr(error.message))
        }
    }
    //Who viewed my profile
const whoViewedMyProfileCtrl = async(req, res, next) => {
        try {
            //1. Find the original
            const user = await User.findById(req.params.id)
                //2. Find the user who viewed the original user
            const userWhoViewed = await User.findById(req.userAuth)
                //3. Check for original and viewer are found
            if (user && userWhoViewed) {
                //4. Check if viewer is already in the users viewers array
                const isUserAlreadyViewed = user.viewers.find(
                    viewer => viewer.toString() === userWhoViewed._id.toJSON()
                )
                if (isUserAlreadyViewed) {
                    return next(appErr('Already viewed this profile'));
                } else {
                    //5. push to viewers array
                    user.viewers.push(userWhoViewed._id)
                        //6. save the user
                    await user.save()
                    res.json({
                        status: 'success',
                        data: 'You successfully viewed this profile'
                    })
                }
            }
        } catch (error) {
            next(appErr(error.message))
        }
    }
    //Delete
const deleteUserCtrl = async(req, res) => {
        try {
            res.json({
                status: 'success',
                data: 'delete user route'
            })
        } catch (error) {
            next(appErr(error.message))
        }
    }
    //Update
const updateUserCtrl = async(req, res, next) => {
        const { email, firstname, lastname } = req.body
        try {
            if (email) {
                const emailTaken = await User.findOne({ email })
                if (emailTaken) {
                    return next(appErr('Email is already in use', 400))
                }
            }

            const user = await User.findByIdAndUpdate(req.userAuth, { lastname, firstname, email }, { new: true, runValidators: true })

            res.json({
                status: 'success',
                data: user
            })
        } catch (error) {
            next(appErr(error.message))
        }
    }
    //Update password
const updatePasswordCtrl = async(req, res, next) => {
        const { password } = req.body
        try {
            if (password) {
                const salt = await bcrypt.genSalt(10)
                const hashedPassword = await bcrypt.hash(password, salt)
                    //update the user
                await User.findByIdAndUpdate(req.userAuth, { password: hashedPassword }, { new: true, runValidators: true })
                res.json({
                    status: 'success',
                    data: 'Password Updated!'
                })
            } else {
                return next(appErr('No password feild'))
            }
        } catch (error) {
            next(appErr(error.message))
        }
    }
    //Delete Account
const deleteUserAccountCtrl = async(req, res, next) => {
        try {
            const userToDelete = await User.findById(req.userAuth)
            await Post.deleteMany({ user: req.userAuth })
            await Comment.deleteMany({ user: req.userAuth })
            await Category.deleteMany({ user: req.userAuth })
            await userToDelete.delete()
            return res.json({
                status: 'Success',
                data: "Your account was deleted"

            })
        } catch (error) {
            next(appErr(error.message))
        }
    }
    //Profile photo upload
const profilePhotoUploadCtrl = async(req, res, next) => {
    try {
        //1. Find user 
        const userToUpdate = await User.findById(req.userAuth)
            //2. Check if user is found
        if (!userToUpdate) {
            return next(appErr('User not found', 404))
        }
        //3. Check if user is blocked
        if (userToUpdate.isBlocked) {
            return next(appErr('Action is not allowed for blocked users!', 403))
        }
        //4. Check if user is updating their photo
        if (req.file) {
            //5. Update
            await User.findByIdAndUpdate(req.userAuth, { $set: { profilePhoto: req.file.path } }, { new: true });
            res.json({
                status: 'success',
                data: 'profile photo updated successfully!'
            })
        }
    } catch (error) {
        next(appErr(error.message, 500))
    }
}

module.exports = { userRegisterCtrl, userLoginCtrl, userProfileCtrl, usersCtrl, updateUserCtrl, profilePhotoUploadCtrl, whoViewedMyProfileCtrl, followingCtrl, unFollowCtrl, blockUsersCtrl, unblockUsersCtrl, adminBlockUserCtrl, adminUnblockUserCtrl, updatePasswordCtrl, deleteUserAccountCtrl }