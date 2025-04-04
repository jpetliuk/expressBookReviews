const express = require("express");
const jwt = require("jsonwebtoken");
const session = require("express-session");
const customer_routes = require("./router/auth_users.js").authenticated;
const general_routes = require("./router/general.js").general;

const app = express();

app.use(express.json());

app.use(
   "/customer",
   session({
      secret: "fingerprint_customer",
      resave: true,
      saveUninitialized: true,
      cookie: {
         httpOnly: true,
         secure: false,
         maxAge: 24 * 60 * 60 * 1000, // 1 day
      },
   })
);

app.use("/customer/auth/*", function auth(req, res, next) {
   const token = req.session.token;

   if (!token) {
      return res.status(401).json({ message: "No token provided." });
   }

   jwt.verify(token, "access", (err, user) => {
      if (err) {
         return res
            .status(403)
            .json({ message: "Failed to authenticate token." });
      }

      req.user = user;
      next();
   });
});

const PORT = 4000;

app.use("/customer", customer_routes);
app.use("/", general_routes);

app.listen(PORT, () => console.log("Server is running at port: " + PORT));
