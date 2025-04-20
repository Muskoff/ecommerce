const checkProducts = () => {
  try {
    const products = JSON.parse(localStorage.getItem('ecommerce_products') || '[]');
    console.log('Products in local storage:', products);
    
    // Transform the products to ensure proper data types
    return products.map(product => ({
      id: product.id,
      name: product.name,
      description: product.description,
      price: parseFloat(product.price),
      rating: parseFloat(product.rating),
      stock: parseInt(product.stock) || 0,
      categoryId: parseInt(product.categoryId) || 1,
      category_name: product.category_name || 'Uncategorized',
      images: Array.isArray(product.images) ? product.images : [],
      specifications: Array.isArray(product.specifications) ? product.specifications : [],
      isActive: product.isActive === "1",
      createdAt: product.createdAt,
      updated_at: product.updated_at,
      slug: product.slug
    }));
  } catch (error) {
    console.error('Error checking products:', error);
    return [];
  }
};

export default checkProducts; 