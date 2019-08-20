var express = require("express"),
	bodyParser = require("body-parser"),
	path = require("path"),
	mongoose = require("mongoose"),
	multer = require("multer"),
	GridFsStorage = require("multer-gridfs-storage"),
	Grid = require("gridfs-stream"),
	crypto = require("crypto"),
	readStream = require("read-stream"),
	user = require("./models/user"),
	message = require("./models/message"),
	passport = require("passport"),
	localStrategy = require("passport-local"),
	passportLocalMongoose = require("passport-local-mongoose"),
	authenticationRoute = require("./routes/authentication"),
	modulesRoute = require("./routes/modules"),
	indexRoute = require("./routes/index");


var app = express();

var mongoURI = "mongodb://localhost/messagerie_app",
	connect = mongoose.createConnection(mongoURI);

mongoose.connect(mongoURI);

app.set("view engine", "ejs");
app.use((request, response, next) => {
	response.locals.currentUser = request.user;
	next();
});
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.use(require("express-session")({
	secret: "This is what will be used this time.",
	resave: false,
	saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use((request, response, next) => {
	response.locals.currentUser = request.user;
	next();
});

passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());
passport.use(new localStrategy(user.authenticate()));

//init gfs
let gfs;

connect.once("open", () => {
	gfs = Grid(connect.db, mongoose.mongo);
	gfs.collection("uploads");
});

//create storage engine 
var storage = new GridFsStorage({
	url: mongoURI,
	file: (request, file) => {
		return new Promise((resolve, reject) => {
			crypto.randomBytes(16, (error, buf) => {
				if (error) {
					return reject(error);
				} 
				const filename = buf.toString("hex") + path.extname(file.originalname);
				const fileInfo = {
					filename: filename,
					bucketName: "uploads"
				}
				resolve(fileInfo);
			});
		});
	}
});
const upload = multer({ storage });

app.get("/files/:filename", (request, response) => {
	gfs.files.findOne({filename: request.params.filename}, (error, file) => {
		if (!file || file.length === 0) {
			//handling the error
			return console.log(error);
		}
		//Files exist
		return response.json(file);
	});
});

app.get("/messagerie/modules/images/:filename", (request, response) => {
	gfs.files.findOne({filename: request.params.filename}, (error, file) => {
		if (!file || file.length === 0) {
			//handling the error
			return console.log(error);
		}
		if (file.contentType === "image/jpeg" || file.contentType === "image/png") {
			//read output to the browser
			const readStream = gfs.createReadStream(file.filename);
			readStream.pipe(response);
			} else {
				//handling the error
				console.log(error);
			}
	});
});

app.get("/messagerie/modules/imagesUpload", (request, response) => {
	gfs.files.find().toArray((error, files) => {
				//Check if files
				if (!files || files.length === 0) {
					response.render("images/imagesUpload", {files: false});
				} else {
					files.map((file) => {
						if (
							file.contentType === "image/jpeg" ||
							file.contentType === "image/png"
							) {
							file.isImage = true;
						} else {
							file.isImage = false;
						}
					});
					response.render("images/imagesUpload", {files: files});
				}
				//Files exist
				//return response.json(file);
			});
});

app.post("/upload", upload.single("file"), (request, response) => {
	response.redirect("/messagerie/modules/imagesUpload");
});

app.use(indexRoute);
app.use(authenticationRoute);
app.use(modulesRoute);




//===================
//Starting the server
//===================
app.listen("1999", () => {
	console.log("Server have been started successfully on port 1999");
});

