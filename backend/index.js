const express = require("express");
require('dotenv').config();
const app = express();
const cors = require('cors');
app.use(cors({ origin: process.env.ORIGIN_URL.split(','), credentials: true }));
app.use(express.json());
//API calls
app.use('/', require('./routes/upload'));
app.use('/export', require('./routes/export'));

const port = process.env.PORT || 5000;
app.listen(port, () => { console.log('app listening on port', port); });