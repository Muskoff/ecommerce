import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiRequest, API_ENDPOINTS } from '../../config/api';
import {
  Container,
  Grid,
  Typography,
  Box,
  Button,
  Rating,
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
} from '@mui/material';
import {
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Share as ShareIcon,
  ShoppingCart as CartIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

const AdminProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [activeTab, setActiveTab] = useState(0);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) {
        setError('Product ID is missing');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        console.log('Fetching product with ID:', id);
        const data = await apiRequest(API_ENDPOINTS.admin.products.detail(id));
        console.log('Product data received:', data);
        
        // Process the data to handle JSON strings
        const processedData = {
          ...data,
          // Parse images from JSON string if needed
          images: typeof data.images === 'string' ? JSON.parse(data.images) : data.images,
          // Parse specifications from JSON string if needed
          specifications: typeof data.specifications === 'string' ? 
            (data.specifications === '9' ? {} : JSON.parse(data.specifications)) : 
            data.specifications,
          // Convert isActive to boolean
          isActive: data.isActive === '1' || data.isActive === true,
          // Ensure price is a number
          price: parseFloat(data.price)
        };
        
        console.log('Processed product data:', processedData);
        setProduct(processedData);
      } catch (error) {
        console.error('Error fetching product:', error);
        setError('Failed to load product details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleEdit = () => {
    navigate(`/admin/products/edit/${id}`);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await apiRequest(API_ENDPOINTS.admin.products.detail(id), {
          method: 'DELETE'
        });
        navigate('/admin/products');
      } catch (error) {
        console.error('Error deleting product:', error);
        setError('Failed to delete product. Please try again later.');
      }
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" component="h1">
          {product.name}
        </Typography>
        <Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={<EditIcon />}
            onClick={handleEdit}
            sx={{ mr: 2 }}
          >
            Edit Product
          </Button>
          <Button
            variant="contained"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleDelete}
          >
            Delete Product
          </Button>
        </Box>
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Box
            component="img"
            src={product.images && product.images.length > 0 ? product.images[0] : '/placeholder.jpg'}
            alt={product.name}
            sx={{
              width: '100%',
              height: 'auto',
              objectFit: 'cover',
              borderRadius: 1,
            }}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h5" component="h2" gutterBottom>
                {product.name}
              </Typography>
              <Typography variant="h6" color="primary" gutterBottom>
                ${product.price.toFixed(2)}
              </Typography>
              <Box display="flex" alignItems="center" mb={2}>
                <Rating value={product.rating || 0} readOnly precision={0.5} />
                <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                  ({product.reviews?.length || 0} reviews)
                </Typography>
              </Box>
              <Typography variant="body1" paragraph>
                {product.description}
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" gutterBottom>
                Category
              </Typography>
              <Typography variant="body1" paragraph>
                {product.category_name || 'Uncategorized'}
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" gutterBottom>
                Stock
              </Typography>
              <Typography variant="body1" paragraph>
                {product.stock} units
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" gutterBottom>
                Status
              </Typography>
              <Typography variant="body1" paragraph>
                {product.isActive ? 'Active' : 'Inactive'}
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" gutterBottom>
                Specifications
              </Typography>
              {product.specifications && Object.keys(product.specifications).length > 0 ? (
                <Grid container spacing={2}>
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <Grid item xs={6} key={key}>
                      <Typography variant="body2" color="text.secondary">
                        {key}:
                      </Typography>
                      <Typography variant="body1">{value}</Typography>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Typography variant="body1">No specifications available</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AdminProductDetail; 