const db = require('../../db');


const getAllVentas = (req, res) => {
    db.query('SELECT * FROM Ventas', (err, ventas) => {
        if (err) {
            console.error('Error al obtener las ventas:', err);
            return res.status(500).json({ message: 'Error interno del servidor' });
        }

        res.json(ventas);
    });
};

const getVentaByCodigo = (req, res) => {
    const IDVenta = req.params.codigo;

    db.query('SELECT V.IDVenta, V.CodigoProducto, P.Nombre AS NombreProducto, P.Precio, V.FechaVenta, V.CantidadVendida, U.Cedula, U.FirstName, U.LastName, U.Email, U.Phone FROM ventas V INNER JOIN users U ON V.CedulaCliente = U.Cedula INNER JOIN productos P ON V.CodigoProducto = P.Codigo WHERE V.IDVenta = ?', [IDVenta], (err, venta) => {
        if (err) {
            console.error('Error al obtener la venta:', err);
            return res.status(500).json({ message: 'Error interno del servidor' });
        }

        if (venta.length === 0) {
            return res.status(404).json({ message: 'Venta no encontrada' });
        }

        const producto = venta[0];
        const cantidadVendida = producto.CantidadVendida;
        const precioUnitario = producto.Precio; 
        const totalVenta = cantidadVendida * precioUnitario;

        // Agregar el campo de TotalVenta al resultado de la consulta
        venta[0].TotalVenta = totalVenta;

        res.json(venta[0]);
    });
};




const createVenta = (req, res) => {
    const { CodigoProducto, CedulaCliente, CantidadVendida } = req.body;

    db.query('SELECT * FROM Productos WHERE Codigo = ?', [CodigoProducto], (err, producto) => {
        if (err) {
            console.error('Error al obtener el producto:', err);
            return res.status(500).json({ message: 'Error interno del servidor' });
        }

        if (producto.length === 0) {
            return res.status(404).json({
                message: 'El producto que desea ingresar no está registrado'
            });
        }
        const productoInfo = producto[0];
        const precioProducto = producto[0].Precio;
        const totalVenta = precioProducto * CantidadVendida;

                // Verificar si la cantidad solicitada es mayor que la cantidad en stock
                if (CantidadVendida > productoInfo.CantidadStock) {
                    return res.status(400).json({
                        message: 'La cantidad solicitada supera la cantidad en stock disponible'
                    });
                }
        

        // Realizar la inserción de la venta en la tabla Ventas
        db.query(
            'INSERT INTO Ventas (CedulaCliente, CodigoProducto, FechaVenta, CantidadVendida) VALUES (?, ?, CURDATE(), ?)',
            [CedulaCliente, CodigoProducto, CantidadVendida],
            (err, result) => {
                if (err) {
                    console.error('Error al crear la venta:', err);
                    return res.status(500).json({ message: 'Error interno del servidor' });
                }

                const ventaId = result.insertId;

                // Actualizar la cantidad en stock en la tabla Productos
                db.query(
                    'UPDATE Productos SET CantidadStock = CantidadStock - ? WHERE Codigo = ?',
                    [CantidadVendida, CodigoProducto],
                    (err) => {
                        if (err) {
                            console.error('Error al actualizar la cantidad en stock:', err);
                            return res.status(500).json({ message: 'Error interno del servidor' });
                        }

                        // Obtener la información de la venta recién insertada
                        db.query('SELECT * FROM Ventas WHERE IDVenta = ?', [ventaId], (err, venta) => {
                            if (err) {
                                console.error('Error al obtener la venta:', err);
                                return res.status(500).json({ message: 'Error interno del servidor' });
                            }

                            res.json({
                                venta: venta[0],
                                totalVenta: totalVenta
                            });
                        });
                    }
                );
            }
        );
    });
};

const updateVentaByCodigo = (req, res) => {
    const IDVenta = req.params.codigo;
    const { CantidadVendida } = req.body;

    db.query('SELECT * FROM Ventas WHERE IDVenta = ?', [IDVenta], (err, venta) => {
        if (err) {
            console.error('Error al obtener la venta:', err);
            return res.status(500).json({ message: 'Error interno del servidor' });
        }

        if (venta.length === 0) {
            return res.status(404).json({ message: 'Venta no encontrada' });
        }

        const nuevaCantidadTotal = CantidadVendida;

        if (nuevaCantidadTotal < 0) {
            return res.status(400).json({ message: 'La cantidad vendida no puede ser menor que 0' });
        }

        db.query(
            'UPDATE Ventas SET CantidadVendida = ? WHERE IDVenta = ?',
            [nuevaCantidadTotal, IDVenta],
            (err) => {
                if (err) {
                    console.error('Error al actualizar la venta:', err);
                    return res.status(500).json({ message: 'Error interno del servidor' });
                }

                res.json({ message: 'Venta actualizada correctamente' });
            }
        );
    });
};

const deleteVentaByCodigo = (req, res) => {
    const IDVenta = req.params.codigo;

    db.query('DELETE FROM Ventas WHERE IDVenta = ?', [IDVenta], (err, result) => {
        if (err) {
            console.error('Error al eliminar la venta:', err);
            return res.status(500).json({ message: 'Error interno del servidor' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Venta no encontrada' });
        }

        res.json({ message: 'Venta eliminada correctamente' });
    });
};




module.exports = {
    createVenta,
    getAllVentas,
    getVentaByCodigo,
    updateVentaByCodigo,
    deleteVentaByCodigo
};
