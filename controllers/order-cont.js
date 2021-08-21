const { Op } = require("sequelize");

const AWS = require("aws-sdk");
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ID,
  secretAccessKey: process.env.AWS_SECRET,
});

const faker = require("faker");
const jwt = require("jsonwebtoken");
const moment = require("moment");
moment.locale("id");
const {
  Orders,
  Users,
  Trips,
  Master_Bank_Account,
  Bank_Account,
} = require("../models");

//getAll orders
exports.getAllOrder = async (req, res) => {
  try {
    const getAll = await Orders.findAll();

    const getData = {
      message: "Get all data success",
      success: true,
      code: 200,
      result: getAll,
    };
    res.json(getData);
  } catch (error) {
    console.log(error);
    res.json({
      message: "Internal Server Error",
      code: 500,
      result: error,
    });
  }
};

//get one order by id
exports.getOrderById = async (req, res) => {
    try {
        const orderId = req.query.id 

        const getOneOrder = await Orders.findOne({
            attributes: { exclude: [ "createdAt", "updatedAt" ] },
            where: {
                id: orderId
            }
        });

        const getTrips = await Trips.findOne({
            where: {
                id: getOneOrder.dataValues.trip_id
            }
        })

        const tripDuration = getTrips.dataValues.duration_trip
        const tripName = getTrips.dataValues.trip_name

        if (getOneOrder) {
            res.json({
                message: `Get data by ID: ${orderId} Success`,
                success: true,
                code: 200,
                result: {
                    trip_name: tripName,
                    duration_trip: tripDuration,
                    orders: getOneOrder
                } 
            })
        } else {
            res.json({
                message: 'Data not found',
                success: false,
                code: 400 
            })
        }
    } catch (error) {
        console.log(error)
        res.json({
            message: 'Internal Server Error',
            success: false,
            code: 500,
            result: error 
        })
    }
};

