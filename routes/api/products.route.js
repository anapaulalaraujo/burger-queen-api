const express = require('express');
const router = express.Router();
const Product = require('../../models/product.model');
const mongoose = require('mongoose');
const auth = require('../auth');
const upload = require('../../middleware/multerUpload');

router.get('/', async (req, res, next) => {
  try {
      const products = await Product.find().select('name price productImage kindOfProduct complement')
      res.json(products)
  } catch (err) {
      res.status(500).json({ message: err.message })
  }
});

router.post('/', auth, upload.single('productImage'), (req, res, next) => {
  console.log(req.file)
  const product = new Product ({
    _id: new mongoose.Types.ObjectId(),
    name: req.body.name,
    price: req.body.price,
    productImage: req.file.path,
    kindOfProduct: req.body.kindOfProduct,
    complement: req.body.complement
  })
  product
  .save()
  .then(result => {
    console.log(result)
    res.status(201).json({
      message: 'This product has been created',
      createdProduct: {
        _id: result._id,
        name: result.name,
        price: result.price,
        productImage: result.productImage,
        kindOfProduct: result.kindOfProduct,
        complement: result.complement,
        request: {
          type: 'GET',
          url: `http://localhost:5000/api/products/${result._id}`
        }
      }
    })
  })
  .catch(err => {
    console.log(err)
    res.status(500).json({
      error: err
    })
  })
});

router.get('/:productid', (req, res, next) => {
    const id = req.params.productid
    Product.findById(id)
    .select('name price productImage kindOfProduct complement _id')
    .exec()
    .then(doc => {
      console.log(doc)
      if (doc) {
        res.status(200).json({
          product: doc,
          request: {
            type: 'GET',
            url: `http://localhost:5000/api/products`
          }
        })
      }
      else {
        res.status(404).json({message: 'No valid entry found for provided ID'})
      }
    })
    .catch(err => {
      console.log(err)
      res.status(500).json({error: err})
    });
});

router.put('/:productid', auth, (req, res, next) => {
  const id = req.params.productid
  const updateOps = {}
  for (const ops of req.body) {
    updateOps[ops.propName] = ops.value
  }
  Product.update({_id: id}, {$set: updateOps})
  .exec()
  .then(result => {
    console.log(result)
    res.status(200).json({
      message: 'Product updated',
      request: {
        type: 'GET',
        url: `http://localhost:5000/api/products/${id}`
      }
    })
  })
  .catch(err => {
    console.log(err)
    res.status(500).json({error: err})
  });
});

router.delete('/:productid', auth, (req, res, next) => {
  const id = req.params.productid
  Product.deleteOne({_id: id})
  .exec()
  .then(result => {
    res.status(200).json({
      message: 'Product deleted',
      request: {
        type: 'POST',
        url: `http://localhost:5000/api/products`,
        body: { name: 'String', price: 'Number', kindOfProduct: 'String', complement: 'Boolean'}
      }
    })
  })
  .catch(err => {
    console.log(err)
    res.status(500).json({error: err})
  });
});

module.exports = router;