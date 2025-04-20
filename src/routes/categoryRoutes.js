const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth');
const Category = require('../models/Category');
const Product = require('../models/Product');

// Get all categories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.findAll();
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Error fetching categories' });
  }
});

// Get single category
router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.json(category);
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ message: 'Error fetching category' });
  }
});

// Get products by category
router.get('/:id/products', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const products = await Product.findByCategory(req.params.id, { page, limit });
    res.json(products);
  } catch (error) {
    console.error('Error fetching category products:', error);
    res.status(500).json({ message: 'Error fetching category products' });
  }
});

// Create category (admin only)
router.post('/', authenticateUser, async (req, res) => {
  try {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Not authorized to create categories' });
    }

    const { name, description, parentId } = req.body;

    // Validate parent category if provided
    if (parentId) {
      const parentCategory = await Category.findById(parentId);
      if (!parentCategory) {
        return res.status(400).json({ message: 'Parent category not found' });
      }
    }

    const category = await Category.create({
      name,
      description,
      parentId
    });

    res.status(201).json(category);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ message: 'Error creating category' });
  }
});

// Update category (admin only)
router.put('/:id', authenticateUser, async (req, res) => {
  try {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Not authorized to update categories' });
    }

    const { name, description, parentId } = req.body;

    // Validate parent category if provided
    if (parentId) {
      const parentCategory = await Category.findById(parentId);
      if (!parentCategory) {
        return res.status(400).json({ message: 'Parent category not found' });
      }
    }

    const category = await Category.update(req.params.id, {
      name,
      description,
      parentId
    });

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json(category);
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ message: 'Error updating category' });
  }
});

// Delete category (admin only)
router.delete('/:id', authenticateUser, async (req, res) => {
  try {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Not authorized to delete categories' });
    }

    // Check if category has products
    const products = await Product.findByCategory(req.params.id);
    if (products.length > 0) {
      return res.status(400).json({ message: 'Cannot delete category with products' });
    }

    // Check if category has subcategories
    const subcategories = await Category.findByParentId(req.params.id);
    if (subcategories.length > 0) {
      return res.status(400).json({ message: 'Cannot delete category with subcategories' });
    }

    const category = await Category.delete(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ message: 'Error deleting category' });
  }
});

// Get subcategories
router.get('/:id/subcategories', async (req, res) => {
  try {
    const subcategories = await Category.findByParentId(req.params.id);
    res.json(subcategories);
  } catch (error) {
    console.error('Error fetching subcategories:', error);
    res.status(500).json({ message: 'Error fetching subcategories' });
  }
});

module.exports = router; 