//create orders
exports.createOrder = async (req, res) => {
  try {
    const uuid = faker.datatype.uuid();
    const voucherCode = faker.finance.bitcoinAddress();
    const {
      fullname,
      email,
      phone,
      trip_id,
      user_id,
      user_payment_method_id,
      quantity,
      order_status,
      date_order,
      total_price,
      payment_status,
      voucher_code,
      due_date,
    } = req.body;

    const matchEmail = await Users.findOne({
      where: {
        email: email,
      },
    });

    if (email == "") {
      res.status(400).json({
        code: 400,
        statusText: "Bad Request",
        success: false,
        message: "Please input the columns before go to next step",
      });
      return;
    }

    if (!matchEmail) {
      res.status(400).json({
        code: 400,
        statusText: "Bad Request",
        success: false,
        message: "Your email must be the same as the email when you registered",
      });
    }
    await Users.update(
      {
        ...req.body,
      },
      {
        where: { email: email },
      }
    );

    const tripId = req.body.trip_id;
    const bankId = req.body.bank_id;

    // Find Trip ID
    const dataTrip = await Trips.findOne({
      where: {
        id: tripId,
      },
    });

		//Check status quota of the trip
		let totalParticipants = 0;
		const tripQuota = dataTrip.dataValues.quota

		const allOrderOfTheTrip = await Orders.findAll({
			where: {
				trip_id: dataTrip.dataValues.id
			}
		})

		for (j=0; j<allOrderOfTheTrip.length; j++) {
			totalParticipants += allOrderOfTheTrip[j].qty
		}
		
		const diff = Math.abs(tripQuota-totalParticipants)

		if ((totalParticipants >= tripQuota) || (diff<req.body.qty)) {
			res.status(409).json({
				code: 409,
				statustext: "Conflict",
				success: false,
				message: `Trip quota if full, only ${diff} quota remains, you cannot order this trip`,
			})
			return;
		}

    // Find HOSTER Phone Number
    const hoster = await Users.findOne({
      where: {
        id: dataTrip.user_id,
      },
    });

    // Find No. Rekening
    const accountNumber = await Bank_Account.findOne({
      where: {
        user_id: dataTrip.user_id,
      },
    });

    const findBankName = await Master_Bank_Account.findOne({
      where: {
        id: accountNumber.master_bank_account_id,
      },
    });

		//Find Trip Name
		const tripName = dataTrip.dataValues.trip_name

    const hostBankName = findBankName.dataValues.bank_name;

    const virtualAccountNumber = accountNumber.dataValues.account_number;

    const tripPrice = await dataTrip.dataValues.price;
    console.log("tripPrice: ", tripPrice);

    const totalPrice = req.body.qty * tripPrice;
    console.log("TOTAL: ", totalPrice);

    const dataBank = await Master_Bank_Account.findOne({
      where: {
        id: bankId,
      },
    });

    const bankPayment = await dataBank.dataValues.id;
    const bankName = await dataBank.dataValues.bank_name;
    console.log("BANK: ", bankPayment, bankName);

    const uuidEx = uuid;
    const orderNo = uuidEx.slice(0, 8);
    const voucherCodeEx = voucherCode;
    const codeVoucher = voucherCodeEx.slice(0, 10);

    const dueDate = moment().add(2, "days").calendar();
    const dueDate2 = moment().format("LLL");
    const today = moment().format("LLLL");

    const token = req.headers.authorization;
    decoded = jwt.verify(token, process.env.SECRET_KEY);

    const result = {
      trip_id: dataTrip.dataValues.id,
      user_id: decoded.user_id,
      user_payment_method_id: 1,
      bank_id: {
        bankPayment: bankPayment,
        bankName: bankName,
      },
      order_no: orderNo,
      qty: req.body.qty,
      order_status: req.body.order_status,
      date_order: today,
      total_price: totalPrice,
      payment_status: "Pending",
      voucher_code: codeVoucher,
      due_date: `${dueDate} (48 Jam setelah pemesanan: ${dueDate2})`,
      payment_ways: `Jika pembayaran sudah dilakukan silahkan upload bukti pembayaran ke no WhatsApp ini: ${hoster.phone}`,
    };

    const createOrders = await Orders.create(result);

    if (createOrders) {
      res.status(201).json({
        code: 201,
        statusText: "Created",
        success: true,
        message: "Successfully created your orders",
        result: {
					trip_name: tripName,
          orders: createOrders,
          nama_bank_host: hostBankName,
          no_rekening_host: `${virtualAccountNumber} (Nama Host: ${hoster.username})`,
        },
      });
    }
		
  } catch (err) {
    console.log(err);
    res.status(500).json({
      code: 500,
      statustext: "Internal Server Error",
      success: false,
      message: "Failed to orders trip. Please try again",
    });
  }
};

//update orders
exports.ChangeStatusPayment = async (req, res) => {
  try {
    const idInput = req.body.order_id;

    await Orders.update(
      { payment_status: "Success" },
      {
        where: {
          id: idInput,
        },
      }
    );

    const findOrders1 = await Orders.findOne({
      where: {
        id: idInput,
      },
    });
    res.status(200).json({
      code: 200,
      statusText: "OK",
      success: true,
      message: "Thank you. Your payment has been confirmed",
      result: findOrders1,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      code: 500,
      statustext: "Internal Server Error",
      success: false,
      message: "Failed to orders trip. Please try again",
    });
  }
};

// delete orders
exports.deleteOrder = async (req, res) => {
  try {
    const idInput = req.query.id;

    const orderData = await Orders.findOne({
      where: { id: idInput },
    });

    if (!orderData) {
      res.status(404).json({
        code: 404,
        statustext: "Not Found",
        success: false,
        message: "Data that you want to delete is not found",
      });
    }

    await Orders.destroy({
      where: { id: idInput },
    });

    res.status(200).json({
      code: 200,
      statustext: "OK",
      success: true,
      message: "Successfully delete the data",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      code: 500,
      statustext: "Internal Server Error",
      success: false,
      message: "Failed to delete order data",
    });
  }
};
