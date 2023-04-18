const express = require('express');
const userRouter = require('./routes/users/userRoute');
const postRouter = require('./routes/posts/postRoute');
const commentRouter = require('./routes/comments/commentRoute');
const categoryRouter = require('./routes/categories/categoryRoute');
const globalErrHandler = require('./middlewares/globalErrHandler');
// const isAdmin = require('./middlewares/isAdmin');



require('dotenv').config()
require('./config/dbConnect')
const app = express()
app.use(express.json())
    // app.use(isAdmin)
    //middlewares

/*---routes---*/
/*----------------------user route------------------------------*/
app.use('/api/v1/users/', userRouter)
    /*----------------------post route------------------------------*/
app.use('/api/v1/posts/', postRouter)
    /*--------------------comment route-------------------------*/
app.use('/api/v1/comments/', commentRouter)
    /*--------------------category route-------------------------*/
app.use('/api/v1/categories/', categoryRouter)

//Error handlers
app.use(globalErrHandler)
    //404 error
app.use('*', (req, res) => {
    res.status(404).json({
        message: `${req.originalUrl} Route not found!`
    })
})
const port = process.env.PORT || 9000
app.listen(port, () => {
    console.log(`App is runnung on port ${port}`);
})