const db = require('../../db.js');
const createTables = (db) => {
    return new Promise((resolve, reject) => {
        const createUsersTable = `
        CREATE TABLE IF NOT EXISTS users (
            ID int(11) NOT NULL AUTO_INCREMENT,
            Cedula varchar(20) DEFAULT NULL,
            Username varchar(50) DEFAULT NULL,
            Password varchar(255) DEFAULT NULL,
            LastName varchar(50) DEFAULT NULL,
            FirstName varchar(50) DEFAULT NULL,
            Email varchar(100) DEFAULT NULL,
            Phone varchar(20) DEFAULT NULL,
            Role enum('cliente','admin','vendedor') DEFAULT 'cliente',
            PRIMARY KEY (ID),
            UNIQUE KEY Cedula (Cedula),
            UNIQUE KEY Username (Username),
            UNIQUE KEY Email (Email)
        ) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    `;

    const createProductosTable = `
        CREATE TABLE IF NOT EXISTS productos (
            Codigo int(11) NOT NULL AUTO_INCREMENT,
            Nombre varchar(100) DEFAULT NULL,
            Descripcion varchar(255) DEFAULT NULL,
            Precio int(11) DEFAULT NULL,
            CantidadStock int(11) DEFAULT NULL,
            PRIMARY KEY (Codigo)
        ) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    `;
    
    const createVentasTable = `
        CREATE TABLE IF NOT EXISTS ventas (
            IDVenta int(11) NOT NULL AUTO_INCREMENT,
            CedulaCliente varchar(20) DEFAULT NULL,
            CodigoProducto int(11) DEFAULT NULL,
            FechaVenta date DEFAULT NULL,
            CantidadVendida int(11) DEFAULT NULL,
            PRIMARY KEY (IDVenta),
            CONSTRAINT FK_CedulaCliente FOREIGN KEY (CedulaCliente) REFERENCES users (Cedula),
            CONSTRAINT FK_CodigoProducto FOREIGN KEY (CodigoProducto) REFERENCES productos (Codigo)
        ) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    `;
    
    db.query(createUsersTable, (error, results) => {
        if (error) {
            reject('Error creating users table:', error);
        } else {
            console.log('Users table created successfully');
            db.query(createProductosTable, (error, results) => {
                if (error) {
                    reject('Error creating productos table:', error);
                } else {
                    console.log('Productos table created successfully');
                    db.query(createVentasTable, (error, results) => {
                        if (error) {
                            reject('Error creating ventas table:', error);
                        } else {
                            console.log('Ventas table created successfully');
                            resolve();
                        }
                    });
                }
            });
        }
    });
});
};

module.exports = {
    createTables, 
};
