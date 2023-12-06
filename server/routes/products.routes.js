import { Router } from "express";
import { prisma } from "../db.js";

const router = Router();

router.get('/products', async (req, res) => {
    const products = await prisma.product.findMany()
    res.json(products);
})

router.post('/products', async (req,res)=>{
    const newProduct = await prisma.product.create({
        data: req.body,
    })
    res.json(newProduct);
})

router.get('/products/:id', async (req,res)=>{
    const productFound = await prisma.product.findFirst({
        where:{
            id: parseInt(req.params.id),
        },
        include:{
            category: true,
        }
    })
    if (!productFound)
        return res.status(404).json({error: "Product not found"})

    res.json(productFound);
})

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

export default router;