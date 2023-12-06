import express from 'express';
import productRoutes from './routes/products.routes.js';
import categoryRoutes from './routes/category.routes.js';

const app = express();
app.use(express.json());

app.use('/api', productRoutes);
app.use('/api', categoryRoutes);

app.listen(8000), () => console.log('Server is running on port 8000');