const express = require("express");
const multer = require("multer");
const ejs = require ("ejs");
const path = require("path");
var aws = require('aws-sdk');
var multerS3 = require('multer-s3');
var Sequelize = require("sequelize")

require("dotenv").config();

// Image upload
if (!process.env.S3_KEY) {
    console.log("No S3 Key available, image uplaods won't work");
} else {
    console.log("Using S3 key: " + process.env.S3_KEY);
}

let s3 = new aws.S3({
    accessKeyId: process.env.S3_KEY,
    secretAccessKey: process.env.S3_SECRET
  });

// Set storage Engine (multer)
const storage = multerS3({
    s3: s3,
    bucket: 'node-images1',
    acl: "public-read",
    contentType: multerS3.AUTO_CONTENT_TYPE,   
    key: function (req, file, cb) {
      cb(null, Date.now().toString() + "-" + file.originalname)
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

app.get("/", function(req, res) {
    res.render("index")
});


app.post("/upload", function(req, res) {
   upload(req, res, function(err) {
       if(err) {
           res.render("index", {
              msg: err 
            });
       } else {
           console.log(req.file);
        
            if(req.file == undefined) {
                res.render("index", {
                    msg: "Error: No File Selected!"  
                });
            } else {
                res.render("index", {
                    msg: "File Uploaded!",
                    file: req.file.location
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