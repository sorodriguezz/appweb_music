'use strict'

var fs = require('fs');
var path = require('path');
var User = require('../models/user');
var bcrypt = require('bcrypt-nodejs');
var jwt = require('../services/jwt');

function pruebas(req, res) {
    res.status(200).send({
        message: 'Probando controlador'
    });
}

function saveUser(req, res) {
    var user = new User();
    var params = req.body;

    console.log(params);

    user.name = params.name;
    user.surname = params.surname;
    user.email = params.email;
    user.role = 'ROLE_ADMIN';
    user.image = 'null';

    if (params.password) {
        //encriptar contraseña y guardar datos
        bcrypt.hash(params.password, null, null, function(err, hash) {
            user.password = hash;
            if (user.name != null && user.surname != null && user.email != null) {
                //guardar usuario
                user.save((err, userStored) => {
                    if (err) {
                        res.status(500).send({ message: 'Error al guardar usuario' });
                    } else {
                        if (!userStored) {
                            res.status(404).send({ message: 'No se registro usuario' });
                        } else {
                            res.status(200).send({ user: userStored });
                        }
                    }
                });
            } else {
                res.status(200).send({ message: 'Introduce todos los datos' });
            }
        });
    } else {
        res.status(200).send({ message: 'introduce la contraseña' });
    }
}

function loginUser(req, res) {
    var params = req.body;

    var email = params.email;
    var password = params.password;

    User.findOne({ email: email.toLowerCase() }, (err, user) => {
        if (err) {
            res.status(500).send({ message: 'Error en la peticion' });
        } else {
            if (!user) {
                res.status(400).send({ message: 'El usuario no existe' });
            } else {
                //comprobar la contraseña
                bcrypt.compare(password, user.password, function(err, check) {
                    if (check) {
                        //devolver datos de usuario logueado
                        if (params.gethash) {
                            //devolver un token de jwt
                            res.status(200).send({
                                token: jwt.createToken(user)
                            });
                        } else {
                            res.status(200).send({ user });
                        }
                    } else {
                        res.status(400).send({ message: 'Usuario no pudo loguearse' });
                    }
                });
            }
        }
    });
}

function updateUser(req, res) {
    var userId = req.params.id;
    var update = req.body;

    User.findByIdAndUpdate(userId, update, (err, userUpdated) => {
        if (err) {
            res.status(500).send({ message: 'Error al actualizar el usuario' });

        } else {
            if (!userUpdated) {
                res.status(404).send({ message: 'El usuario no ha podido actualizarse' });
            } else {
                res.status(200).send({ user: userUpdated });
            }
        }
    });
}

function uploadImage(req, res) {
    var userId = req.params.id;
    var file_name = 'No subido...';

    if (req.files) {
        var file_path = req.files.image.path;
        //extrae ruta y nombre del archivo
        var file_split = file_path.split('\\');
        var file_name = file_split[2];
        //extrae el nombre y extencion del archivo
        var ext_split = file_name.split('\.');
        var file_ext = ext_split[1];
        //verificar extension del archivo
        if (file_ext == 'png' || file_ext == 'jpg' || file_ext == 'gif') {
            User.findByIdAndUpdate(userId, { image: file_name }, (err, userUpdated) => {
                if (!userUpdated) {
                    res.status(404).send({ message: 'El usuario no ha podido actualizarse' });
                } else {
                    res.status(200).send({ image: file_name, user: userUpdated });
                }
            });
        } else {
            res.status(200).send({ message: 'Extension de archivo no valida' })
        }

        console.log(ext_split);
    } else {
        res.status(200).send({ message: 'No has subido ninguna imagen...' });
    }
}

function getImageFile(req, res) {
    var imageFile = req.params.imageFile;
    var pathFile = './upload/users/' + imageFile;

    fs.exists(pathFile, function(exists) {
        if (exists) {
            res.sendFile(path.resolve(pathFile));
        } else {
            res.status(200).send({ message: 'No existe imagen...' });
        }
    });
}

module.exports = {
    pruebas,
    saveUser,
    loginUser,
    updateUser,
    uploadImage,
    getImageFile
};