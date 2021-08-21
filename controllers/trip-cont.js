var {
  Activities,
  Categories,
  Galleries,
  Orders,
  Trips,
  Users,
} = require("../models");
var { Op } = require("sequelize");
var AWS = require("aws-sdk");
const jwt = require("jsonwebtoken"); //import jwt
require("dotenv").config();

var s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ID,
  secretAccessKey: process.env.AWS_SECRET,
});

//! BELUM BERES, HANYA BISA ASSIGN SATU ACTIVITY
exports.createTrip = async (req, res) => {
  try {
    const {
      trip_name,
      price,
      trip_date_1,
      trip_date_2,
      trip_date_3,
      duration_trip,
      pick_spot,
      quota,
      term_and_condition,
      day1,
      time1,
      do1,
      time2,
      do2,
      time3,
      do3,
      time4,
      do4,
      day2,
      time5,
      do5,
      time6,
      do6,
      time7,
      do7,
      time8,
      do8,
      day3,
      time9,
      do9,
      time10,
      do10,
      time11,
      do11,
      time12,
      do12,
    } = req.body;

    const files = req.files;

    const thumbPict = files.thumbnail_pict,
      pict1 = files.pict_1,
      pict2 = files.pict_2,
      pict3 = files.pict_3,
      pict4 = files.pict_4;

    if (
      thumbPict[0].size >= 410000 ||
      pict1[0].size >= 410000 ||
      pict2[0].size >= 410000 ||
      pict3[0].size >= 410000 ||
      pict4[0].size >= 410000
    ) {
      res.status(400).json({
        code: 400,
        statustext: "Bad Request",
        success: false,
        message:
          "Big file(s) detected. Uploaded file(s) must equal or less than 400KB",
      });
      return;
    }

    if (duration_trip == 1) {
      if (
        day2 ||
        day3 ||
        time5 ||
        time6 ||
        time7 ||
        time8 ||
        time9 ||
        time10 ||
        time11 ||
        time12 ||
        do5 ||
        do6 ||
        do7 ||
        do8 ||
        do9 ||
        do10 ||
        do11 ||
        do12
      ) {
        await res.status(400).json({
          code: 400,
          statustext: "Bad Request",
          success: false,
          message:
            "You only choose 1 day as your trip duration, cannot fill day, time, and activity for day 2 and 3",
        });
        return;
      }
    }

    if (duration_trip == 2) {
      if (
        day3 ||
        time9 ||
        time10 ||
        time11 ||
        time12 ||
        do9 ||
        do10 ||
        do11 ||
        do12
      ) {
        await res.status(400).json({
          code: 400,
          statustext: "Bad Request",
          success: false,
          message:
            "You only choose 2 days as your trip duration, cannot fill day, time, and activity for day 3",
        });
        return;
      }
    }

    if (duration_trip == 0) {
      await res.status(400).json({
        code: 400,
        statustext: "Bad Request",
        success: false,
        message: "The days of 'duration_trip' cannot 0. Must around 1 - 3 days",
      });
      return;
    }

    if (duration_trip > 3) {
      await res.status(400).json({
        code: 400,
        statustext: "Bad Request",
        success: false,
        message:
          "The days of 'duration_trip' cannot more than 3. Must around 1 - 3 days",
      });
      return;
    }

    // if (
    //   thumbPict[0].mimetype != "image/jpeg" &&
    //   thumbPict[0].mimetype != "image/jpg"
    // ) {
    //   res.status(400).json({
    //     code: 400,
    //     statustext: "Bad Request",
    //     success: false,
    //     message: "Only .png, .jpg and .jpeg format allowed!",
    //   });
    //   return;
    // }

    if (
      trip_name == "" ||
      price == "" ||
      trip_date_1 == "" ||
      duration_trip == "" ||
      quota == "" ||
      day1 == "" ||
      time1 == "" ||
      do1 == ""
      // term_and_condition == "" ||
      // day == "" ||
      // time == "" ||
      // activity == ""
    ) {
      res.status(400).json({
        code: 400,
        statustext: "Bad Request",
        success: false,
        message:
          "Please fill all these columns: 'trip_name', 'price', 'trip_date_1', 'duration_trip', and 'quota', 'day1', 'time1', 'do'.",
      });
      return;
    }

    if (
      thumbPict === undefined ||
      pict1 === undefined ||
      pict2 === undefined ||
      pict3 === undefined ||
      pict4 === undefined
    ) {
      res.status(409).json({
        code: 409,
        statustext: "Conflict",
        success: false,
        message:
          "Please insert a thumbnail photo + six (6) photos of your amazing trip",
      });
      return;
    }

    if (!trip_date_1) {
      res.status(409).json({
        code: 409,
        statustext: "Conflict",
        success: false,
        message:
          "Please fill date 1 with format DD/MM/YYYY before date 2 and 3",
      });
      return;
    }

    //Kalau date_2 kosong
    if (trip_date_2 == 0 || trip_date_2 == "") {
      if (!trip_date_1) {
        res.status(409).json({
          code: 409,
          statustext: "Conflict",
          success: false,
          message:
            "Please fill date 1 with format DD/MM/YYYY before date 2 and 3",
        });
        return;
      }

      if (trip_date_3) {
        res.status(409).json({
          code: 409,
          statustext: "Conflict",
          success: false,
          message: "Please fill date 2 with format DD/MM/YYYY before date 3",
        });
        return;
      }

      const time_1 = trip_date_1.match(/\d{2,4}/g);

      const dd1 = time_1[0]; //take date
      const mm1 = time_1[1]; //take month
      const yyyy1 = time_1[2]; //take year

      const datestamp_1 = Date.parse(`${mm1}/${dd1}/${yyyy1}`) / 1000;

      //   const min_kuota_sk = `Minimum Keberangkatan ${kuota} Orang, Syarat & Ketentuan Berlaku`;

      const matchTripByName = await Trips.findOne({
        where: {
          trip_name: trip_name,
        },
      });

      if (matchTripByName) {
        res.status(409).json({
          code: 409,
          statustext: "Conflict",
          success: false,
          message: "Trip name already exist in database, please change it",
        });
      }

      // AWS S3 Upload Coding
      //Set Up the Keys Name of file which will upload
      const keyName1 = `Trips/thumbnail_pict/${new Date().getTime()}-${
        files.thumbnail_pict[0]
      }`;
      const keyName2 = `Trips/pict1/${new Date().getTime()}-${files.pict_1[0]}`;
      const keyName3 = `Trips/pict2/${new Date().getTime()}-${files.pict_2[0]}`;
      const keyName4 = `Trips/pict3/${new Date().getTime()}-${files.pict_3[0]}`;
      const keyName5 = `Trips/pict4/${new Date().getTime()}-${files.pict_4[0]}`;
      // const keyName6 = `Gallery/pict5/${new Date().getTime()}-${
      //   files.pict_5[0]
      // }`;
      // const keyName7 = `Gallery/pict6/${new Date().getTime()}-${
      //   files.pict_6[0]
      // }`;

      //Preparing the params for uploading to AWS S3
      const params1 = {
        ACL: "public-read",
        Body: files.thumbnail_pict[0].buffer,
        Bucket: process.env.AWS_BUCKET_NAME,
        ContentType: "image/jpeg",
        Key: keyName1,
      };

      const params2 = {
        ACL: "public-read",
        Body: files.pict_1[0].buffer,
        Bucket: process.env.AWS_BUCKET_NAME,
        ContentType: "image/jpeg",
        Key: keyName2,
      };

      const params3 = {
        ACL: "public-read",
        Body: files.pict_2[0].buffer,
        Bucket: process.env.AWS_BUCKET_NAME,
        ContentType: "image/jpeg",
        Key: keyName3,
      };

      const params4 = {
        ACL: "public-read",
        Body: files.pict_3[0].buffer,
        Bucket: process.env.AWS_BUCKET_NAME,
        ContentType: "image/jpeg",
        Key: keyName4,
      };

      const params5 = {
        ACL: "public-read",
        Body: files.pict_4[0].buffer,
        Bucket: process.env.AWS_BUCKET_NAME,
        ContentType: "image/jpeg",
        Key: keyName5,
      };

      // const params6 = {
      //   ACL: "public-read",
      //   Body: files.pict_5[0].buffer,
      //   Bucket: process.env.AWS_BUCKET_NAME,
      //   ContentType: "image/jpeg",
      //   Key: keyName6,
      // };

      // const params7 = {
      //   ACL: "public-read",
      //   Body: files.pict_6[0].buffer,
      //   Bucket: process.env.AWS_BUCKET_NAME,
      //   ContentType: "image/jpeg",
      //   Key: keyName7,
      // };

      const params = [
        params1,
        params2,
        params3,
        params4,
        params5,
        // params6,
        // params7,
      ];

      const element = {};
      const arrDate = [];

      element.trip_date_1 = trip_date_1;
      element.trip_date_2 = "";
      element.trip_date_3 = "";

      arrDate.push(element);

      const day_time_act = [];

      const tact1 = {},
        tact2 = {},
        tact3 = {},
        tact4 = {},
        activity1 = [],
        object1 = {};

      const tact5 = {},
        tact6 = {},
        tact7 = {},
        tact8 = {},
        activity2 = [],
        object2 = {};

      const tact9 = {},
        tact10 = {},
        tact11 = {},
        tact12 = {},
        activity3 = [],
        object3 = {};

      tact1.time = time1;
      tact1.do = do1;
      tact2.time = time2;
      tact2.do = do2;
      tact3.time = time3;
      tact3.do = do3;
      tact4.time = time4;
      tact4.do = do4;

      tact5.time = time5;
      tact5.do = do5;
      tact6.time = time6;
      tact6.do = do6;
      tact7.time = time7;
      tact7.do = do7;
      tact8.time = time8;
      tact8.do = do8;

      tact9.time = time9;
      tact9.do = do9;
      tact10.time = time10;
      tact10.do = do10;
      tact11.time = time11;
      tact11.do = do11;
      tact12.time = time12;
      tact12.do = do12;

      activity1.push(tact1, tact2, tact3, tact4);
      activity2.push(tact5, tact6, tact7, tact8);
      activity3.push(tact9, tact10, tact11, tact12);

      object1.day = day1;
      object1.activity = activity1;
      object2.day = day2;
      object2.activity = activity2;
      object3.day = day3;
      object3.activity = activity3;

      day_time_act.push(object1, object2, object3);

      const token = req.headers.authorization;
      const decoded = jwt.verify(token, process.env.SECRET_KEY);

      //Algorithm for uploading multiple files to AWS
      const responseData = [];
      for (i = 0; i < 5; i++) {
        if (params.length < 5) {
          res.status(500).send({
            code: 500,
            statustext: "Internal Server Error",
            success: false,
            message:
              "Failed to get files data to be uploaded, please try again",
          });
        } else {
          responseData.push(await s3.upload(params[i]).promise());
          if (responseData.length == params.length) {
            const thumbnail_pict_url = responseData[0].Location;
            const pict_1_url = responseData[1].Location;
            const pict_2_url = responseData[2].Location;
            const pict_3_url = responseData[3].Location;
            const pict_4_url = responseData[4].Location;
            // const pict_5_url = responseData[5].Location;
            // const pict_6_url = responseData[6].Location;

            const tripData = await Trips.create({
              ...req.body,
              user_id: decoded.user_id,
              trip_date_1: trip_date_1,
              datestamp_1: datestamp_1,
              trip_date_2: 0,
              datestamp_2: 0,
              trip_date_3: 0,
              datestamp_3: 0,
              trip_date_array: arrDate,
              thumbnail_pict: thumbnail_pict_url,
              pict_1: pict_1_url,
              pict_2: pict_2_url,
              pict_3: pict_3_url,
              pict_4: pict_4_url,
              // pict_5: pict_5_url,
              // pict_6: pict_6_url,
            });

            const matchTripId = await Trips.findOne({
              where: {
                user_id: decoded.user_id,
              },
              attributes: {
                exclude: ["datestamp_1", "datestamp_2", "datestamp_3"],
              },
              order: [["createdAt", "DESC"]],
            });

            const tripID = await matchTripId.dataValues.id;

            const createActivities = await Activities.create({
              trip_id: tripID,
              day_time_act: day_time_act,
            });

            res.status(201).json({
              code: 201,
              statustext: "Created",
              success: true,
              message: "You are successfully created a new Trip and activities",
              result: { tripData, createActivities },
            });
          }
        }
      }
    }

    if (trip_date_3 == 0 || trip_date_3 == "") {
      if (!trip_date_1) {
        res.status(409).json({
          code: 409,
          statustext: "Conflict",
          success: false,
          message:
            "Please fill date 1 with format DD/MM/YYYY before date 2 and 3",
        });
        return;
      }

      const time_1 = trip_date_1.match(/\d{2,4}/g);
      const time_2 = trip_date_2.match(/\d{2,4}/g);

      const dd1 = time_1[0]; //take date
      const mm1 = time_1[1]; //take month
      const yyyy1 = time_1[2]; //take year

      const dd2 = time_2[0]; //take date
      const mm2 = time_2[1]; //take month
      const yyyy2 = time_2[2]; //take year

      const datestamp_1 = Date.parse(`${mm1}/${dd1}/${yyyy1}`) / 1000;
      const datestamp_2 = Date.parse(`${mm2}/${dd2}/${yyyy2}`) / 1000;

      //   const min_kuota_sk = `Minimum Keberangkatan ${kuota} Orang, Syarat & Ketentuan Berlaku`;

      const matchTripByName = await Trips.findOne({
        where: {
          trip_name: trip_name,
        },
      });

      if (matchTripByName) {
        return res.status(409).json({
          code: 409,
          statustext: "Conflict",
          success: true,
          message: "Trip name already exist in database, please change it",
        });
      }
      // AWS S3 Upload Coding
      //Set Up the Keys Name of file which will upload
      const keyName1 = `Trips/thumbnail_pict/${new Date().getTime()}-${
        files.thumbnail_pict[0]
      }`;
      const keyName2 = `Trips/pict1/${new Date().getTime()}-${files.pict_1[0]}`;
      const keyName3 = `Trips/pict2/${new Date().getTime()}-${files.pict_2[0]}`;
      const keyName4 = `Trips/pict3/${new Date().getTime()}-${files.pict_3[0]}`;
      const keyName5 = `Trips/pict4/${new Date().getTime()}-${files.pict_4[0]}`;
      // const keyName6 = `Gallery/pict5/${new Date().getTime()}-${
      //   files.pict_5[0]
      // }`;
      // const keyName7 = `Gallery/pict6/${new Date().getTime()}-${
      //   files.pict_6[0]
      // }`;

      //Preparing the params for uploading to AWS S3
      const params1 = {
        ACL: "public-read",
        Body: files.thumbnail_pict[0].buffer,
        Bucket: process.env.AWS_BUCKET_NAME,
        ContentType: "image/jpeg",
        Key: keyName1,
      };

      const params2 = {
        ACL: "public-read",
        Body: files.pict_1[0].buffer,
        Bucket: process.env.AWS_BUCKET_NAME,
        ContentType: "image/jpeg",
        Key: keyName2,
      };

      const params3 = {
        ACL: "public-read",
        Body: files.pict_2[0].buffer,
        Bucket: process.env.AWS_BUCKET_NAME,
        ContentType: "image/jpeg",
        Key: keyName3,
      };

      const params4 = {
        ACL: "public-read",
        Body: files.pict_3[0].buffer,
        Bucket: process.env.AWS_BUCKET_NAME,
        ContentType: "image/jpeg",
        Key: keyName4,
      };

      const params5 = {
        ACL: "public-read",
        Body: files.pict_4[0].buffer,
        Bucket: process.env.AWS_BUCKET_NAME,
        ContentType: "image/jpeg",
        Key: keyName5,
      };

      // const params6 = {
      //   ACL: "public-read",
      //   Body: files.pict_5[0].buffer,
      //   Bucket: process.env.AWS_BUCKET_NAME,
      //   ContentType: "image/jpeg",
      //   Key: keyName6,
      // };

      // const params7 = {
      //   ACL: "public-read",
      //   Body: files.pict_6[0].buffer,
      //   Bucket: process.env.AWS_BUCKET_NAME,
      //   ContentType: "image/jpeg",
      //   Key: keyName7,
      // };

      const params = [
        params1,
        params2,
        params3,
        params4,
        params5,
        // params6,
        // params7,
      ];

      const element = {};
      const arrDate = [];

      element.trip_date_1 = trip_date_1;
      element.trip_date_2 = trip_date_2;
      element.trip_date_3 = "";

      arrDate.push(element);

      const day_time_act = [];

      const tact1 = {},
        tact2 = {},
        tact3 = {},
        tact4 = {},
        activity1 = [],
        object1 = {};

      const tact5 = {},
        tact6 = {},
        tact7 = {},
        tact8 = {},
        activity2 = [],
        object2 = {};

      const tact9 = {},
        tact10 = {},
        tact11 = {},
        tact12 = {},
        activity3 = [],
        object3 = {};

      tact1.time = time1;
      tact1.do = do1;
      tact2.time = time2;
      tact2.do = do2;
      tact3.time = time3;
      tact3.do = do3;
      tact4.time = time4;
      tact4.do = do4;

      tact5.time = time5;
      tact5.do = do5;
      tact6.time = time6;
      tact6.do = do6;
      tact7.time = time7;
      tact7.do = do7;
      tact8.time = time8;
      tact8.do = do8;

      tact9.time = time9;
      tact9.do = do9;
      tact10.time = time10;
      tact10.do = do10;
      tact11.time = time11;
      tact11.do = do11;
      tact12.time = time12;
      tact12.do = do12;

      activity1.push(tact1, tact2, tact3, tact4);
      activity2.push(tact5, tact6, tact7, tact8);
      activity3.push(tact9, tact10, tact11, tact12);

      object1.day = day1;
      object1.activity = activity1;
      object2.day = day2;
      object2.activity = activity2;
      object3.day = day3;
      object3.activity = activity3;

      day_time_act.push(object1, object2, object3);

      const token = req.headers.authorization;
      const decoded = jwt.verify(token, process.env.SECRET_KEY);

      //Algorithm for uploading multiple files to AWS
      const responseData = [];
      for (i = 0; i < 5; i++) {
        if (params.length < 5) {
          res.status(500).send({
            Message: "Error",
            Success: false,
          });
        } else {
          responseData.push(await s3.upload(params[i]).promise());
          if (responseData.length == params.length) {
            const thumbnail_pict_url = responseData[0].Location;
            const pict_1_url = responseData[1].Location;
            const pict_2_url = responseData[2].Location;
            const pict_3_url = responseData[3].Location;
            const pict_4_url = responseData[4].Location;
            // const pict_5_url = responseData[5].Location;
            // const pict_6_url = responseData[6].Location;

            const tripData = await Trips.create({
              ...req.body,
              user_id: decoded.user_id,
              trip_date_1: trip_date_1,
              datestamp_1: datestamp_1,
              trip_date_2: trip_date_2,
              datestamp_2: datestamp_2,
              trip_date_3: 0,
              datestamp_3: 0,
              trip_date_array: arrDate,
              thumbnail_pict: thumbnail_pict_url,
              pict_1: pict_1_url,
              pict_2: pict_2_url,
              pict_3: pict_3_url,
              pict_4: pict_4_url,
              // pict_5: pict_5_url,
              // pict_6: pict_6_url,
            });

            const matchTripId = await Trips.findOne({
              where: {
                user_id: decoded.user_id,
              },
              order: [["createdAt", "DESC"]],
            });

            const tripID = await matchTripId.dataValues.id;

            const createActivities = await Activities.create({
              trip_id: tripID,
              day_time_act: day_time_act,
            });

            res.status(201).json({
              code: 201,
              statustext: "Created",
              success: true,
              message: "You are successfully created a new Trip and activities",
              result: { tripData, createActivities },
            });
          }
        }
      }
      return;
    }

    const time_1 = trip_date_1.match(/\d{2,4}/g);
    const time_2 = trip_date_2.match(/\d{2,4}/g);
    const time_3 = trip_date_3.match(/\d{2,4}/g);

    const dd1 = time_1[0]; //take date
    const dd2 = time_2[0]; //take date
    const dd3 = time_3[0]; //take date

    const mm1 = time_1[1]; //take month
    const mm2 = time_2[1]; //take month
    const mm3 = time_3[1]; //take month

    const yyyy1 = time_1[2]; //take year
    const yyyy2 = time_2[2]; //take year
    const yyyy3 = time_3[2]; //take year

    const datestamp_1 = Date.parse(`${mm1}/${dd1}/${yyyy1}`) / 1000;
    const datestamp_2 = Date.parse(`${mm2}/${dd2}/${yyyy2}`) / 1000;
    const datestamp_3 = Date.parse(`${mm3}/${dd3}/${yyyy3}`) / 1000;

    // const datestamp_1 = Date.parse(date_1) / 1000;
    // const datestamp_2 = Date.parse(date_2) / 1000;
    // const datestamp_3 = Date.parse(date_3) / 1000;

    // const min_kuota_sk = `Minimum Keberangkatan ${kuota} Orang, Syarat & Ketentuan Berlaku`;

    const matchTripByName = await Trips.findOne({
      where: {
        trip_name: trip_name,
      },
    });

    if (matchTripByName) {
      res.status(409).json({
        code: 409,
        statustext: "Conflict",
        success: false,
        message: "Trip name already exist in database, please change it",
      });
    }

    // AWS S3 Upload Coding
    //Set Up the Keys Name of file which will upload
    const keyName1 = `Trips/thumbnail_pict/${new Date().getTime()}-${
      files.thumbnail_pict[0]
    }`;
    const keyName2 = `Trips/pict1/${new Date().getTime()}-${files.pict_1[0]}`;
    const keyName3 = `Trips/pict2/${new Date().getTime()}-${files.pict_2[0]}`;
    const keyName4 = `Trips/pict3/${new Date().getTime()}-${files.pict_3[0]}`;
    const keyName5 = `Trips/pict4/${new Date().getTime()}-${files.pict_4[0]}`;
    // const keyName6 = `Gallery/pict5/${new Date().getTime()}-${files.pict_5[0]}`;
    // const keyName7 = `Gallery/pict6/${new Date().getTime()}-${files.pict_6[0]}`;

    //Preparing the params for uploading to AWS S3
    const params1 = {
      ACL: "public-read",
      Body: files.thumbnail_pict[0].buffer,
      Bucket: process.env.AWS_BUCKET_NAME,
      ContentType: "image/jpeg",
      Key: keyName1,
    };

    const params2 = {
      ACL: "public-read",
      Body: files.pict_1[0].buffer,
      Bucket: process.env.AWS_BUCKET_NAME,
      ContentType: "image/jpeg",
      Key: keyName2,
    };

    const params3 = {
      ACL: "public-read",
      Body: files.pict_2[0].buffer,
      Bucket: process.env.AWS_BUCKET_NAME,
      ContentType: "image/jpeg",
      Key: keyName3,
    };

    const params4 = {
      ACL: "public-read",
      Body: files.pict_3[0].buffer,
      Bucket: process.env.AWS_BUCKET_NAME,
      ContentType: "image/jpeg",
      Key: keyName4,
    };

    const params5 = {
      ACL: "public-read",
      Body: files.pict_4[0].buffer,
      Bucket: process.env.AWS_BUCKET_NAME,
      ContentType: "image/jpeg",
      Key: keyName5,
    };

    // const params6 = {
    //   ACL: "public-read",
    //   Body: files.pict_5[0].buffer,
    //   Bucket: process.env.AWS_BUCKET_NAME,
    //   ContentType: "image/jpeg",
    //   Key: keyName6,
    // };

    // const params7 = {
    //   ACL: "public-read",
    //   Body: files.pict_6[0].buffer,
    //   Bucket: process.env.AWS_BUCKET_NAME,
    //   ContentType: "image/jpeg",
    //   Key: keyName7,
    // };

    const params = [
      params1,
      params2,
      params3,
      params4,
      params5,
      // params6,
      // params7,
    ];

    const element = {};
    const arrDate = [];

    element.trip_date_1 = trip_date_1;
    element.trip_date_2 = trip_date_2;
    element.trip_date_3 = trip_date_3;

    arrDate.push(element);

    const day_time_act = [];

    const tact1 = {},
      tact2 = {},
      tact3 = {},
      tact4 = {},
      activity1 = [],
      object1 = {};

    const tact5 = {},
      tact6 = {},
      tact7 = {},
      tact8 = {},
      activity2 = [],
      object2 = {};

    const tact9 = {},
      tact10 = {},
      tact11 = {},
      tact12 = {},
      activity3 = [],
      object3 = {};

    tact1.time = time1;
    tact1.do = do1;
    tact2.time = time2;
    tact2.do = do2;
    tact3.time = time3;
    tact3.do = do3;
    tact4.time = time4;
    tact4.do = do4;

    tact5.time = time5;
    tact5.do = do5;
    tact6.time = time6;
    tact6.do = do6;
    tact7.time = time7;
    tact7.do = do7;
    tact8.time = time8;
    tact8.do = do8;

    tact9.time = time9;
    tact9.do = do9;
    tact10.time = time10;
    tact10.do = do10;
    tact11.time = time11;
    tact11.do = do11;
    tact12.time = time12;
    tact12.do = do12;

    activity1.push(tact1, tact2, tact3, tact4);
    activity2.push(tact5, tact6, tact7, tact8);
    activity3.push(tact9, tact10, tact11, tact12);

    object1.day = day1;
    object1.activity = activity1;
    object2.day = day2;
    object2.activity = activity2;
    object3.day = day3;
    object3.activity = activity3;

    day_time_act.push(object1, object2, object3);

    const token = req.headers.authorization;
    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    //Algorithm for uploading multiple files to AWS
    const responseData = [];
    for (i = 0; i < 5; i++) {
      if (params.length < 5) {
        res.status(500).send({
          Message: "Error",
          Success: false,
        });
      } else {
        responseData.push(await s3.upload(params[i]).promise());
        if (responseData.length == params.length) {
          const thumbnail_pict_url = responseData[0].Location;
          const pict_1_url = responseData[1].Location;
          const pict_2_url = responseData[2].Location;
          const pict_3_url = responseData[3].Location;
          const pict_4_url = responseData[4].Location;
          // const pict_5_url = responseData[5].Location;
          // const pict_6_url = responseData[6].Location;

          const tripData = await Trips.create({
            ...req.body,
            user_id: decoded.user_id,
            trip_date_1: trip_date_1,
            datestamp_1: datestamp_1,
            trip_date_2: trip_date_2,
            datestamp_2: datestamp_2,
            trip_date_3: trip_date_3,
            datestamp_3: datestamp_3,
            trip_date_array: arrDate,
            thumbnail_pict: thumbnail_pict_url,
            pict_1: pict_1_url,
            pict_2: pict_2_url,
            pict_3: pict_3_url,
            pict_4: pict_4_url,
            // pict_5: pict_5_url,
            // pict_6: pict_6_url,
          });

          const matchTripId = await Trips.findOne({
            where: {
              user_id: decoded.user_id,
            },
            order: [["createdAt", "DESC"]],
          });

          const tripID = await matchTripId.dataValues.id;

          const createActivities = await Activities.create({
            trip_id: tripID,
            day_time_act: day_time_act,
          });

          return res.status(201).json({
            code: 201,
            statustext: "Created",
            success: true,
            message: "You are successfully created a new Trip",
            result: { tripData, createActivities },
          });
        }
      }
    }
  } catch (err) {
    res.status(500).send({
      code: 500,
      statustext: "Internal Server Error",
      success: false,
      message: "Failed to get data",
    });
    console.log(err);
  }
  return;
};

