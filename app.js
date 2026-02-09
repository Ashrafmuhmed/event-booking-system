const express = require("express");
const dotenv = require("dotenv");
const sequelize = require("./utils/db-connection");
const session = require("express-session");
const pg = require("pg");
const pgSession = require("connect-pg-simple")(session);
const authRoutes = require("./routes/auth.routes");
const eventsRoutes = require('./routes/events.routes');
const userRoutes = require('./routes/users.routes');
const reservationRoutes = require('./routes/reservation.routes');
const {initAssociations} = require("./models/associations");
const User = require("./models/user.model");
const Event = require("./models/event.model");
const Reservations = require('./models/reservations.model');
const EventOrganizers = require("./models/event_organizer.model");
const {isAuthenticated} = require("./middlewares/isAuthenticated.middleware");

const app = express();
const pgPool = new pg.Pool({
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
});
const sessionMiddleware = session({
    store: new pgSession({
        pool: pgPool,
        createTableIfMissing: true,
    }),
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60,
    },
});
dotenv.config();
app.use(express.json());
app.use(sessionMiddleware);

app.use((req, res, next) => {
    if (req.session.user) {
        User.findByPk(req.session.user.id)
            .then((user) => {
                if (!user) {
                    req.session.destroy();
                    return res.status(401).send({
                        message: "Error occured, please try again later",
                    });
                }
                req.user = user;
                // console.log(user);
                next();
            })
            .catch((err) => next(err));
    } else next();
});

app.use(authRoutes);
app.use(isAuthenticated, eventsRoutes);
app.use(isAuthenticated, userRoutes);
app.use(isAuthenticated, reservationRoutes);

app.use((err, req, res, next) => {
    console.error(err.message);

    res.status(err.status || 500).json({
        message: err.message || 'Internal Server Error'
    });
});

sequelize
    .sync({force: false})
    // .authenticate()
    .then(() => {
        initAssociations();
        console.log("DATA BASE CONNECTED");
        app.listen(process.env.PORT);
        console.log("SERVER IS LISTENING NOW TO THE PORT");
    })
    .catch((err) => {
        console.log(err.message);
    });
