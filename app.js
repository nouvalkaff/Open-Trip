const express = require("express");
const cors = require("cors");

require("dotenv").config();
const app = express();

app.use(express.static("public"));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const activitiesRoute = require("./routes/activitiesRoute"),
  categoryRoute = require("./routes/categoryRoute"),
  adminRoutes = require("./routes/adminRoutes"),
  travellerRoutes = require("./routes/travellerRoutes"),
  hostRoutes = require("./routes/hostRoutes"),
  usersRoleRoutes = require("./routes/usersRoleRoutes"),
  bankAccountRoutes = require("./routes/bankAccountRoutes"),
  masterBankAccountRoutes = require("./routes/masterBankAccountRoutes"),
  tripRoutes = require("./routes/tripRoutes"),
  userPaymentRoute = require("./routes/userPaymentRoute"),
  ordersRoute = require("./routes/ordersRoute");

app.use(
  cors({
    origin: "*",
  })
);

app.use(
  "/api/ot",
  activitiesRoute,
  categoryRoute,
  adminRoutes,
  travellerRoutes,
  hostRoutes,
  bankAccountRoutes,
  usersRoleRoutes,
  tripRoutes,
  masterBankAccountRoutes,
  userPaymentRoute,
  ordersRoute
);

app.all("/", (req, res) => {
  res.status(200).send({
    code: 200,
    statustext: "OK",
    success: true,
    message: "Welcome to Open-Trip API",
  });
});

app.all("*", (req, res) =>
  res.send("ROUTE NOT FOUND, PLEASE DOUBLE CHECK YOUR ROUTE OR URL")
);

// app.listen(process.env.PORT || 5000, async () => {
//   try {
//     console.log(`SERVER IS RUNNING ON PORT 5000 or ${process.env.PORT}`);
//     await sequelize.authenticate();
//     console.log("Database Connected");
//   } catch (error) {
//     console.error("Message error: ", error);
//   }
// });

app.listen(process.env.PORT, () => {
  console.log(`SERVER IS RUNNING ON PORT 5000 or ${process.env.PORT}`);
});
