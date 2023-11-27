const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const routes = require('./routes.js'); 
const db = require('./db.js');
const { createTables, pool } = require('./src/models/tablas.js');


const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));
app.use('/', routes);




// Puerto del servidor
const PORT = process.env.PORT || 3001;



// Iniciar el servidor
createTables(db)
  .then(() => {
    // Iniciar el servidor después de crear las tablas
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en el puerto ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Error creando tablas:', error);
  });