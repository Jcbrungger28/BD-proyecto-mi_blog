const { conexion } = require("./basedatos/conexion");
const express = require("express");
const cors = require("cors");

//Inicializar App
console.log('App de node arrancada');

//conectar a la base de datos
conexion();

//Crear servidor Node
const app = express();
const puerto = 3900;

//Configurar cors
app.use(cors());

//Convertir body a objeto js
app.use(express.json()); //recibir datos con content-type app/json
app.use(express.urlencoded({extends:true})); //form-urlencoded

//crear rutas
const rutas_articulo = require("./rutas/articulos")

//cargo las rutas
app.use("/api", rutas_articulo);

//Rutas pruebas hardcodeadas
app.get("/probando", (req, res) =>{
  console.log('Se ha ejecutado el endPoint probando')

  return res.status(200).json([{
    curso: 'Master en react',
    author: 'Victor robles web',
    url: 'Victorrobles.es'
  },
  {
    curso: 'Master en react',
    author: 'Victor robles web',
    url: 'Victorrobles.es'
  },

 ])
}

);

app.get("/", (req, res) =>{
    
    return res.status(200).send(
        `<h1>Empenzando a crear una api rest con node</h1>`
    )
  });
  

//crear servidor y escuchar peticiones http

app.listen(puerto, () => {
    console.log('Servidor corriendo en el puerto '+puerto);
})
