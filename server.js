const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = process.env.ATLAS_URI;
mongoose.connect(uri, {useUnifiedTopology: true, useNewUrlParser: true, useCreateIndex: true, 'useFindAndModify': false}
);
mongoose.connection.once('open', () => {
    console.log("MongoDB database connection established successfully");
})

const Router = require('./router');

app.use('/', Router);

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
})

//TODO большая работа с api imgur, данные для доступа к картинке можно хранить там же в коллекции теста
// Или на стороне юзера https://vk.com/dev/upload_files