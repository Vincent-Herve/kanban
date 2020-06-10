const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const router = require('./app/router');
const cors = require('cors');
const multer = require('multer');

const PORT = process.env.PORT || 5050;
const app = express();

app.use(cors('*'));

app.use(express.urlencoded({extended: true}));
const mutipartParser = multer();
app.use(mutipartParser.none());

// on ajoute le middleware de "nettoyage" des variables
const bodySanitizer = require('./app/middlewares/body-sanitizer');
app.use(bodySanitizer);

// on utilise express.static() pour distribuer les assets
app.use('/assets', express.static('assets'));

app.use(router);

// et une route get pour retourner le fichier html
app.get('/', (req, res) => {
  res.sendFile('./index.html', {root: '.'});
});

app.listen(PORT, () => {
  console.log(`Listening on ${PORT} ...`);
});
