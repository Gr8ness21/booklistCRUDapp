// DEPENDENCIES
const express = require("express");
const app = express();
require("dotenv").config();
const PORT = process.env.PORT;
const uri = process.env.MONGO_URI;
const methodOverride = require("method-override");
const mongoose = require("mongoose");
const Book = require("./models/Book.js");


// DATABASE
// MongoDB Connection
mongoose.connect(process.env.MONGO_URI);

const db = mongoose.connection
db.on('error', (error) => console.log(error.message + ' mongo is not running!'))
db.on('connected', () => console.log('mongo is connected!'))
db.on('disconnected',() => console.log('mongo has been disconnected!'))


// const books = [
//     {title: "Ultimate Star Wars Guide",
//     author: "George Lucas",
//     completed: true,
//     },
//     {title: "The Alchemist",
//     author: "Paulo Coelho",
//     completed: true,
//     },
//     {title: "Open Water",
//     author: "Caleb Azumah Nelson",
//     completed: false,
//     },
//     {title: "The Art of War",
//     author: "Sun Tzu",
//     completed: false,
//     },
//     {title: "The Circle of Fire",
//     author: "Don Miguel Ruiz & Janet Mills",
//     completed: false,
//     },
// ]

// MIDDLEWARE
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(methodOverride("_method"));
app.use(express.static("public"));



// ROUTES
// I.N.D.U.C.E.S.

// Index - List
app.get("/books/", async (req, res)=>{
    // res.render("index.ejs") <- For testing!
    try{
        const allBooks = await Book.find({});
        res.render("index.ejs", {
            books: allBooks
        });
    }catch(error){
        console.error("There was an issue rendering all books: ", error)
        res.status(500).send(error)
    }
});

// New - Generate a form for the creation of a new book
app.get("/books/new", (req, res)=>{
    res.render("new.ejs")
});

// Delete - Destroy or remove data from database
app.delete("/books/:id", async (req, res)=>{
    // res.send("Book's being deleted...") <- to test if it does the thing

    try{
        await Book.findByIdAndDelete(req.params.id);
        res.redirect("/books") // should redirect to main book list
    }catch(error){
        console.error(error)
        res.status(500).send("There was an issue deleting the book...")
    }

});


// Update - Perform the action of changing the content
app.put("/books/:id", async (req, res)=>{

    if(req.body.completed === 'on'){
        req.body.completed = true;
    } else {
        req.body.completed = false;
    }

    try{
        const updatedBook = await Book.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        ).exec();
        res.redirect(`/books/${req.params.id}`)
    } catch(error){
        console.error(error);
        res.status(500).send("There seems to be an issue with the update...")
    }

});

// Create - Make a book!
app.post("/books/", (req, res)=>{
    // Checking to see if book is complete
    if(req.body.completed === 'on'){
        req.body.completed = true;
    } else {
        req.body.completed = false;
    }

    Book.create(req.body)
        .then(createdBook => {
            console.log('Book has been successfully created!')
            console.log(req.body)
            res.redirect("/books")
        }).catch(error => {
            console.error('Error Creating The Book...', error)
            res.status(500).send("SORRY ISSUE CREATING BOOK!")
        })
});

// Edit - give us a form to edit content
app.get("/books/:id/edit", async (req, res)=>{
    // res.render("edit.ejs") <- fine for rendering a page/test
    try{
        // grab my "found book"
        const foundBook = await Book.findById(req.params.id)

        // if the book's not found..
        if(!foundBook){
            return res.status(404).send("Book Not Found")
        }

        res.render("edit.ejs", { book: foundBook})

    } catch(error){
        console.error(error)
        res.status(500).send("SERVER ISSUE!")
    }
});

// Show - One Individual Book
app.get("/books/:id",async (req, res) =>{
    // res.render("show.ejs") <-fine for rendering simple page
    try{
        const foundBook = await Book.findById(req.params.id)
        res.render("show.ejs", {
            book: foundBook,
        });
    }catch(error){
        res.status(500).send("ISSUE FINDING INDIVIDUAL BOOK!")
    }
});

// PORT
app.listen(PORT, ()=>{
    console.log(`Sever is running on port: http://localhost:${PORT}`)
})