const db = require('../../db.js');


const getProductos = (req, res) => {
    db.query('SELECT * FROM Productos', (err, results) => {
        if (err) {
            console.error('Error al obtener los productos:', err);
            res.status(500).send('Error interno del servidor');
        } else {
            res.json(results);
        }
    });
};

const getProductoByCodigo = (req, res) => {
    const Codigo = req.params.codigo;
    db.query('SELECT * FROM Productos WHERE Codigo = ?', [Codigo], (err, results) => {
        if (err) {
            console.error('Error al obtener el producto:', err);
            res.status(500).send('Error interno del servidor');
        } else {
            res.json(results[0]);
        }
    });
};


const createProducto = (req, res) => {
    const { Nombre, Descripcion, Precio, CantidadStock } = req.body;
    console.log('Datos recibidos del front-end:', req.body); 
    db.query(
        'INSERT INTO Productos (Nombre, Descripcion, Precio, CantidadStock) VALUES (?, ?, ?, ?)',
        [Nombre, Descripcion, Precio, CantidadStock],
        (err, results) => {
            if (err) {
                console.error('Error al crear el producto:', err);
                res.status(500).json({ error: 'Error interno del servidor' });
            } else {
                const productId = results.insertId;
                db.query('SELECT * FROM Productos WHERE Codigo = ?', [productId], (err, product) => {
                    if (err) {
                        console.error('Error al obtener el producto:', err);
                        res.status(500).json({ error: 'Error interno del servidor' });
                    } else {
                        res.status(200).json({ message: 'Producto creado exitosamente', nuevoProducto: product[0] });
                    }
                });
            }
        }
    );
};


const updateProducto = (req, res) => {
    const codigo = req.params.codigo; 
    const updatedFields = req.body; 

    // Verificar si el producto existe antes de intentar actualizarlo
    db.query('SELECT * FROM Productos WHERE Codigo = ?', [codigo], (err, result) => {
        if (err) {
            console.error('Error al buscar el producto:', err);
            res.status(500).json({ error: 'Error interno del servidor' });
        } else {
            if (result.length === 0) {
                res.status(404).json({ error: 'El producto no fue encontrado' });
            } else {
                const fieldsToUpdate = [];
                const valuesToUpdate = [];

                for (const key in updatedFields) {
                    fieldsToUpdate.push(`${key} = ?`);
                    valuesToUpdate.push(updatedFields[key]);
                }

                valuesToUpdate.push(codigo); 

                const updateQuery = `UPDATE Productos SET ${fieldsToUpdate.join(', ')} WHERE Codigo = ?`;

                // Ejecutar la consulta de actualización
                db.query(updateQuery, valuesToUpdate, (err, updateResult) => {
                    if (err) {
                        console.error('Error al actualizar el producto:', err);
                        res.status(500).json({ error: 'Error interno del servidor' });
                    } else {
                        if (updateResult.affectedRows > 0) {
                            // Consulta el producto actualizado después de la actualización
                            db.query('SELECT * FROM Productos WHERE Codigo = ?', [codigo], (err, updatedProduct) => {
                                if (err) {
                                    console.error('Error al obtener el producto actualizado:', err);
                                    res.status(500).json({ error: 'Error interno del servidor' });
                                } else {
                                    res.status(200).json({ message: 'Producto actualizado correctamente', updatedProduct });
                                }
                            });
                        } else {
                            res.status(404).json({ error: 'El producto no fue encontrado' });
                        }
                    }
                });
            }
        }
    });
};



const deleteProducto = (req, res) => {
    const codigo = req.params.codigo; // Suponiendo que utilizas el código para identificar el producto a eliminar

    // Realizar la consulta SQL para eliminar el producto
    db.query('DELETE FROM Productos WHERE Codigo = ?', [codigo], (err, result) => {
        if (err) {
            console.error('Error al eliminar el producto:', err);
            res.status(500).send('Producto asociado a una venta');
        } else {
            if (result.affectedRows > 0) {
                res.send('Producto eliminado correctamente');
            } else {
                res.status(404).send('El producto no fue encontrado');
            }
        }
    });
};





module.exports = {
    getProductos,
    getProductoByCodigo,
    createProducto,
    deleteProducto,
    updateProducto,
};
