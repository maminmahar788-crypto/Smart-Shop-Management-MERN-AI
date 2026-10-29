const router = require('express').Router();
const Product = require('../models/Product');
const { protect, allowRoles } = require('../middleware/auth');
router.use(protect, allowRoles('admin','manager'));
router.post('/adjust', async (req,res,next)=>{try{
 const productId=req.body.productId, delta=Number(req.body.delta), reason=String(req.body.reason||'Manual adjustment').slice(0,160);
 if(!productId||!Number.isInteger(delta)||delta===0) return res.status(400).json({message:'Product and a non-zero whole-number stock adjustment are required.'});
 const product=await Product.findOne({_id:productId,active:true}); if(!product)return res.status(404).json({message:'Product not found.'});
 if(product.stock+delta<0)return res.status(400).json({message:'Stock cannot become negative.'});
 product.stock+=delta; await product.save(); res.json({message:'Stock adjusted.',product,reason});
}catch(e){next(e);}});
module.exports=router;
