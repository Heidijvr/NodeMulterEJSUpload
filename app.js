const express = require("express");
const multer = require("multer");
const ejs = require ("ejs");
const path = require("path");
// var aws = require('aws-sdk')
// var multerS3 = require('multer-s3')

// Set storage Engine (multer)
const storage = multer.diskStorage({
    destination: "./public/uploads/",
    filename: function(req, file, cb) {
        cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
    }
});

// Init Upload
const upload = multer({
    storage: storage,
    limits:{fileSize: 1000000},
    fileFilter: function(req, file, cb) {
       checkFileType(file, cb); 
    }
}).single("myImage");
// Single indicates single image

let s3 = new aws.S3({
    accessKeyId: process.env.S3_KEY,
    secretAccessKey: process.env.S3_SECRET
  });

// Check File Type
function checkFileType(file, cb) {
    // Allowed ext
    const filetypes = /jpeg|jpg|png|gif/;
    // Check Ext
    const extname = filetypes.test(path.extname
        (file.originalname).toLowerCase());
    // Check mime type
    const mimetype = filetypes.test(file.mimetype);

    if(mimetype && extname) {
        return cb(null, true);
    } else {
        cb("Error: Images Only!");
    }
}

// Init app
const app = express();

// EJS
app.set("view engine", "ejs");

// Public folder
app.use(express.static("./public"));

app.get("/", (req, res) => res.render("index"));


// Can also get info req.file in put in database, then use home route to do a fetch
app.post("/upload", (req, res) => {
   upload(req, res, (err) => {
       if(err) {
           res.render("index", {
              msg: err 
            });
       } else {
        //    console.log(req.file);
        //    res.send("test");
        if(req.file == undefined) {
            res.render("index", {
                msg: "Error: No File Selected!"  
            });
        } else {
            res.render("index", {
                msg: "File Uploaded!",
                file: `uploads/${req.file.filename}`
            });
        }
        }
   });
});

// const port = 3000;
var PORT = process.env.PORT || 2000;

// Start our server so that it can begin listening to client requests.
app.listen(PORT, function() {
console.log("App listening on PORT: " + PORT);
});