exports.getAllTrips = async (req, res) => {
  try {
    const limit = req.query.limit;
    const page = req.query.page;
    const allTrips = await Trips.findAll({
      limit: limit,
      offset: page * limit,
      attributes: {
        exclude: [
          "createdAt",
          "updatedAt",
          "datestamp_1",
          "datestamp_2",
          "datestamp_3",
        ],
      },
      order: [["id", "ASC"]],
    });

    res.status(200).json({
      code: 200,
      statustext: "OK",
      success: true,
      message: "Trips data have been retrieved succesfully",
      result: allTrips,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      code: 500,
      statustext: "Internal Server Error",
      success: false,
      message: "Failed to get all Trips data",
    });
  }
};

// //Filter By ID
// exports.getTripById = async (req, res) => {
//   try {
//     // const limit = req.query.limit;
//     // const page = req.query.page;
//     const id = req.query.id;
//     const tripData = await Trips.findOne({
//       where: { id: id },
//       attributes: {
//         exclude: [
//           "createdAt",
//           "updatedAt",
//           "datestamp_1",
//           "datestamp_2",
//           "datestamp_3",
//         ],
//       },
//       // limit: limit,
//       // offset: page * limit,
//       include: {
//         model: Activities,
//         attributes: {
//           exclude: ["createdAt", "updatedAt"],
//         },
//       },
//     });

