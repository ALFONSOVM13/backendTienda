const db = require('../../db.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const express = require('express');
const app = express();
const cors = require('cors');


const secret = 'clave123';
app.use(cors());
app.use(express.json());
app.use(cookieParser());

const authenticateToken = (req, res, next) => {
    const authorizationHeader = req.headers['authorization'];

    if (!authorizationHeader) {
        console.error('No se proporcionó el token');
        return res.sendStatus(401);
    }

    const [bearer, token] = authorizationHeader.split(' ');

    if (!token || bearer.toLowerCase() !== 'bearer') {
        console.error('Formato de token inválido');
        return res.sendStatus(401);
    }

    jwt.verify(token, secret, (err, user) => {
        if (err) {
            console.error('Error al verificar el token:', err);
            return res.status(403).json({ error: 'Token no válido' });
        }

        req.user = user;
        next();
    });
};

const accessProtectedRoute = (req, res) => {

    jwt.verify(req.token, secret, (err, user) => {
        if (err) {
            console.error('Error al verificar el token:', err);
            return res.sendStatus(403);
        }

        res.send('Accediste a una ruta protegida');
    });
};

const loginUser = async (req, res) => {
    const { Username, Password } = req.body;

    try {
        const user = await getUserByUsername(Username);

        if (user && await bcrypt.compare(Password, user.Password)) {
            const token = generateToken(user.ID, user.Username);

            res.cookie('token', token, { httpOnly: true });

            res.json({ message: 'Inicio de sesión exitoso', token });
        } else {
            res.status(401).json({ error: 'Credenciales inválidas' });
        }
    } catch (error) {
        console.error('Error al realizar la autenticación:', error);
        res.status(500).json({ error: 'Error al realizar la autenticación' });
    }
};



const registerUser = async (req, res) => {
    const { Cedula, Username, Password, FirstName, LastName, Email, Phone } = req.body;
    console.log('Contraseña recibida:', Password);
    console.log(req.body);

    try {
        const userByUsername = await getUserByUsername(Username);
        const userByEmail = await getUserByEmail(Email);

        if (userByUsername || userByEmail) {
            return res.status(400).json({ error: 'El nombre de usuario o correo electrónico ya están registrados.' });
        }

        const hashedPassword = await bcrypt.hash(Password, 10);

        const insertUserQuery = 'INSERT INTO users (Cedula, Username, Password, FirstName, LastName, Email, Phone) VALUES (?, ?, ?, ?, ?, ?, ?)';
        const insertResult = /* await */  db.query(insertUserQuery, [Cedula, Username, hashedPassword, FirstName, LastName, Email, Phone]);
        console.log(insertResult);
        res.status(200).send('Registro exitoso');
    } catch (error) {
        console.error('Error al encriptar la contraseña o realizar el registro:', error);
        return res.status(500).send('Error en el registro: ' + error.message);
    }
};

const getUsers = (req, res) => {
    db.query('SELECT * FROM users', (err, results) => {
        if (err) {
            console.error('Error al obtener la lista de usuarios desde la base de datos:', err);
            res.status(500).json({ error: 'Error interno del servidor' });
        } else {
            res.json(results);
        }
    });
};
const updateUserRole = (req, res) => {
    const userId = req.params.userId;
    const newRole = req.body.role; // Suponiendo que el nuevo rol se envía en el cuerpo de la solicitud

    if (!userId || !newRole) {
        return res.status(400).json({ error: 'Faltan parámetros' });
    }

    db.query('UPDATE users SET role = ? WHERE id = ?', [newRole, userId], (err, results) => {
        if (err) {
            console.error('Error al actualizar el rol del usuario:', err);
            res.status(500).json({ error: 'Error interno del servidor' });
        } else {
            if (results.affectedRows === 0) {
                return res.status(404).json({ error: 'Usuario no encontrado' });
            }
            res.json({ message: 'Rol de usuario actualizado correctamente' });
        }
    });
};


// Función para obtener un usuario por nombre de usuario
const getUserByUsername = (Username) => {
    console.log('Parámetro del username:', Username);
    return new Promise((resolve, reject) => {
        db.query('SELECT * FROM users WHERE Username = ?', [Username], (err, results) => {
            if (err) {
                reject(err);
            } else {

                resolve(results.length > 0 ? results[0] : null);
            }
        });
    });
};



const getUserByEmail = (email) => {
    return new Promise((resolve, reject) => {
        db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results.length > 0 ? results[0] : null);
            }
        });
    });
};

