const express = require ("express");
const mysql = require("mysql");
const expressLayouts = require("express-ejs-layouts");
const path = require("path");
const app = express();

const port = 3000;

const dotenv = require('dotenv').config(); // Asegúrate de cargar dotenv al inicio

const conexion = mysql.createConnection({  
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  database: process.env.DB_DATABASE || "proyectoformulario", 
  password: process.env.DB_PASSWORD || ""

});

conexion.connect(function(err)
{
  if(err){
    throw err;
  }else{
    console.log("conexion exitosa ");
  }
});

//poder insertar  styles al 
app.use(expressLayouts);
app.use(express.static(path.join(__dirname, 'public')));

// Configurar EJS como motor de vistas y especificar el directorio de las vistas
app.set("view engine", "ejs");
app.set("layout", "layout");//Indica que el archivo de layout 

// Definir la ruta de la carpeta de vistas
app.set('views', path.join(__dirname, 'views'));

//  procesar datos de formularios
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Ruta principal: muestra el formulario de registro 
app.get('/', function(req, res){
  res.render('registro');
});

// Ruta para recibir y registrar los datos del formulario
app.post('/validar', (req,res) => {
  const datos = req.body; 
  console.log("Datos recibidos:", req.body);

  let cedula = datos.cedula;
  let nombre = datos.nombre;
  let apellido = datos.apellido;
  let edad = datos.edad;
  let email = datos.email;
  let password = datos.password;

  //cada valor se inserta en ?
  let query = "INSERT INTO persona (cedula, nombre, apellido, edad, email, password) VALUES (?, ?, ?, ?, ?, ?)";
  conexion.query(query, [cedula, nombre, apellido, edad, email, password], (err, result) => {

    if (err) {
      console.error(err);
       res.send("Error al insertar el registro");

    } else {
      // Después de insertar, redirigimos a la lista de registros 
      res.redirect('/lista');
    }
  });
});

// Ruta para consultar y mostrar todos los registros
app.get('/lista', (req, res) => {
  let query = "SELECT * FROM persona";
  conexion.query(query, (err, results) => {
    if (err) {
      console.error(err);
      res.send("Error al obtener los registros");
    } else {
      res.render('lista', { persons: results });
    }
  });
});

//Ruta para mostrar el formulario de edición de un registro en base a la cédula
app.get('/editar/:cedula', (req, res) => {
  let cedula = req.params.cedula;
  let query = "SELECT * FROM persona WHERE cedula = ?";
  conexion.query(query, [cedula], (err, results) => {
    if (err) {
      console.error(err);
      res.send("Error al obtener el registro");
    } else if (results.length > 0) {
      res.render('editar', {
        persona: results[0]
      });
    } else {
      res.send("Registro no encontrado");
    }
  });
});

 //Ruta para actualizar el registro (envía los datos modificados) 
 app.post('/editar/:cedula', (req, res) => {
   // Extraer el valor original y los nuevos datos del formulario
    let originalCedula = req.body.originalCedula; // clave original
   let nuevaCedula   = req.body.cedula;           // nueva cédula (editable) 
   let  { nombre, apellido, edad, email, password } = req.body;

  // Validar si la cédula original y la nueva son iguales
  if(originalCedula === nuevaCedula){
    console.log("la cedula no ha cambiado");

  }else{
    console.log("La cedula ha cambiado");
  }
 //actualizar el registro en la base de datos
let query = "UPDATE persona SET cedula = ?, nombre = ?, apellido = ?, edad = ?, email = ?, password = ? WHERE cedula = ?";
conexion.query(query, [nuevaCedula, nombre, apellido, edad, email, password, originalCedula], (err, result) => {
  if (err) {
    console.error("Error al actualizar:", err);
    return res.send("Error al actualizar el registro");
  }
  if (result.affectedRows === 0) {
    console.warn("No se actualizó ningún registro. Comprueba que la cédula original exista.");
  }
  res.redirect('/lista');
});



});

// Ruta para eliminar un registro 
app.get('/eliminar/:cedula', (req, res) => {
  let cedula = req.params.cedula;
  let query = "DELETE FROM persona WHERE cedula = ?"; conexion.query(query, [cedula], (err, result) => { if (err) { console.error(err); res.send("Error al eliminar el registro"); } else { res.redirect('/lista'); } });
});

//ruta para mostrar el servidor en el puerto 3000 
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});

//conexion.end();
