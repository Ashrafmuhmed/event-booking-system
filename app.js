const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
const sequelize = require("./utils/db-connection");
const cookieParser = require("cookie-parser");
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

app.use(express.json());
app.use(cookieParser());

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

const PORT = process.env.PORT || 3000;

(async () => {
    try {
        initAssociations();
        await sequelize.sync({force: false});
        console.log("DATABASE CONNECTED");
        
        app.listen(PORT, () => {
            console.log(`SERVER LISTENING ON PORT ${PORT}`);
        });
    } catch (error) {
        console.error("Failed to start server:", error.message);
        process.exit(1);
    }
})();