const checkUser = async (req, res) => {
    const { Username, Email } = req.body;

    try {
        const userByUsername = await getUserByUsername(Username);
        const userByEmail = await getUserByEmail(Email);

        const exists = userByUsername || userByEmail;

        res.json({ exists });
    } catch (error) {
        console.error('Error al verificar el usuario o correo electrónico:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};
const getUserInfo = (req, res) => {
    const userId = req.user.id;

    // Consulta la base de datos para obtener los detalles del usuario
    db.query('SELECT id,Username,Cedula, FirstName, LastName, Email,Phone,Role FROM users WHERE id = ?', [userId], (err, results) => {
        if (err) {
            console.error('Error al obtener la información del usuario desde la base de datos:', err);
            res.status(500).json({ error: 'Error interno del servidor' });
        } else {
            console.log('Resultados de la consulta:', results);
            const userData = results[0];

            if (userData) {
                console.log('Usuario encontrado:', userData);
                res.json(userData);
            } else {
                console.log('Usuario no encontrado');
                res.status(404).json({ error: 'Usuario no encontrado' });
            }
        }
    });
};

const getUserById = async (userId) => {
    try {
        const sql = 'SELECT * FROM users WHERE id = ?';
        const values = [userId];

        console.log('SQL:', sql);
        console.log('Values:', values);


        return new Promise((resolve, reject) => {
            db.query(sql, values, (err, rows) => {
                if (err) {
                    console.error('Error en la consulta:', err);
                    reject(err); // Rechazar la promesa en caso de error
                } else {
                    if (rows && rows.length > 0) {
                        const user = rows[0];
                        console.log('Usuario encontrado:', user);
                        resolve(user); // Resolver la promesa con el usuario encontrado
                    } else {
                        console.log('Usuario no encontrado');
                        resolve(null); // Resolver la promesa con null si el usuario no se encuentra
                    }
                }
            });
        });
    } catch (error) {
        console.error('Error al obtener el usuario por ID:', error);
        return null;
    }
};

const changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.params.userId;

    try {
        // Obtener el usuario correspondiente al ID proporcionado desde la base de datos
        const user = await getUserById(userId);

        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        // Verificar si la contraseña actual proporcionada coincide con la almacenada en la base de datos del usuario obtenido
        const isPasswordMatch = await bcrypt.compare(currentPassword, user.Password);

        if (!isPasswordMatch) {
            return res.status(401).json({ error: 'Contraseña actual incorrecta' });
        }

        // Hash de la nueva contraseña
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        // Actualizar la contraseña en la base de datos
        const updateUserPasswordQuery = `
            UPDATE users 
            SET Password = ?
            WHERE id = ?
        `;
    
        const updateValues = [
            hashedNewPassword,
            userId
        ];

        try {
            // Ejecutar la consulta de actualización dentro de un bloque try/catch
            db.query(updateUserPasswordQuery, updateValues, (error, results) => {
                if (error) {
                    console.error('Error al cambiar la contraseña:', error);
                    res.status(500).json({ error: 'Error interno del servidor' });
                } else {
                    res.status(200).json({ message: 'Contraseña actualizada con éxito' });
                }
            });
        } catch (error) {
            console.error('Error al ejecutar la consulta:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    } catch (error) {
        console.error('Error en la operación de cambio de contraseña:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};


const generateToken = (userId, username, role) => {
    return jwt.sign({ id: userId, username, role }, secret, { expiresIn: '15m' });
};
module.exports = {
    authenticateToken,
    accessProtectedRoute,
    loginUser,
    registerUser,
    getUsers,
    getUserByUsername,
    getUserByEmail,
    checkUser,
    getUserInfo,
    generateToken,
    getUserById,
    changePassword,
    getUsers,
    updateUserRole

};

