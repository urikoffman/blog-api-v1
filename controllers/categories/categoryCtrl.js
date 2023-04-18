const Category = require("../../model/Category/Category");
const appErr = require("../../utils/appErr");


const createCategoryCtrl = async(req, res, next) => {
    const { title } = req.body
    try {
        const category = await Category.create({ title, user: req.userAuth })
        res.json({
            status: 'success',
            data: category
        })
    } catch (error) {
        return next(appErr(error.message))
    }
}

const fetchCategoriesCtrl = async(req, res) => {
    try {
        const categories = await Category.find()
        res.json({
            status: 'success',
            data: categories
        })
    } catch (error) {
        res.json(error.message)
    }
}
const singleCategoryCtrl = async(req, res) => {
    try {
        const category = await Category.findById(req.params.id)

        res.json({
            status: 'success',
            data: category
        })
    } catch (error) {
        res.json(error.message)
    }
}
const deleteCategoryCtrl = async(req, res) => {
    await Category.findByIdAndDelete(req.params.id)
    try {
        res.json({
            status: 'success',
            data: 'Deleted category'
        })
    } catch (error) {
        res.json(error.message)
    }
}
const updateCategoryCtrl = async(req, res) => {
    const { title } = req.body
    try {
        const category = await Category.findByIdAndUpdate(req.params.id, { title }, { new: true, runValidators: true })
        res.json({
            status: 'success',
            data: category
        })
    } catch (error) {
        res.json(error.message)
    }
}
module.exports = { createCategoryCtrl, singleCategoryCtrl, deleteCategoryCtrl, updateCategoryCtrl, fetchCategoriesCtrl }