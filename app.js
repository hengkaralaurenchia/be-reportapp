const express = require('express')
const app = express()
const port = 5000
const cors = require('cors')
const methodOverride = require('method-override')
const loginController = require('./controller/login.controller');

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'));
app.use(cors());
app.use('/uploads', express.static('uploads'))

const db = require('./models')
const reportRoutes = require('./routes/report.routes')
const loginRoutes = require('./routes/login.routes')
const { verifyToken } = require('./middlewares/auth')
const notificationRoutes = require('./routes/notification.routes');

db.sequelize.authenticate()
    .then(() => console.log("Database berhasil tersambung"))
    .catch(err => console.error(err))


app.post('/test', (req, res) => {
    console.log("Test body:", req.body);
    res.json(req.body);
});
// app.post('/register', loginController.register);
app.use('/auth', loginRoutes)
app.use('/reports', verifyToken, reportRoutes)
app.use('/notifications', verifyToken, notificationRoutes);

app.get('/', (req, res) => {
    res.send('Hello World')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})