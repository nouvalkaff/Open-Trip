// import model userPayment
const { Op } = require('sequelize')

const { Users_Payment_Method } = require("../models");

//controller untuk nampilin semua data
exports.getAllUserPayment = async (req, res) => {
    try {
        const getAll = await Users_Payment_Method.findAll(); 

        const getData = {
            message: 'Get all data success',
            success: true,
            code: 200,
            result: getAll 
        };
        res.json(getData) 
    } catch (error) {
        res.json({
            message: 'Internal Server Error',
            code: 500,
            result: error 
        })
    }
}

//controller untuk nampilin satu data berdasarkan id
exports.getUserPaymentById = async (req, res) => {
    try {
        const idUserPayment = req.query.id 
        const getOneUserPayment = await Users_Payment_Method.findOne({ 
            where: { id: idUserPayment } 
        });
        if (getOneUserPayment) {
            res.json({
                message: `Get data by ID: ${idUserPayment} Success`,
                success: true,
                code: 200,
                result: getOneUserPayment 
            })
        } else {
            res.json({
                message: 'Data not found',
                success: false,
                code: 400 
            })
        }
    } catch (error) {
        res.json({
            message: 'Internal Server Error',
            success: false,
            code: 500,
            result: error 
        })
    }
}

//controller untuk create data
exports.createUserPayment = async (req, res) => {
    try {
        const createNew = {
            payment_type: req.body.payment_type 
        };
        const newData = await Users_Payment_Method.create(createNew); 
        if (newData) {
            res.json({
                message: 'Create New Data Succesfully',
                success: true,
                code: 201,
                result: createNew 
            })
        }
    } catch (error) {
        console.log(error)
        res.json({
            message: 'Internal Server Error',
            code: 500,
            result: error 
        })
    }
}

// controller untuk update data
exports.updateUserPayment = async (req, res) => {
    try {
        const userPaymentId = req.query.id 
         await payment.update(req.body, {
            where: {
                id: userPaymentId
            }
        });

        const newUpdate = await Users_Payment_Method.findOne({
            where: {
                id: userPaymentId
            },
            attributes: {
                exclude: [ "createdAt", "updatedAt"]
            }

        })
        res.json({
            message: `Successfully updated data ${userPaymentId}`,
            success: true,
            code: 201,
            result: newUpdate 
        })
    } catch (error) {
        res.json({
            message: 'Internal Server Error',
            success: false,
            code: 500,
            result: error 
        })
    }
}

//ccontroller untuk hapus data
exports.deleteUserPayment = async (req, res) => {
    try {
        const userPaymentId = req.query.id 
        const deleteData = await Users_Payment_Method.destroy({ 
            where: { id: userPaymentId } 
        });
        if (deleteData) {
            res.json({
                message: `Delete data by ID: ${userPaymentId} Success`,
                success: true,
                code: 200,
                result: deleteData 
            })
        } else {
            res.json({
                message: 'Data not found',
                success: false,
                code: 400 
            })
        }
    } catch (error) {
        res.json({
            message: 'Internal Server Error',
            success: false,
            code: 500,
            result: error 
        })
    }
}