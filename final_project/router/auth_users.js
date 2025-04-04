const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
   //returns boolean
   //write code to check is the username is valid
   let matchedUsers = users.filter((user) => user.username === username);
   return matchedUsers.length > 0;
};

const authenticatedUser = (username, password) => {
   //returns boolean
   //write code to check if username and password match the one we have in records.
   let matchedUsers = users.filter(
      (user) => user.username === username && user.password === password
   );
   return matchedUsers.length > 0;
};

//only registered users can login
regd_users.post("/login", (req, res) => {
   const username = req.body.username;
   const password = req.body.password;

   if (!username || !password) {
      return res
         .status(400)
         .json({ message: "Username and password required" });
   }

   if (!authenticatedUser(username, password)) {
      return res.status(401).json({ message: "Invalid username or password" });
   }

   const token = jwt.sign({ username: username }, "access");

   req.session.token = token;

   return res
      .status(200)
      .json({ message: "User logged in successfully", token: token });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
   const isbn = req.params.isbn;
   const username = req.user.username;
   const review = req.body.review;

   if (!review) {
      return res.status(400).json({ message: "Review text is required" });
   }

   if (!books[isbn]) {
      return res.status(404).json({ message: "Book not found" });
   }

   if (!books[isbn].reviews) {
      books[isbn].reviews = {};
   }

   books[isbn].reviews[username] = review;

   return res.status(200).json({ message: "Review added successfully" });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
   const isbn = req.params.isbn;
   const username = req.user.username;

   const book = books[isbn];

   if (!book) {
      return res.status(404).json({ message: "Book not found" });
   }

   if (!book.reviews || !book.reviews[username]) {
      return res
         .status(404)
         .json({ message: "Review not found for this user" });
   }

   delete book.reviews[username];

   return res.status(200).json({ message: "Review deleted successfully" });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
