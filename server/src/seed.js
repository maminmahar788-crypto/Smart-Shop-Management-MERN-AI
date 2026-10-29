require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Product = require('./models/Product');
(async()=>{
 try {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smart_shop_management');
  const email='admin@shop.local';
  const passwordHash=await bcrypt.hash('ShopAdmin123!',12);
  await User.findOneAndUpdate(
   {email},
   {$set:{name:'Shop Admin',email,password:passwordHash,role:'admin'}},
   {upsert:true,new:true}
  );
  if (await Product.countDocuments()===0) await Product.insertMany([
   {name:'Mineral Water 1.5L',sku:'WATER-15',category:'Beverages',costPrice:80,salePrice:110,stock:18,lowStockAt:10},
   {name:'Milk 1L',sku:'MILK-1L',category:'Dairy',costPrice:190,salePrice:230,stock:35,lowStockAt:10},
   {name:'Rice 1kg',sku:'RICE-1KG',category:'Grocery',costPrice:250,salePrice:310,stock:22,lowStockAt:8},
   {name:'Tea Pack 190g',sku:'TEA-190',category:'Grocery',costPrice:320,salePrice:390,stock:6,lowStockAt:8},
   {name:'Biscuits Family Pack',sku:'BISC-FAM',category:'Snacks',costPrice:95,salePrice:130,stock:42,lowStockAt:10}
  ]);
  console.log('Seed complete. Login: admin@shop.local / ShopAdmin123!');
 } catch(e) { console.error(e); process.exitCode=1; } finally { await mongoose.disconnect(); }
})();
