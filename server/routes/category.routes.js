import { Router } from "express";
import { prisma } from "../db.js";

const router = Router();

router.get('/category', async(req, res) => {
    const categories = await prisma.category.findMany({
        include: {
            products: true,
        }
    })
    res.json(categories);
})

export default router;