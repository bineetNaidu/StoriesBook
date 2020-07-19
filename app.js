const express = require("express");
const path = require("path");
const morgan = require("morgan");
const expbhs = require("express-handlebars");
const passport = require("passport");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
const connectDB = require("./config/db");
const { Mongoose } = require("mongoose");

require("dotenv").config({ path: "./config/config.env" });

// passport config
require("./config/passport")(passport);

// connecting mongoDB
connectDB();

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

//logging
if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
}

// helpers
const {
    formatDate,
    stripTags,
    truncate,
    editIcon,
    select,
} = require("./helpers/hbs");

// handlebars
app.engine(
    ".hbs",
    expbhs({
        helpers: { formatDate, stripTags, truncate, editIcon, select },
        defaultLayout: "main",
        extname: ".hbs",
    })
);
app.set("view engine", ".hbs");
app.use(methodOverride("_method"));

// sessions
app.use(
    session({
        secret: "x4ae654xae4xea5x4ae61xea1x1ae1x",
        resave: false,
        saveUninitialized: false,
        store: new MongoStore({ mongooseConnection: mongoose.connection }),
    })
);

// passport middlware
app.use(passport.initialize());
app.use(passport.session());

// set global var
app.use(function (req, res, next) {
    res.locals.user = req.user || null;
    next();
});

// static folder
app.use(express.static(path.join(__dirname, "public")));

// routes
app.use("/", require("./routes/index"));
app.use("/auth", require("./routes/auth"));
app.use("/stories", require("./routes/stories"));

app.listen(process.env.PORT, () =>
    console.log(
        `Server running in ${process.env.NODE_ENV} mode on port ${process.env.PORT}`
    )
);