//     // if (!tripData) {
//     //   res.status(404).json({
//     //     code: 404,
//     //     statustext: "Not Found",
//     //     success: false,
//     //     message: `The trip with ID ${id} is not found`,
//     //   });
//     // }

//     return res.status(200).json({
//       code: 200,
//       statustext: "OK",
//       success: true,
//       message: `The trip with ID ${id} is successfully retrieved`,
//       result: tripData,
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({
//       code: 500,
//       statustext: "Internal Server Error",
//       success: false,
//       message: "Failed to get data",
//     });
//   }
// };

exports.getTripById = async (req, res) => {
  try {
    // const limit = req.query.limit;
    // const page = req.query.page;
    const id = req.query.id;
    const tripData = await Trips.findOne({
      where: { id: id },
      attributes: {
        exclude: [
          "createdAt",
          "updatedAt",
          "datestamp_1",
          "datestamp_2",
          "datestamp_3",
        ],
      },
      // limit: limit,
      // offset: page * limit,
      include: {
        model: Activities,
        attributes: {
          exclude: ["createdAt", "updatedAt"],
        },
      },
    });

    if (!tripData) {
      return res.status(200).json({
        code: 200,
        statustext: "OK",
        success: true,
        message: `The trip with ID ${id} is successfully retrieved`,
        result: [],
      });
    }

    //Check status quota of the trip
    let totalParticipants = 0;
    const tripQuota = tripData.dataValues.quota;

    const allOrderOfTheTrip = await Orders.findAll({
      where: {
        trip_id: id,
      },
    });

    for (j = 0; j < allOrderOfTheTrip.length; j++) {
      totalParticipants += allOrderOfTheTrip[j].qty;
    }

    const quotaTripRemains = Math.abs(tripQuota - totalParticipants);

    return res.status(200).json({
      code: 200,
      statustext: "OK",
      success: true,
      message: `The trip with ID ${id} is successfully retrieved`,
      result: {
        tripData,
        quotaTripRemains,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      code: 500,
      statustext: "Internal Server Error",
      success: false,
      message: "Failed to get data",
    });
  }
};

//Filter By Name
exports.getTripByName = async (req, res) => {
  try {
    const limit = req.query.limit;
    const page = req.query.page;

    const trip_name = req.query.trip_name;
    const condition = trip_name
      ? { trip_name: { [Op.iLike]: "%" + trip_name + "%" } }
      : null;

    const isTripNameExist = await Trips.findOne({
      where: { trip_name: { [Op.iLike]: "%" + trip_name + "%" } },
    });

    if (condition == null) {
      return res.status(404).json({
        code: 404,
        statustext: "Not Found",
        success: false,
        message: "Please insert a Trip or trip name",
      });
    }

    // if (!isTripNameExist) {
    //   res.status(404).json({
    //     code: 404,
    //     statustext: "Not Found",
    //     success: false,
    //     message: `Trip or Trip with keyword '${trip_name}' is not found`,
    //   });
    //   return;
    // }

    const tripByName = await Trips.findAll({
      where: condition,
      limit: limit,
      offset: page * limit,
      include: {
        model: Activities,
        attributes: {
          exclude: ["createdAt", "updatedAt"],
        },
      },
      attributes: {
        exclude: [
          "createdAt",
          "updatedAt",
          "datestamp_1",
          "datestamp_2",
          "datestamp_3",
        ],
      },
      order: [["id", "ASC"]],
    });

    return res.status(200).json({
      code: 200,
      statustext: "OK",
      success: true,
      message: `The trip with keyword ${trip_name} is successfully retrieved`,
      result: tripByName,
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      statustext: "Internal Server Error",
      success: false,
      message: "Failed to get data trip by name",
    });
  }
};

//Filter By Budget
exports.getTripByBudget = async (req, res) => {
  try {
    const min = req.query.min;
    const max = req.query.max;
    const limit = req.query.limit;
    const page = req.query.page;

    if (!min) {
      res.status(409).json({
        code: 409,
        statustext: "Conflict",
        success: false,
        message: "Input the MIN Budget, please",
      });
      return;
    }

    if (!max) {
      res.status(409).json({
        code: 409,
        statustext: "Conflict",
        success: false,
        message: "Input the MAX Budget, please",
      });
      return;
    }

    const tripByBudget = await Trips.findAll({
      where: {
        price: {
          [Op.between]: [min, max],
        },
      },
      limit: limit,
      offset: page * limit,
      include: {
        model: Activities,
        attributes: {
          exclude: ["createdAt", "updatedAt"],
        },
      },
      attributes: {
        exclude: [
          "createdAt",
          "updatedAt",
          "datestamp_1",
          "datestamp_2",
          "datestamp_3",
        ],
      },
      order: [["price", "ASC"]],
    });

    // if (tripByBudget == "") {
    //   res.status(404).json({
    //     code: 404,
    //     statustext: "Not Found",
    //     success: false,
    //     message: `There are no trips between budget Rp${min} and Rp${max}`,
    //   });
    //   return;
    // }

    res.status(200).json({
      code: 200,
      statustext: "OK",
      success: true,
      message: `The trip data by budget is successfully retrieved`,
      result: tripByBudget,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      code: 500,
      statustext: "Internal Server Error",
      success: false,
      message: "Failed to get trip data by budget",
    });
  }
};

//Filter By Date
exports.getTripByDate = async (req, res) => {
  try {
    const start = req.query.start; //date input
    const end = req.query.end; //date input
    const limit = req.query.limit;
    const page = req.query.page;

    const time_1 = start.match(/\d{2,4}/g);
    const time_2 = end.match(/\d{2,4}/g);

    const dd1 = time_1[0]; //take date
    const dd2 = time_2[0]; //take date

    const mm1 = time_1[1]; //take month
    const mm2 = time_2[1]; //take month

    const yyyy1 = time_1[2]; //take year
    const yyyy2 = time_2[2]; //take year

    const startDate = Date.parse(`${mm1}/${dd1}/${yyyy1}`) / 1000;
    const endDate = Date.parse(`${mm2}/${dd2}/${yyyy2}`) / 1000;

    if (!start) {
      res.status(409).json({
        code: 409,
        statustext: "Conflict",
        success: false,
        message: "Input the Start Date, please",
      });
      return;
    }

    if (!end) {
      res.status(409).json({
        code: 409,
        statustext: "Conflict",
        success: false,
        message: "Input the End Date, please",
      });
      return;
    }

    var tripByDate1 = await Trips.findAll({
      where: {
        datestamp_1: {
          [Op.between]: [startDate, endDate],
        },
      },

      limit: limit,
      offset: page * limit,
      include: {
        model: Activities,
        attributes: {
          exclude: ["createdAt", "updatedAt"],
        },
      },
      attributes: {
        exclude: [
          "createdAt",
          "updatedAt",
          "datestamp_1",
          "datestamp_2",
          "datestamp_3",
        ],
      },
      order: [["id", "ASC"]],
    });

    var tripByDate2 = await Trips.findAll({
      where: {
        datestamp_2: {
          [Op.between]: [startDate, endDate],
        },
      },

      limit: limit,
      offset: page * limit,
      include: {
        model: Activities,
        attributes: {
          exclude: ["createdAt", "updatedAt"],
        },
      },
      attributes: {
        exclude: [
          "createdAt",
          "updatedAt",
          "datestamp_1",
          "datestamp_2",
          "datestamp_3",
        ],
      },
      order: [["id", "ASC"]],
    });

    var tripByDate3 = await Trips.findAll({
      where: {
        datestamp_3: {
          [Op.between]: [startDate, endDate],
        },
      },

      limit: limit,
      offset: page * limit,
      include: {
        model: Activities,
        attributes: {
          exclude: ["createdAt", "updatedAt"],
        },
      },
      attributes: {
        exclude: [
          "createdAt",
          "updatedAt",
          "datestamp_1",
          "datestamp_2",
          "datestamp_3",
        ],
      },
      order: [["id", "ASC"]],
    });

    // if (tripByDate1 == "" && tripByDate2 == "" && tripByDate3 == "") {
    //   res.status(404).json({
    //     code: 404,
    //     statustext: "Not Found",
    //     success: false,
    //     message: `There are no trips schedule between date ${start} and ${end}`,
    //   });
    //   return;
    // }

    if (tripByDate1 !== "" && tripByDate2 == "" && tripByDate3 == "") {
      return res.status(200).json({
        code: 200,
        statustext: "OK",
        success: true,
        message: `The trip data by date is successfully retrieved`,
        result: tripByDate1,
      });
    }

    if (tripByDate1 == "" && tripByDate2 !== "" && tripByDate3 == "") {
      return res.status(200).json({
        code: 200,
        statustext: "OK",
        success: true,
        message: `The trip data by date is successfully retrieved`,
        result: tripByDate2,
      });
    }

    if (tripByDate1 == "" && tripByDate2 == "" && tripByDate3 !== "") {
      return res.status(200).json({
        code: 200,
        statustext: "OK",
        success: true,
        message: `The trip data by date is successfully retrieved`,
        result: tripByDate3,
      });
    }

    var tripDate1and2 = tripByDate1.concat(tripByDate2),
      tripDate1and3 = tripByDate1.concat(tripByDate3),
      tripDate2and3 = tripByDate2.concat(tripByDate3),
      tripDate123 = tripDate1and2.concat(tripByDate3);

    if (tripByDate1 !== "" && tripByDate2 !== "" && tripByDate3 == "") {
      return res.status(200).json({
        code: 200,
        statustext: "OK",
        success: true,
        message: `The trip data by date is successfully retrieved`,
        result: tripDate1and2,
      });
    }

    if (tripByDate1 !== "" && tripByDate2 == "" && tripByDate3 !== "") {
      return res.status(200).json({
        code: 200,
        statustext: "OK",
        success: true,
        message: `The trip data by date is successfully retrieved`,
        result: tripDate1and3,
      });
    }

    if (tripByDate1 == "" && tripByDate2 !== "" && tripByDate3 !== "") {
      return res.status(200).json({
        code: 200,
        statustext: "OK",
        success: true,
        message: `The trip data by date is successfully retrieved`,
        result: tripDate2and3,
      });
    }

    if (tripByDate1 !== "" && tripByDate2 !== "" && tripByDate3 !== "") {
      return res.status(200).json({
        code: 200,
        statustext: "OK",
        success: true,
        message: `The trip data by date is successfully retrieved`,
        result: tripDate123,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      code: 500,
      statustext: "Internal Server Error",
      success: false,
      message: "Failed to get trip data by date",
    });
  }
};

//Filter By Duration
exports.getTripByDuration = async (req, res) => {
  try {
    const minim = req.query.minim;
    const maxim = req.query.maxim;
    const limit = req.query.limit;
    const page = req.query.page;

    if (!minim) {
      res.status(409).json({
        code: 409,
        statustext: "Conflict",
        success: false,
        message: "Please input Minimal Trip Duration",
      });
      return;
    }

    if (!maxim) {
      res.status(409).json({
        code: 409,
        statustext: "Conflict",
        success: false,
        message: "Please input Maximal Trip Duration",
      });
      return;
    }

    // if (minim < 1) {
    //   await res.status(400).json({
    //     code: 400,
    //     statustext: "Bad Request",
    //     success: false,
    //     message: "The Trip duration cannot 0",
    //   });
    //   return;
    // }

    // if (maxim > 3) {
    //   await res.status(400).json({
    //     code: 400,
    //     statustext: "Bad Request",
    //     success: false,
    //     message: "The Trip duration cannot exceed 3",
    //   });
    //   return;
    // }

    const tripByDuration = await Trips.findAll({
      where: {
        duration_trip: {
          [Op.between]: [minim, maxim],
        },
      },
      limit: limit,
      offset: page * limit,
      include: {
        model: Activities,
        attributes: {
          exclude: ["createdAt", "updatedAt"],
        },
      },
      attributes: {
        exclude: [
          "createdAt",
          "updatedAt",
          "datestamp_1",
          "datestamp_2",
          "datestamp_3",
        ],
      },
    });

    res.status(200).json({
      code: 200,
      statustext: "OK",
      success: true,
      message: `Successfully retrieve trip data by duration`,
      result: tripByDuration,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      code: 500,
      statustext: "Internal Server Error",
      success: false,
      message: "Failed to get trip data by duration",
    });
  }
};

//! BELUM BERES BELUM ADA ACTIVITY
exports.updateTrip = async (req, res) => {
  try {
    const idInput = req.query.id;

    const {
      trip_name,
      price,
      trip_date_1,
      trip_date_2,
      trip_date_3,
      duration_trip,
      pick_spot,
      quota,
      term_and_condition,
      day1,
      time1,
      do1,
      time2,
      do2,
      time3,
      do3,
      time4,
      do4,
      day2,
      time5,
      do5,
      time6,
      do6,
      time7,
      do7,
      time8,
      do8,
      day3,
      time9,
      do9,
      time10,
      do10,
      time11,
      do11,
      time12,
      do12,
    } = req.body;

    const files = req.files;

    const thumbnail_pict = files.thumbnail_pict,
      pict_1 = files.pict_1,
      pict_2 = files.pict_2,
      pict_3 = files.pict_3,
      pict_4 = files.pict_4;

    const thumbPict = files.thumbnail_pict,
      pict1 = files.pict_1,
      pict2 = files.pict_2,
      pict3 = files.pict_3,
      pict4 = files.pict_4;

    if (
      thumbPict[0].size >= 410000 ||
      pict1[0].size >= 410000 ||
      pict2[0].size >= 410000 ||
      pict3[0].size >= 410000 ||
      pict4[0].size >= 410000
    ) {
      res.status(400).json({
        code: 400,
        statustext: "Bad Request",
        success: false,
        message:
          "Big file(s) detected. Uploaded file(s) must equal or less than 400KB",
      });
      return;
    }

    if (duration_trip == 1) {
      if (
        day2 ||
        day3 ||
        time5 ||
        time6 ||
        time7 ||
        time8 ||
        time9 ||
        time10 ||
        time11 ||
        time12 ||
        do5 ||
        do6 ||
        do7 ||
        do8 ||
        do9 ||
        do10 ||
        do11 ||
        do12
      ) {
        await res.status(400).json({
          code: 400,
          statustext: "Bad Request",
          success: false,
          message:
            "You only choose 1 day as your trip duration, cannot fill day, time, and activity for day 2 and 3",
        });
        return;
      }
    }

    if (duration_trip == 2) {
      if (
        day3 ||
        time9 ||
        time10 ||
        time11 ||
        time12 ||
        do9 ||
        do10 ||
        do11 ||
        do12
      ) {
        await res.status(400).json({
          code: 400,
          statustext: "Bad Request",
          success: false,
          message:
            "You only choose 2 days as your trip duration, cannot fill day, time, and activity for day 3",
        });
        return;
      }
    }

    if (duration_trip == 0) {
      await res.status(400).json({
        code: 400,
        statustext: "Bad Request",
        success: false,
        message: "The days of 'duration_trip' cannot 0 ",
      });
      return;
    }

    if (duration_trip > 3) {
      await res.status(400).json({
        code: 400,
        statustext: "Bad Request",
        success: false,
        message: "The days of 'duration_trip' cannot more than 3 ",
      });
      return;
    }

    if (
      trip_name == "" ||
      price == "" ||
      trip_date_1 == "" ||
      duration_trip == "" ||
      quota == "" ||
      day1 == "" ||
      time1 == "" ||
      do1 == ""
    ) {
      res.status(400).json({
        code: 400,
        statustext: "Bad Request",
        success: false,
        message:
          "Please fill all these columns: 'trip_name', 'price', 'trip_date_1', 'duration_trip', and 'quota', 'day1', 'time1', 'do1'.",
      });
      return;
    }

    if (
      thumbnail_pict === undefined ||
      pict_1 === undefined ||
      pict_2 === undefined ||
      pict_3 === undefined ||
      pict_4 === undefined
    ) {
      res.status(409).json({
        code: 409,
        statustext: "Conflict",
        success: false,
        message:
          "Please insert a thumbnail photo + four (4) photos of your amazing trip",
      });
      return;
    }

    if (!trip_date_1) {
      res.status(409).json({
        code: 409,
        statustext: "Conflict",
        message: "Please fill trip date 1 with format DD/MM/YYYY",
        success: false,
      });
      return;
    }

    //Kalau trip date_2 kosong
    if (trip_date_2 == 0 || trip_date_2 == "" || trip_date_2 == undefined) {
      if (!trip_date_1) {
        res.status(409).json({
          code: 409,
          statustext: "Conflict",
          success: false,
          message:
            "Please fill trip date 1 with format DD/MM/YYYY before trip date 2 and 3",
        });
        return;
      }

      if (trip_date_3) {
        res.status(409).json({
          code: 409,
          statustext: "Conflict",
          success: false,
          message: "Please fill date 2 with format DD/MM/YYYY before date 3",
        });
        return;
      }

      const time_1 = trip_date_1.match(/\d{2,4}/g);

      const dd1 = time_1[0]; //take date
      const mm1 = time_1[1]; //take month
      const yyyy1 = time_1[2]; //take year

      const datestamp_1 = Date.parse(`${mm1}/${dd1}/${yyyy1}`) / 1000;

      const matchTripByName = await Trips.findOne({
        where: {
          trip_name: trip_name,
        },
      });

      // if (matchTripByName) {
      //   res.status(409).json({
      //     code: 409,
      //     statustext: "Conflict",
      //     success: false,
      //     messsage:
      //       "Trip name already exist in database. Please change it.",
      //   });
      // }

      // AWS S3 Upload Coding
      //Set Up the Keys Name of file which will upload
      const keyName1 = `Trips/thumbnail_pict/${new Date().getTime()}-${
        files.thumbnail_pict[0]
      }`;
      const keyName2 = `Trips/pict1/${new Date().getTime()}-${files.pict_1[0]}`;
      const keyName3 = `Trips/pict2/${new Date().getTime()}-${files.pict_2[0]}`;
      const keyName4 = `Trips/pict3/${new Date().getTime()}-${files.pict_3[0]}`;
      const keyName5 = `Trips/pict4/${new Date().getTime()}-${files.pict_4[0]}`;

      //Preparing the params for uploading to AWS S3
      const params1 = {
        ACL: "public-read",
        Body: files.thumbnail_pict[0].buffer,
        Bucket: process.env.AWS_BUCKET_NAME,
        ContentType: "image/jpeg",
        Key: keyName1,
      };

      const params2 = {
        ACL: "public-read",
        Body: files.pict_1[0].buffer,
        Bucket: process.env.AWS_BUCKET_NAME,
        ContentType: "image/jpeg",
        Key: keyName2,
      };

      const params3 = {
        ACL: "public-read",
        Body: files.pict_2[0].buffer,
        Bucket: process.env.AWS_BUCKET_NAME,
        ContentType: "image/jpeg",
        Key: keyName3,
      };

      const params4 = {
        ACL: "public-read",
        Body: files.pict_3[0].buffer,
        Bucket: process.env.AWS_BUCKET_NAME,
        ContentType: "image/jpeg",
        Key: keyName4,
      };

      const params5 = {
        ACL: "public-read",
        Body: files.pict_4[0].buffer,
        Bucket: process.env.AWS_BUCKET_NAME,
        ContentType: "image/jpeg",
        Key: keyName5,
      };

      const params = [params1, params2, params3, params4, params5];

      const element = {};
      const arrDate = [];

      element.trip_date_1 = trip_date_1;
      element.trip_date_2 = "";
      element.trip_date_3 = "";

      arrDate.push(element);

      const day_time_act = [];

      const tact1 = {},
        tact2 = {},
        tact3 = {},
        tact4 = {},
        activity1 = [],
        object1 = {};

      const tact5 = {},
        tact6 = {},
        tact7 = {},
        tact8 = {},
        activity2 = [],
        object2 = {};

      const tact9 = {},
        tact10 = {},
        tact11 = {},
        tact12 = {},
        activity3 = [],
        object3 = {};

      tact1.time = time1;
      tact1.do = do1;
      tact2.time = time2;
      tact2.do = do2;
      tact3.time = time3;
      tact3.do = do3;
      tact4.time = time4;
      tact4.do = do4;

      tact5.time = time5;
      tact5.do = do5;
      tact6.time = time6;
      tact6.do = do6;
      tact7.time = time7;
      tact7.do = do7;
      tact8.time = time8;
      tact8.do = do8;

      tact9.time = time9;
      tact9.do = do9;
      tact10.time = time10;
      tact10.do = do10;
      tact11.time = time11;
      tact11.do = do11;
      tact12.time = time12;
      tact12.do = do12;

      activity1.push(tact1, tact2, tact3, tact4);
      activity2.push(tact5, tact6, tact7, tact8);
      activity3.push(tact9, tact10, tact11, tact12);

      object1.day = day1;
      object1.activity = activity1;
      object2.day = day2;
      object2.activity = activity2;
      object3.day = day3;
      object3.activity = activity3;

      day_time_act.push(object1, object2, object3);

      // const token = req.headers.authorization;
      // const decoded = jwt.verify(token, process.env.SECRET_KEY);

      //Algorithm for uploading multiple files to AWS
      const responseData = [];
      for (i = 0; i < 5; i++) {
        if (params.length < 5) {
          return res.status(500).json({
            code: 500,
            statustext: "Internal Server Error",
            success: false,
            message:
              "Failed to get files data to be uploaded, please try again",
          });
        } else {
          responseData.push(await s3.upload(params[i]).promise());
          if (responseData.length == params.length) {
            const thumbnail_pict_url = responseData[0].Location;
            const pict_1_url = responseData[1].Location;
            const pict_2_url = responseData[2].Location;
            const pict_3_url = responseData[3].Location;
            const pict_4_url = responseData[4].Location;

            await Trips.update(
              {
                ...req.body,
                trip_date_1: trip_date_1,
                datestamp_1: datestamp_1,
                trip_date_2: 0,
                datestamp_2: 0,
                trip_date_3: 0,
                datestamp_3: 0,
                trip_date_array: arrDate,
                thumbnail_pict: thumbnail_pict_url,
                pict_1: pict_1_url,
                pict_2: pict_2_url,
                pict_3: pict_3_url,
                pict_4: pict_4_url,
              },
              {
                where: {
                  id: idInput,
                },
              }
            );

            await Activities.update(
              {
                day_time_act: day_time_act,
              },
              {
                where: {
                  trip_id: idInput,
                },
              }
            );

            const findTrip = await Trips.findOne({
              where: {
                id: idInput,
              },
              include: {
                model: Activities,
                attributes: {
                  exclude: ["createdAt", "updatedAt"],
                },
              },
              attributes: {
                exclude: [
                  "createdAt",
                  "updatedAt",
                  "datestamp_1",
                  "datestamp_2",
                  "datestamp_3",
                ],
              },
            });

            if (!findTrip) {
              return res.status(404).json({
                code: 404,
                statustext: "Not Found",
                success: false,
                message: `The trip with ID ${idInput} is not found`,
              });
            }

            return res.status(201).json({
              code: 201,
              statustext: "Created",
              success: true,
              message: "You are successfully updated a Trip.",
              result: findTrip,
            });
          }
        }
      }
    }

    //Kalau trip date_3 kosong
    if (trip_date_3 == 0 || trip_date_3 == "" || trip_date_3 == undefined) {
      if (!trip_date_1) {
        res.status(409).json({
          code: 409,
          statustext: "Conflict",
          success: false,
          message:
            "Please fill trip date 1 with format DD/MM/YYYY before trip date 2 and 3",
        });
        return;
      }

      const time_1 = trip_date_1.match(/\d{2,4}/g);
      const time_2 = trip_date_2.match(/\d{2,4}/g);

      const dd1 = time_1[0]; //take date
      const mm1 = time_1[1]; //take month
      const yyyy1 = time_1[2]; //take year

      const dd2 = time_2[0]; //take date
      const mm2 = time_2[1]; //take month
      const yyyy2 = time_2[2]; //take year

      const datestamp_1 = Date.parse(`${mm1}/${dd1}/${yyyy1}`) / 1000;
      const datestamp_2 = Date.parse(`${mm2}/${dd2}/${yyyy2}`) / 1000;

      const matchTripByName = await Trips.findOne({
        where: {
          trip_name: trip_name,
        },
      });

      // if (matchTripByName) {
      //   return res.status(409).json({
      //     code: 409,
      //     statustext: "Conflict",
      //     success: false,
      //     messsage:
      //       "Trip name already exist in database. Please change it.",
      //   });
      // }

      // AWS S3 Upload Coding
      //Set Up the Keys Name of file which will upload
      const keyName1 = `Trips/thumbnail_pict/${new Date().getTime()}-${
        files.thumbnail_pict[0]
      }`;
      const keyName2 = `Trips/pict1/${new Date().getTime()}-${files.pict_1[0]}`;
      const keyName3 = `Trips/pict2/${new Date().getTime()}-${files.pict_2[0]}`;
      const keyName4 = `Trips/pict3/${new Date().getTime()}-${files.pict_3[0]}`;
      const keyName5 = `Trips/pict4/${new Date().getTime()}-${files.pict_4[0]}`;

      //Preparing the params for uploading to AWS S3
      const params1 = {
        ACL: "public-read",
        Body: files.thumbnail_pict[0].buffer,
        Bucket: process.env.AWS_BUCKET_NAME,
        ContentType: "image/jpeg",
        Key: keyName1,
      };

      const params2 = {
        ACL: "public-read",
        Body: files.pict_1[0].buffer,
        Bucket: process.env.AWS_BUCKET_NAME,
        ContentType: "image/jpeg",
        Key: keyName2,
      };

      const params3 = {
        ACL: "public-read",
        Body: files.pict_2[0].buffer,
        Bucket: process.env.AWS_BUCKET_NAME,
        ContentType: "image/jpeg",
        Key: keyName3,
      };

      const params4 = {
        ACL: "public-read",
        Body: files.pict_3[0].buffer,
        Bucket: process.env.AWS_BUCKET_NAME,
        ContentType: "image/jpeg",
        Key: keyName4,
      };

      const params5 = {
        ACL: "public-read",
        Body: files.pict_4[0].buffer,
        Bucket: process.env.AWS_BUCKET_NAME,
        ContentType: "image/jpeg",
        Key: keyName5,
      };

      const params = [params1, params2, params3, params4, params5];

      const element = {};
      const arrDate = [];

      element.trip_date_1 = trip_date_1;
      element.trip_date_2 = trip_date_2;
      element.trip_date_3 = "";

      arrDate.push(element);

      const day_time_act = [];

      const tact1 = {},
        tact2 = {},
        tact3 = {},
        tact4 = {},
        activity1 = [],
        object1 = {};

      const tact5 = {},
        tact6 = {},
        tact7 = {},
        tact8 = {},
        activity2 = [],
        object2 = {};

      const tact9 = {},
        tact10 = {},
        tact11 = {},
        tact12 = {},
        activity3 = [],
        object3 = {};

      tact1.time = time1;
      tact1.do = do1;
      tact2.time = time2;
      tact2.do = do2;
      tact3.time = time3;
      tact3.do = do3;
      tact4.time = time4;
      tact4.do = do4;

      tact5.time = time5;
      tact5.do = do5;
      tact6.time = time6;
      tact6.do = do6;
      tact7.time = time7;
      tact7.do = do7;
      tact8.time = time8;
      tact8.do = do8;

      tact9.time = time9;
      tact9.do = do9;
      tact10.time = time10;
      tact10.do = do10;
      tact11.time = time11;
      tact11.do = do11;
      tact12.time = time12;
      tact12.do = do12;

      activity1.push(tact1, tact2, tact3, tact4);
      activity2.push(tact5, tact6, tact7, tact8);
      activity3.push(tact9, tact10, tact11, tact12);

      object1.day = day1;
      object1.activity = activity1;
      object2.day = day2;
      object2.activity = activity2;
      object3.day = day3;
      object3.activity = activity3;

      day_time_act.push(object1, object2, object3);

      // const token = req.headers.authorization;
      // const decoded = jwt.verify(token, process.env.SECRET_KEY);

      //Algorithm for uploading multiple files to AWS
      const responseData = [];
      for (i = 0; i < 5; i++) {
        if (params.length < 5) {
          return res.status(500).json({
            code: 500,
            statustext: "Internal Server Error",
            success: false,
            message:
              "Failed to get files data to be uploaded, please try again",
          });
        } else {
          responseData.push(await s3.upload(params[i]).promise());
          if (responseData.length == params.length) {
            const thumbnail_pict_url = responseData[0].Location;
            const pict_1_url = responseData[1].Location;
            const pict_2_url = responseData[2].Location;
            const pict_3_url = responseData[3].Location;
            const pict_4_url = responseData[4].Location;

            await Trips.update(
              {
                ...req.body,
                trip_date_1: trip_date_1,
                datestamp_1: datestamp_1,
                trip_date_2: trip_date_2,
                datestamp_2: datestamp_2,
                trip_date_3: 0,
                datestamp_3: 0,
                trip_date_array: arrDate,
                thumbnail_pict: thumbnail_pict_url,
                pict_1: pict_1_url,
                pict_2: pict_2_url,
                pict_3: pict_3_url,
                pict_4: pict_4_url,
              },
              {
                where: {
                  id: idInput,
                },
              }
            );

            await Activities.update(
              {
                day_time_act: day_time_act,
              },
              {
                where: {
                  trip_id: idInput,
                },
              }
            );

            const findTrip = await Trips.findOne({
              where: {
                id: idInput,
              },
              include: {
                model: Activities,
                attributes: {
                  exclude: ["createdAt", "updatedAt"],
                },
              },
              attributes: {
                exclude: [
                  "createdAt",
                  "updatedAt",
                  "datestamp_1",
                  "datestamp_2",
                  "datestamp_3",
                ],
              },
            });

            if (!findTrip) {
              return res.status(404).json({
                code: 404,
                statustext: "Not Found",
                success: false,
                message: `The Trip with ID ${idInput} is not found`,
              });
            }

            return res.status(201).json({
              code: 201,
              statustext: "Created",
              success: true,
              message: "You are successfully updated a Trip.",
              result: findTrip,
            });
          }
        }
      }
    }

    //Kalau semua trip date terisi
    const time_1 = trip_date_1.match(/\d{2,4}/g);
    const time_2 = trip_date_2.match(/\d{2,4}/g);
    const time_3 = trip_date_3.match(/\d{2,4}/g);

    const dd1 = time_1[0]; //take date
    const dd2 = time_2[0]; //take date
    const dd3 = time_3[0]; //take date

    const mm1 = time_1[1]; //take month
    const mm2 = time_2[1]; //take month
    const mm3 = time_3[1]; //take month

    const yyyy1 = time_1[2]; //take year
    const yyyy2 = time_2[2]; //take year
    const yyyy3 = time_3[2]; //take year

    const datestamp_1 = Date.parse(`${mm1}/${dd1}/${yyyy1}`) / 1000;
    const datestamp_2 = Date.parse(`${mm2}/${dd2}/${yyyy2}`) / 1000;
    const datestamp_3 = Date.parse(`${mm3}/${dd3}/${yyyy3}`) / 1000;

    const matchTripByName = await Trips.findOne({
      where: {
        trip_name: trip_name,
      },
    });

    // if (matchTripByName) {
    //   return res.status(409).json({
    //     code: 409,
    //     statustext: "Conflict",
    //     success: false,
    //     messsage: "Trip name already exist in database. Please change it.",
    //   });
    // }

    // AWS S3 Upload Coding
    //Set Up the Keys Name of file which will upload
    const keyName1 = `Trips/thumbnail_pict/${new Date().getTime()}-${
      files.thumbnail_pict[0]
    }`;
    const keyName2 = `Trips/pict1/${new Date().getTime()}-${files.pict_1[0]}`;
    const keyName3 = `Trips/pict2/${new Date().getTime()}-${files.pict_2[0]}`;
    const keyName4 = `Trips/pict3/${new Date().getTime()}-${files.pict_3[0]}`;
    const keyName5 = `Trips/pict4/${new Date().getTime()}-${files.pict_4[0]}`;

    //Preparing the params for uploading to AWS S3
    const params1 = {
      ACL: "public-read",
      Body: files.thumbnail_pict[0].buffer,
      Bucket: process.env.AWS_BUCKET_NAME,
      ContentType: "image/jpeg",
      Key: keyName1,
    };

    const params2 = {
      ACL: "public-read",
      Body: files.pict_1[0].buffer,
      Bucket: process.env.AWS_BUCKET_NAME,
      ContentType: "image/jpeg",
      Key: keyName2,
    };

    const params3 = {
      ACL: "public-read",
      Body: files.pict_2[0].buffer,
      Bucket: process.env.AWS_BUCKET_NAME,
      ContentType: "image/jpeg",
      Key: keyName3,
    };

    const params4 = {
      ACL: "public-read",
      Body: files.pict_3[0].buffer,
      Bucket: process.env.AWS_BUCKET_NAME,
      ContentType: "image/jpeg",
      Key: keyName4,
    };

    const params5 = {
      ACL: "public-read",
      Body: files.pict_4[0].buffer,
      Bucket: process.env.AWS_BUCKET_NAME,
      ContentType: "image/jpeg",
      Key: keyName5,
    };

    const params = [params1, params2, params3, params4, params5];

    const element = {};
    const arrDate = [];

    element.trip_date_1 = trip_date_1;
    element.trip_date_2 = trip_date_2;
    element.trip_date_3 = trip_date_3;

    arrDate.push(element);

    const day_time_act = [];

    const tact1 = {},
      tact2 = {},
      tact3 = {},
      tact4 = {},
      activity1 = [],
      object1 = {};

    const tact5 = {},
      tact6 = {},
      tact7 = {},
      tact8 = {},
      activity2 = [],
      object2 = {};

    const tact9 = {},
      tact10 = {},
      tact11 = {},
      tact12 = {},
      activity3 = [],
      object3 = {};

    tact1.time = time1;
    tact1.do = do1;
    tact2.time = time2;
    tact2.do = do2;
    tact3.time = time3;
    tact3.do = do3;
    tact4.time = time4;
    tact4.do = do4;

    tact5.time = time5;
    tact5.do = do5;
    tact6.time = time6;
    tact6.do = do6;
    tact7.time = time7;
    tact7.do = do7;
    tact8.time = time8;
    tact8.do = do8;

    tact9.time = time9;
    tact9.do = do9;
    tact10.time = time10;
    tact10.do = do10;
    tact11.time = time11;
    tact11.do = do11;
    tact12.time = time12;
    tact12.do = do12;

    activity1.push(tact1, tact2, tact3, tact4);
    activity2.push(tact5, tact6, tact7, tact8);
    activity3.push(tact9, tact10, tact11, tact12);

    object1.day = day1;
    object1.activity = activity1;
    object2.day = day2;
    object2.activity = activity2;
    object3.day = day3;
    object3.activity = activity3;

    day_time_act.push(object1, object2, object3);

    // const token = req.headers.authorization;
    // const decoded = jwt.verify(token, process.env.SECRET_KEY);

    //Algorithm for uploading multiple files to AWS
    const responseData = [];
    for (i = 0; i < 5; i++) {
      if (params.length < 5) {
        return res.status(500).json({
          code: 500,
          statustext: "Internal Server Error",
          success: false,
          message: "Failed to get files data to be uploaded, please try again",
        });
      } else {
        responseData.push(await s3.upload(params[i]).promise());
        if (responseData.length == params.length) {
          const thumbnail_pict_url = responseData[0].Location;
          const pict_1_url = responseData[1].Location;
          const pict_2_url = responseData[2].Location;
          const pict_3_url = responseData[3].Location;
          const pict_4_url = responseData[4].Location;

          await Trips.update(
            {
              ...req.body,
              trip_date_1: trip_date_1,
              datestamp_1: datestamp_1,
              trip_date_2: trip_date_2,
              datestamp_2: datestamp_2,
              trip_date_3: trip_date_3,
              datestamp_3: datestamp_3,
              trip_date_array: arrDate,
              thumbnail_pict: thumbnail_pict_url,
              pict_1: pict_1_url,
              pict_2: pict_2_url,
              pict_3: pict_3_url,
              pict_4: pict_4_url,
            },
            {
              where: {
                id: idInput,
              },
            }
          );

          await Activities.update(
            {
              day_time_act: day_time_act,
            },
            {
              where: {
                trip_id: idInput,
              },
            }
          );

          const findTrip = await Trips.findOne({
            where: {
              id: idInput,
            },
            include: {
              model: Activities,
              attributes: {
                exclude: ["createdAt", "updatedAt"],
              },
            },
            attributes: {
              exclude: [
                "createdAt",
                "updatedAt",
                "datestamp_1",
                "datestamp_2",
                "datestamp_3",
              ],
            },
          });

          if (!findTrip) {
            res.status(404).json({
              code: 404,
              statustext: "Not Found",
              success: false,
              message: `The Trip with ID ${idInput} is not found`,
            });
          }

          return res.status(201).json({
            code: 201,
            statustext: "Created",
            success: true,
            message: "You are successfully updated new Trip.",
            result: findTrip,
          });
        }
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      code: 500,
      statustext: "Internal Server Error",
      success: false,
      message: "Failed to create a new trip",
    });
  }
};

exports.deleteTrip = async (req, res) => {
  try {
    const idInput = req.query.id;

    const findOneTrip = await Trips.findOne({
      where: { id: idInput },
      include: {
        model: Activities,
        attributes: {
          exclude: ["createdAt", "updatedAt"],
        },
      },
    });

    if (!findOneTrip) {
      res.status(404).json({
        code: 404,
        statustext: "Not Found",
        success: false,
        message: `The Trip data with ID ${idInput} is not found`,
      });
    }

    const token = req.headers.authorization;
    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    if (decoded.users_role_id == 3) {
      await Trips.destroy({
        where: { id: idInput },
      });

      await Activities.destroy({
        where: { trip_id: idInput },
      });

      return res.status(200).json({
        code: 200,
        statustext: "OK",
        success: true,
        message: `The Trip and Activities data with Trip ID ${idInput} is successfully deleted`,
        result: findOneTrip,
      });
    }

    if (decoded.users_role_id == 1 && findOneTrip.user_id == decoded.user_id) {
      await Trips.destroy({
        where: { id: idInput },
      });

      await Activities.destroy({
        where: { trip_id: idInput },
      });

      return res.status(200).json({
        code: 200,
        statustext: "OK",
        success: true,
        message: `The Trip and Activities data with Trip ID ${idInput} is successfully deleted`,
        result: findOneTrip,
      });
    } else {
      return res.status(409).json({
        code: 409,
        statustext: "Conflict",
        success: false,
        messsage: "Host ID is not match with the Trip ID",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      code: 500,
      statustext: "Internal Server Error",
      success: false,
      message: "Failed to get data",
    });
  }
};

exports.getTotalParticipantsAllTripsPerHost = async (req, res) => {
  try {
    const token = req.headers.authorization;

    const decodedToken = jwt.verify(token, process.env.SECRET_KEY);

    const dataTrip = await Trips.findAll({
      where: {
        user_id: decodedToken.user_id,
      },
    });

    const arrStatus = [];
    const obj = {};

    for (i = 0; i < dataTrip.length; i++) {
      let totalParticipants = 0;
      let status = "Available";

      const totalQuota = dataTrip[i].dataValues.quota;

      const dataOrder = await Orders.findAll({
        where: {
          trip_id: dataTrip[i].dataValues.id,
        },
      });

      for (j = 0; j < dataOrder.length; j++) {
        totalParticipants += dataOrder[j].qty;
      }

      if (totalParticipants >= totalQuota) {
        status = "Full";
      }

      k = i + 1;
      obj["trip ke-" + k] = {
        totalParticipants: totalParticipants,
        totalQuota: totalQuota,
        status: status,
        quota: `${totalParticipants} / ${totalQuota}`,
        trip_name: dataTrip[i].dataValues.trip_name,
        user_id: dataTrip[i].dataValues.user_id,
        trip_id: dataTrip[i].dataValues.id,
        trip_date: dataTrip[i].dataValues.trip_date_array,
        price: dataTrip[i].dataValues.price,
        thumbnail_pict: dataTrip[i].dataValues.thumbnail_pict,
      };

      arrStatus.push(obj["trip ke-" + k]);
    }

    // console.log(arrStatus)

    res.status(200).json({
      code: 200,
      statustext: "OK",
      success: true,
      message: `Successfully retrived trip data of the host ${decodedToken.username} with id: ${decodedToken.user_id}`,
      result: arrStatus,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      code: 500,
      statustext: "Internal Server Error",
      success: false,
      message: "Failed to get total participants per trip",
    });
  }
};
