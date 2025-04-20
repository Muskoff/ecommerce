import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CardMedia,
  Button,
  CircularProgress,
  Alert,
  Grid,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import checkCategories from '../utils/checkCategories';

const CategoryDetail = () => {
  const { id } = useParams();
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategory = () => {
      try {
        setLoading(true);
        const categories = checkCategories();
        const foundCategory = categories.find(cat => cat.id === parseInt(id));
        
        if (!foundCategory) {
          setError('Category not found');
          return;
        }

        setCategory(foundCategory);
      } catch (error) {
        console.error('Error fetching category:', error);
        setError('Failed to load category');
      } finally {
        setLoading(false);
      }
    };

    fetchCategory();
  }, [id]);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>Loading category...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        <Button
          component={Link}
          to="/categories"
          startIcon={<ArrowBackIcon />}
          variant="contained"
        >
          Back to Categories
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Button
          component={Link}
          to="/categories"
          startIcon={<ArrowBackIcon />}
          variant="outlined"
          sx={{ mb: 4 }}
        >
          Back to Categories
        </Button>

        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardMedia
                component="img"
                height="400"
                image={category.image_url || 'https://placehold.co/600x400?text=No+Image'}
                alt={category.name}
              />
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h4" component="h1" gutterBottom>
                  {category.name}
                </Typography>
                <Typography variant="body1" paragraph>
                  {category.description}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Created: {new Date(category.created_at).toLocaleDateString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Last Updated: {new Date(category.updated_at).toLocaleDateString()}
                </Typography>
                <Box sx={{ mt: 4 }}>
                  <Button
                    component={Link}
                    to={`/products?category=${category.id}`}
                    variant="contained"
                    color="primary"
                    size="large"
                  >
                    View Products
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default CategoryDetail; 