const path = require('path');

const express = require('express');
const csrf = require('csurf');
const expressSession = require('express-session');

const createSessionConfig = require('./config/session')
const db = require('./data/database');
const addCsrfTokenMiddleware = require('./middlewares/csrf-token');
const errorHandlerMiddleware = require('./middlewares/error-handler');
const checkAuthStatusMiddleware = require('./middlewares/check-auth');
const authRoutes = require('./routes/auth.routes');
const baseRoutes = require('./routes/base.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const schoolsRoutes = require('./routes/schools.routes');
const studentsRoutes = require('./routes/students.routes');
const prizeRoutes = require('./routes/prizes.routes');
const eventsRoutes = require('./routes/events.routes');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static('public'));
app.use(express.urlencoded({ extended: false}));

const sessionConfig = createSessionConfig();

app.use(expressSession(sessionConfig));
app.use(csrf());

app.use(addCsrfTokenMiddleware);
app.use(checkAuthStatusMiddleware);

app.use(baseRoutes);
app.use(authRoutes);
app.use(dashboardRoutes);
app.use(schoolsRoutes);
app.use(studentsRoutes);
app.use(prizeRoutes);
app.use(eventsRoutes);

app.use(errorHandlerMiddleware);

app.listen(3000);