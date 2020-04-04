const express = require("express"),
  path = require("path"),
  logger = require("morgan"),
  mongoose = require("mongoose"),
  router = require("./routes/api"),
  compression = require("compression"),

  PORT = process.env.PORT || 3000,

  app = express();

app.use(logger("dev"));

app.use(compression());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static("public"));

mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost/budget", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
})
.then(() => {console.log('Database connection established.')})
.catch( err => {console.log(err)});

// HTML route
router.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

app.use(router);

app.listen(PORT, () => {
  console.log("==> 🌎  Listening on port %s. Visit http://localhost:%s/ in your browser.", PORT, PORT);
});