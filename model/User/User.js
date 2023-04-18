const mongoose = require("mongoose");
const Post = require("../Post/Post");

const userSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: [true, "First Name is required"],
    },
    lastname: {
        type: String,
        required: [true, "Last Name is required"],
    },
    profilePhoto: {
        type: String,
    },
    email: {
        type: String,
        required: [true, "Email is required"],
    },
    password: {
        type: String,
        required: [true, "Password is required"],
    },
    isBlocked: {
        type: Boolean,
        default: false,
    },
    isAdmin: {
        type: Boolean,
        default: false,
    },
    role: {
        type: String,
        enum: ["Admin", "Guest", "Editor"],
    },
    viewers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }, ],
    followers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }, ],
    following: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }, ],

    posts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
    }, ],
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
    }, ],
    blocked: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }, ],
    // plan: {
    //     type: String,
    //     enum: ['Free', 'Premium', 'Pro'],
    //     default: 'Free'
    // },

    userAward: {
        type: String,
        enum: ["Bronze", "Silver", "Gold"],
        default: "Bronze",
    },
}, {
    timestamps: true,
    toJSON: { virtuals: true }
});

//Hooks
userSchema.pre('findOne', async function(next) {
    this.populate('posts')
    const userId = this._conditions._id
    const posts = await Post.find({ user: userId })
    const lastPost = posts[posts.length - 1]
    const lastPostDate = new Date(lastPost && lastPost.createdAt)
    const lastPostDateStr = lastPostDate.toDateString()
    userSchema.virtual('lastPostDate').get(function() {
        return lastPostDateStr
    })
    const currentDate = new Date()
    const diff = currentDate - lastPostDate
    const diffInDays = diff / (1000 * 3600 * 24)

    if (diffInDays > 30) {
        userSchema.virtual("isInactive").get(function() {
            return true
        });
        await User.findByIdAndUpdate(
            userId, { isBlocked: true }, { new: true }
        )

    } else {
        userSchema.virtual("isInactive").get(function() {
            return false
        })
        await User.findByIdAndUpdate(
            userId, { isBlocked: false }, { new: true }
        )
    }

    /* -------Last active date ------- */

    const daysAgo = Math.floor(diffInDays)
    userSchema.virtual('lastActive').get(function() {
        if (daysAgo <= 0) {
            return 'Today'
        }
        if (daysAgo === 1) {
            return 'Yesterday'
        }
        if (daysAgo > 1) {
            return `${daysAgo} days ago`
        }
    })

    /* -------Last active date ------- */
    const numberOfPosts = posts.length
    if (numberOfPosts < 10) {
        await User.findByIdAndUpdate(userId, { userAward: 'Bronze' }, { new: true })

    }
    if (numberOfPosts >= 10) {
        await User.findByIdAndUpdate(userId, { userAward: 'Silver' }, { new: true })

    }
    if (numberOfPosts > 20) {
        await User.findByIdAndUpdate(userId, { userAward: 'Gold' }, { new: true })

    }

    next()
})
userSchema.pre('save', function(next) {
    next()
})


userSchema.virtual('fullname').get(function() {
    return `${this.firstname} ${this.lastname}`
})
userSchema.virtual('initials').get(function() {
    return `${this.firstname[0]}.${this.lastname[0]}`
})
userSchema.virtual('postsCount').get(function() {
    return this.posts.length
})
userSchema.virtual('followersCount').get(function() {
    return this.followers.length
})
userSchema.virtual('followingCount').get(function() {
    return this.following.length
})
userSchema.virtual('viewersCount').get(function() {
    return this.viewers.length
})
userSchema.virtual('blockedCount').get(function() {
    return this.blocked.length
})

const User = mongoose.model("User", userSchema)
module.exports = User