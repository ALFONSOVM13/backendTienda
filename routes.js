const express = require('express');
const { loginUser, registerUser,getUserInfo,authenticateToken,checkUser,getUserByUsername, changePassword, getUserById, getUsers,updateUserRole } = require('./src/controllers/userController');
const {getProductos,getProductoByCodigo,createProducto,deleteProducto,updateProducto} =require('./src/controllers/productController')
const {createVenta,getAllVentas,getVentaByCodigo,updateVentaByCodigo,deleteVentaByCodigo} =require('./src/controllers/saleController')
const router = express.Router();

// Rutas de usuario
router.get('/users',getUsers)
router.patch('/users/:userId/role', updateUserRole)
router.post('/login', loginUser);
router.post('/register', registerUser);
router.get('/userinfo', authenticateToken, getUserInfo);
router.post('/checkuser',checkUser)
router.get('/users',getUserByUsername)
router.patch('/user/:userId', changePassword)
router.get('/user/:userId', async (req, res) => {
    try {
        const userId = req.params.userId; 
        const user = await getUserById(userId); 

        // Manejar la respuesta
        res.json({ user });
    } catch (error) {
        // Manejo de errores
        res.status(500).json({ error: error.message });
    }
});



// Rutas de productos
router.get('/products',getProductos);
router.get('/products/:codigo',getProductoByCodigo);
router.patch('/products/:codigo',updateProducto);
router.delete('/products/:codigo',deleteProducto)
router.post('/products', createProducto);

//Rutas de Ventas

router.post('/sales',createVenta)
router.get('/sales', getAllVentas)
router.get('/sales/:codigo', getVentaByCodigo)
router.patch('/sales/:codigo', updateVentaByCodigo)
router.delete('/sales/:codigo', deleteVentaByCodigo)


module.exports = router;

