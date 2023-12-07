# RestAPI con NodeJS y Prisma

Iniciamos el proyecto

```sh
npm init -y
```

Instalamos dependencias

```sh
npm i prisma -D
```

```sh
npm i express
```

```sh
npm i nodemon -D
```

Iniciamos prisma

```sh
# Por defecto trabaja con PostgreSQL
npx prisma init
```

En el archivo `.env` pondremos nuestra URL de la DB, .node

```.env
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.pqmlttkxsjlkxxajjkak.supabase.co:5432/postgres"
```

Para hacer migraciones

```sh
npx prisma migrate dev
```

En el archivo `package.json`

```json
{
  "name": "nodejs_prisma_api",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  
  // Agregamos esta linea
  "type": "module",
  
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    
    // Agregamos este script para ejecutar nuestro index.js con nodemon
    "dev": "nodemon server/index.js"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "devDependencies": {
    "nodemon": "^3.0.2",
    "prisma": "^5.7.0"
  },
  "dependencies": {
    "@prisma/client": "^5.7.0",
    "express": "^4.18.2"
  }
}

```

## Prisma

Crear la tabla de la DB en el archivo `schema.prisma`, recomiendo leer mis notas de [Prisma](https://github.com/Wilovy09/Prisma-Curso-ORM/blob/main/README.md)

```js
// prisma/schema.prisma

// Esto es por defecto para trabajar con PostgreSQL
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Nuestras tablas
// Creamos una tabla Product
model Product{
  // Creamos un Id tipo Entero que se autoincremente por defecto (0,1,2,3,...)
  id         Int      @id @default(autoincrement())
  
  // Img opcional pero tipo base64
  image      String?
  
  // Creamos un titulo tipo String   
  title      String

  // Price tipo Float por defecto es 0
  price      Float @default(0)
  
  // Cuando se creo, por defecto now
  createdAt  DateTime @default(now())
  
  // Creamos la relacion con la tabla de category
  category   Category @relation(fields: [categoryID], references: [id])
  
  // CategoryID tipo Entero
  categoryID Int

  // Stock tipo entero por defecto 0
  stock      Int @default(0)
}

// Creamos una tabla Category
model Category{
  id       Int @id @default(autoincrement())
  
  // Creamos un Name tipo String pero que sea unico, para que no se repita en la DB
  name     String @unique
  
  // Enlazamos el product con todos su Products[]
  products Product[]
}
```

Una vez tengamos esto listo crearemos una estructura de carpetas

```md
📦NodeJS_Prisma_API
 ┗ 📂server
    ┣ 📂routes
    ┃ ┣ 📜category.routes.js
    ┃ ┗ 📜products.routes.js
    ┣ 📜db.js
    ┗ 📜index.js
```

En el archivo `db.js` crearemos la instancia de `PrismaClient`

```js
// server/db.js
import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();
```

En el archivo `index.js` crearemos la base de la API

```js
// server/index.js

// Importamos express
import express from 'express';

// Importamos las rutas de products y category
import productRoutes from './routes/products.routes.js';
import categoryRoutes from './routes/category.routes.js';

// Creamos la instancia de Express
const app = express();
// Hacemos que use JSON
app.use(express.json());

// Para las rutas de Productos enlazalas con /api
app.use('/api', productRoutes);
// Para las rutas de Category enlazalas con /api
app.use('/api', categoryRoutes);

// Establecemos el puerto del backend
app.listen(8000)
```

## Rutas

En el archivo `products.routes.js`

```js
// importamos Router de express
import { Router } from "express";
// importamos nuestra instancia de Prisma
import { prisma } from "../db.js";

// Creamos Router
const router = Router();

// creamos una ruta /products que nos regrese todas los productos de nuesta DB
router.get('/products', async (req, res) => {
                           // Esto es prisma code
    const products = await prisma.product.findMany()
    // Respondemos con un json(productos)
    res.json(products);
})

// Esta es la ruta para crear un producto
router.post('/products', async (req,res)=>{
    const newProduct = await prisma.product.create({
        data: req.body,
    })
    res.json(newProduct);
})

// Esta es la ruta para buscar solo 1 item de la db
router.get('/products/:id', async (req,res)=>{
    const productFound = await prisma.product.findFirst({
        where:{
            id: parseInt(req.params.id),
        },
        // esto es para enlazarlos
        include:{
            category: true,
        }
    })
    // Manejamos el error
    if (!productFound)
        return res.status(404).json({error: "Product not found"})

    res.json(productFound);
})

// Esta es la ruta para eliminar un producto (lo mismo que buscar solo 1, pero cambiamos la peticion a .delete)
router.delete('/products/:id', async (req,res)=>{
    const productDeleted = await prisma.product.delete({
        where:{
            id: parseInt(req.params.id),
        }
    })
    if (!productDeleted)
        return res.status(404).json({error: "Product not found"})
    
    res.json(productDeleted);
})

// Esta es la ruta para actualizar un objeto de la DB
router.put('/products/:id', async (req,res)=>{
    const productUpdated =  await prisma.product.update({
        where:{
            id: parseInt(req.params.id),
        },
        data: req.body,
    })
    if (!productUpdated)
        return res.status(404).json({error: "Product not found"})

    return res.json(productUpdated);
})

// Exportamos el router
export default router;
```

En el archivo `category.routes.js`

```js
// Importamos express
import { Router } from "express";
// importamos nuesta instancia de Prisma
import { prisma } from "../db.js";

// Creamos el router
const router = Router();

// Nos devuelve todas las categorias existentes
router.get('/category', async(req, res) => {
    const categories = await prisma.category.findMany({
        // Esto nos muestra todos los productos que contiene cada categoria
        include: {
            products: true,
        }
    })
    res.json(categories);
})

// Exportamos el router
export default router;
```

## Cors

Instalamos el modulo `cors`

```sh
npm i cors
```

En el `index.js` agregaremos unas lineas

```js
import express from 'express';
// importamos cors desde cors
import cors from 'cors';
import productRoutes from './routes/products.routes.js';
import categoryRoutes from './routes/category.routes.js';

const app = express();
// Creamos cors
const cors = ('cors')

// Agregamos cors y lo configuramos
app.use(cors({
    "origin": "http://localhost:5173",
    "methods": "GET,HEAD,PUT,POST,DELETE",
}));

app.use(express.json());

app.use('/api', productRoutes);
app.use('/api', categoryRoutes);

// PORT
app.listen(8000);
```
