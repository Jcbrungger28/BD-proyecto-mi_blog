const validator = require("validator");
const Articulo = require("../modelos/Articulos");
const fs = require("fs");
const path = require("path");

const prueba = (req, res) => {

    return res.status(200).json({
        mensaje: "Soy una accion de prueba en mi controlador de articulos"

    });
}

const curso = (req, res) =>{
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
  };

const crear = async (req, res) => {
  
  // recoger parametros por post a guardar
  let parametros = req.body;

  // Validar datos
  try{
    let validar_titulo = !validator.isEmpty(parametros.titulo) &&
         validator.isLength(parametros.titulo, {min: 5, max: undefined});
    let validar_contenido = !validator.isEmpty(parametros.contenido);

    if(!validar_titulo || !validar_contenido){
      throw new Error('No se ha validado la informacion !!!');
    }


     //crear el objeto a guardar
  const articulo = new Articulo(parametros); //automatico

  //asignar valores a objetos en el modelo (manual o automatico)
  // articulo.titulo = parametros.titulo; manual

  //Guardar el articulo en la base de datos
 const articuloGuardado = await articulo.save();

      //Devolver resultados
        return  res.status(200).json({
           status: 'success',
           articulo: articuloGuardado,
           mensaje: "Articulo creado con exito!!"
         });

  }catch(error){
    return res.status(400).json({
      status: "error",
      mensaje: "Faltan datos por enviar",
    })
  }
};

const listar = (req, res) => {

  let consulta = Articulo.find({});


  if(req.params.ultimos){
    consulta.limit(3);
  }
   
    consulta.sort({fecha: -1})
    .then((articulos) => {


    //ha entrado a consulta de articulos exitosa
    return res.status(200).send({
      status: "sucess",
      contador: articulos.length,
      articulos
    }) 

  }).catch((error) => {
    return res.status(404).json({
      status: "error",
      mensaje: "No se han encontrado articulos"
    })
  })
 
}

const uno = (req, res) => {
  //Recoger un id por la url
    let id = req.params.id;
  //Buscar el articulo
 
  Articulo.findById(id)
  .then((articulo) => {
    //Devolver resultado
    return res.status(200).json({
      status: "success",
      articulo
    })
  })
  .catch((error) => {
    return res.status(404).json({
        status: "error",
        mensaje:  "No se ha encontrado el articulo"
    });
  })
}

const borrar = (req, res) => {
  //Recoger un id por la url
  let id = req.params.id;
  //Buscar el articulo
 
  Articulo.findOneAndDelete(id)
  .then((articulo) => {
    //Devolver resultado
    return res.status(200).json({
      status: "success",
      mensaje: "Metodo borrado",
      articulo
    })
  })
  .catch((error) => {
    return res.status(404).json({
        status: "error",
        mensaje:  "No se ha encontrado el articulo"
    });
  })
}

const editar = async (req, res) => {
   //Recoger id articulo a editar
  let articuloId = req.params.id;
  let parametros = req.body;

  try{
    let articuloEditar = await Articulo.findOneAndUpdate({_id: articuloId}, parametros, {new: true});

    return res.status(200).json({
      status: "success",
      articuloEditar,
      mensaje: "Se ha editado el articulo"

    })
  }catch(error){
   return res.status(500).json({
       status: "error",
       mensaje: "El articulo no existe o no se puede editar"
    });
  }
}

const subir = async (req, res) => {

  //Configurar multer

  //recoger el fichero de imagen subido
   if(!req.file && !req.file){
       return res.status(400).json({
        status: "error",
        mensaje: "peticion invalida"
       })
   }

  //Nombre del archivo 
  let archivo = req.file.originalname;

  //Extension del archivo
  let archivo_split = archivo.split("\.");
  let extension = archivo_split[1]


  //Comprobar extension correcta
  if(extension != 'png' && extension != "jpg" &&
   extension != "jpeg" && extension != "gif"){
      //Borrar archivo y dar respuesta
      fs.unlink(req.file.path, (error) => {
        return res.status(400).json({
          status: "error",
          mensaje: "archivo invalido"
        })
      })
   } else {
 //Si todo va bien actualizar el articulo

 //Recoger id articulo a editar
 let articuloId = req.params.id;

 try{
  let articuloEditar = await Articulo.findOneAndUpdate({_id: articuloId}, {imagen: req.file.filename }, {new: true});

  return res.status(200).json({
    status: "success",
    articuloEditar,
    mensaje: "Se ha editado el articulo",
    fichero: req.file

  })
}catch(error){
 return res.status(500).json({
     status: "error",
     mensaje: "El articulo no existe o no se puede editar",
     
  });
  }
}

}

const imagen = (req, res) => {
 
  let fichero = req.params.fichero;

  let ruta_fisica = "./imagenes/articulos/"+fichero;

  fs.stat(ruta_fisica, (error, existe) => {
    if(existe){
      return res.sendFile(path.resolve(ruta_fisica));
    } else{
       return res.status(404).json({
        status: "error",
        mensaje: "La imagen no existe",
        existe,
        fichero,
        ruta_fisica
       })
    }
  })
}

const buscador = async (req, res) => {
    //Sacar el string de busqueda
     let busqueda = req.params.busqueda;

    //Find OR
    try {
      const articulosEncontrados = await Articulo.find({ "$or": [
          { "titulo": { "$regex": busqueda, "$options": "i"}},
          { "contenido": { "$regex": busqueda, "$options": "i"}},
      ]})
      .sort({fecha: -1})
      .exec();
  
      if (!articulosEncontrados || articulosEncontrados.length <= 0) {
          return res.status(404).json({
              status: "error",
              mensaje: "No se han encontrado artículos"
          });
      }
  
      return res.status(200).json({
          status: "success",
          articulos: articulosEncontrados
      });
  } catch (error) {
      return res.status(500).json({
          status: "error",
          mensaje: "Error en el servidor"
      });
  }
        

}

module.exports = {
    prueba,
    curso,
    crear,
    listar,
    uno,
    borrar,
    editar,
    subir,
    imagen,
    buscador
} 