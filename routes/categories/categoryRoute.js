const express = require('express');
const { createCategoryCtrl, singleCategoryCtrl, deleteCategoryCtrl, updateCategoryCtrl, fetchCategoriesCtrl } = require('../../controllers/categories/categoryCtrl');
const isLogin = require('../../middlewares/isLogin');
const categoryRouter = express.Router()

//POST/api/v1/categories
categoryRouter.post('/', isLogin, createCategoryCtrl)
    //GET/api/v1/categories
categoryRouter.get('/', fetchCategoriesCtrl)
    //GET/api/v1/categories/:id
categoryRouter.get('/:id', singleCategoryCtrl)
    //DELETE/api/v1/categories/:id
categoryRouter.delete('/:id', isLogin, deleteCategoryCtrl)
    //PUT/api/v1/categories/:id
categoryRouter.put('/:id', isLogin, updateCategoryCtrl)
module.exports = categoryRouter