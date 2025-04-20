import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Grid,
  Typography,
  Box,
  Button,
  TextField,
  Divider,
  Card,
  CardContent,
  Tabs,
  Tab,
  IconButton,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Share as ShareIcon,
  ShoppingCart as CartIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import checkProducts from '../utils/checkProducts';

// Local storage key
const PRODUCTS_STORAGE_KEY = 'ecommerce_products';

const ProductDetail = () => {
  const { id } = useParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    const fetchProduct = () => {
      try {
        setLoading(true);
        
        // Check if we have a valid ID
        if (!id) {
          console.error('No product ID provided');
          setError('Invalid product ID');
          return;
        }

        const productId = parseInt(id);
        if (isNaN(productId)) {
          console.error('Invalid product ID:', id);
          setError('Invalid product ID');
          return;
        }

        console.log('Fetching product with ID:', productId);
        
        // Get products from local storage
        const products = checkProducts();
        console.log('All products:', products);
        
        if (!products || products.length === 0) {
          console.log('No products found in local storage');
          setError('No products available');
          return;
        }

        const foundProduct = products.find(p => p.id === productId);
        console.log('Found product:', foundProduct);
        
        if (foundProduct) {
          setProduct(foundProduct);
        } else {
          console.log('Product not found with ID:', productId);
          setError('Product not found');
          toast.error('Product not found');
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        setError('Failed to load product');
        toast.error('Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleQuantityChange = (event) => {
    const value = parseInt(event.target.value);
    if (value > 0 && value <= product.stock) {
      setQuantity(value);
    }
  };

  const handleAddToCart = () => {
    try {
      // Get existing cart from local storage
      const CART_STORAGE_KEY = 'ecommerce_cart';
      const existingCart = localStorage.getItem(CART_STORAGE_KEY);
      const cartItems = existingCart ? JSON.parse(existingCart) : [];
      
      // Check if product already exists in cart
      const existingItemIndex = cartItems.findIndex(item => item.productId === product.id);
      
      if (existingItemIndex >= 0) {
        // Update quantity if product already in cart
        const newQuantity = cartItems[existingItemIndex].quantity + quantity;
        if (newQuantity <= product.stock) {
          cartItems[existingItemIndex].quantity = newQuantity;
        } else {
          toast.error('Not enough stock available');
          return;
        }
      } else {
        // Add new item to cart
        cartItems.push({
          id: Date.now(),
          productId: product.id,
          name: product.name,
          price: product.price,
          image: product.images?.[0] || 'https://placehold.co/100x100?text=No+Image',
          quantity: quantity
        });
      }
      
      // Save updated cart to local storage
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
      
      // Show success message
      toast.success(`${quantity} ${product.name} added to cart`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add item to cart');
    }
  };

  const handleAddToWishlist = () => {
    setIsWishlisted(!isWishlisted);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: `Check out this product: ${product.name}`,
        url: window.location.href,
      });
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>Loading product...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        <Button 
          variant="contained" 
          color="primary"
          onClick={() => window.history.back()}
        >
          Go Back
        </Button>
      </Container>
    );
  }

  if (!product) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>Product not found</Alert>
        <Button 
          variant="contained" 
          color="primary"
          onClick={() => window.history.back()}
        >
          Go Back
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Grid container spacing={4}>
        {/* Product Images */}
        <Grid item xs={12} md={6}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            <Box
              component="img"
              src={product.images?.[0] || 'https://placehold.co/600x400?text=No+Image'}
              alt={product.name}
              sx={{
                width: '100%',
                height: 'auto',
                borderRadius: 1,
              }}
            />
            {product.images && product.images.length > 1 && (
              <Box
                sx={{
                  display: 'flex',
                  gap: 1,
                  overflowX: 'auto',
                  py: 1,
                }}
              >
                {product.images.map((image, index) => (
                  <Box
                    key={index}
                    component="img"
                    src={image}
                    alt={`${product.name} - ${index + 1}`}
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: 1,
                      cursor: 'pointer',
                      '&:hover': {
                        opacity: 0.8,
                      },
                    }}
                  />
                ))}
              </Box>
            )}
          </Box>
        </Grid>

        {/* Product Info */}
        <Grid item xs={12} md={6}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              {product.name}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              Category: {product.category_name}
            </Typography>
            <Typography variant="h5" color="primary" gutterBottom>
              ${product.price.toFixed(2)}
            </Typography>
            <Typography variant="body1" paragraph>
              {product.description}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              Stock: {product.stock}
            </Typography>
          </Box>

          {/* Quantity and Add to Cart */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <TextField
                label="Quantity"
                type="number"
                value={quantity}
                onChange={handleQuantityChange}
                inputProps={{ 
                  min: 1,
                  max: product.stock
                }}
                sx={{ width: 100 }}
              />
              <Button
                variant="contained"
                color="primary"
                size="large"
                startIcon={<CartIcon />}
                onClick={handleAddToCart}
                fullWidth
                disabled={product.stock === 0}
              >
                {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </Button>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton
                color={isWishlisted ? 'error' : 'default'}
                onClick={handleAddToWishlist}
              >
                {isWishlisted ? <FavoriteIcon /> : <FavoriteBorderIcon />}
              </IconButton>
              <IconButton onClick={handleShare}>
                <ShareIcon />
              </IconButton>
            </Box>
          </Box>

          {/* Product Details Tabs */}
          <Card>
            <CardContent>
              <Tabs value={activeTab} onChange={handleTabChange}>
                <Tab label="Description" />
                <Tab label="Specifications" />
                <Tab label="Details" />
              </Tabs>
              <Box sx={{ mt: 2 }}>
                {activeTab === 0 && (
                  <Typography variant="body1">{product.description}</Typography>
                )}
                {activeTab === 1 && (
                  <Box>
                    {Array.isArray(product.specifications) ? (
                      product.specifications.map((spec, index) => (
                        <Box key={index} sx={{ mb: 1 }}>
                          <Typography variant="subtitle1">{spec.name}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {spec.value}
                          </Typography>
                        </Box>
                      ))
                    ) : (
                      <Typography variant="body1">{product.specifications}</Typography>
                    )}
                  </Box>
                )}
                {activeTab === 2 && (
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Created: {new Date(product.createdAt).toLocaleDateString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Last Updated: {new Date(product.updated_at).toLocaleDateString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      SKU: {product.slug}
                    </Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ProductDetail; 