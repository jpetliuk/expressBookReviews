const express = require("express");
const axios = require("axios");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
   const username = req.body.username;
   const password = req.body.password;

   if (!username || !password) {
      return res
         .status(400)
         .json({ message: "Username and password required" });
   }

   if (isValid(username)) {
      return res.status(400).json({ message: "Username already exists" });
   }

   users.push({ username: username, password: password });
   return res
      .status(200)
      .json({ message: "User successfully registered. Now you can login." });
});

// Simulate API call with setTimeout and a chance of failure
const simulateApiCall = (data) => {
   return new Promise((resolve, reject) => {
      setTimeout(() => {
         if (Math.random() < 0.25) {
            reject(new Error("API call failed"));
         } else {
            resolve(data);
         }
      }, 500); // Simulate a 500ms delay
   });
};

// Get the book list available in the shop (Task 10)
public_users.get("/", async function (req, res) {
   try {
      const bookList = await simulateApiCall(Object.values(books));
      return res.status(200).json(bookList);
   } catch (error) {
      console.error("Error fetching books:", error);
      return res
         .status(500)
         .json({
            message: "Failed to retrieve book list",
            error: error.message,
         });
   }
});

// Get book details based on ISBN (Task 11)
public_users.get("/isbn/:isbn", async function (req, res) {
   const isbn = req.params.isbn;
   try {
      const book = await simulateApiCall(books[isbn]);
      if (book) {
         return res.status(200).json(book);
      } else {
         return res.status(404).json({ message: "Book not found" });
      }
   } catch (error) {
      console.error(`Error fetching book with ISBN ${isbn}:`, error);
      return res.status(500).json({
         message: `Failed to retrieve book with ISBN ${isbn}`,
         error: error.message,
      });
   }
});

// Get book details based on author (Task 12)
public_users.get("/author/:author", async function (req, res) {
   const author = req.params.author;
   try {
      const book_array = Object.values(books);
      const filtered_books = book_array.filter(
         (book) => book.author.toLowerCase().split(" ").join("_") === author
      );
      const result = await simulateApiCall(filtered_books);

      if (result.length > 0) {
         return res.status(200).json(result);
      } else {
         return res
            .status(404)
            .json({ message: "No books found by this author" });
      }
   } catch (error) {
      console.error(`Error fetching books by author ${author}:`, error);
      return res.status(500).json({
         message: `Failed to retrieve books by author ${author}`,
         error: error.message,
      });
   }
});

// Get all books based on title (Task 13)
public_users.get("/title/:title", async function (req, res) {
   const title = req.params.title;
   try {
      const book_array = Object.values(books);
      const filtered_books = book_array.filter(
         (book) => book.title.toLowerCase().split(" ").join("_") === title
      );
      const result = await simulateApiCall(filtered_books);

      if (result.length > 0) {
         return res.status(200).json(result);
      } else {
         return res
            .status(404)
            .json({ message: "No books found with this title" });
      }
   } catch (error) {
      console.error(`Error fetching books with title ${title}:`, error);
      return res.status(500).json({
         message: `Failed to retrieve books with title ${title}`,
         error: error.message,
      });
   }
});

// Get book review
public_users.get("/review/:isbn", function (req, res) {
   const isbn = req.params.isbn;
   const book = books[isbn];

   if (book && book.reviews) {
      return res.status(200).json(book.reviews);
   } else {
      return res
         .status(404)
         .json({ message: "No reviews found for this book" });
   }
});

module.exports.general = public_users;
