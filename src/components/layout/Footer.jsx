import { Box, Container, Grid, Typography, Link } from '@mui/material';
import {
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  Instagram as InstagramIcon,
  LinkedIn as LinkedInIcon,
} from '@mui/icons-material';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: 'primary.main',
        color: 'white',
        py: 6,
        mt: 'auto',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Company Info */}
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" gutterBottom>
              E-Commerce
            </Typography>
            <Typography variant="body2">
              Your one-stop shop for all your shopping needs. Quality products at
              great prices.
            </Typography>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" gutterBottom>
              Quick Links
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link href="/about" color="inherit" underline="none">
                About Us
              </Link>
              <Link href="/contact" color="inherit" underline="none">
                Contact
              </Link>
              <Link href="/faq" color="inherit" underline="none">
                FAQ
              </Link>
              <Link href="/shipping" color="inherit" underline="none">
                Shipping Policy
              </Link>
              <Link href="/returns" color="inherit" underline="none">
                Returns Policy
              </Link>
            </Box>
          </Grid>

          {/* Contact Info */}
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" gutterBottom>
              Contact Us
            </Typography>
            <Typography variant="body2">
              123 Shopping Street
              <br />
              City, State 12345
              <br />
              Phone: (123) 456-7890
              <br />
              Email: support@ecommerce.com
            </Typography>
          </Grid>
        </Grid>

        {/* Social Media Links */}
        <Box
          sx={{
            mt: 4,
            display: 'flex',
            justifyContent: 'center',
            gap: 2,
          }}
        >
          <Link href="#" color="inherit">
            <FacebookIcon />
          </Link>
          <Link href="#" color="inherit">
            <TwitterIcon />
          </Link>
          <Link href="#" color="inherit">
            <InstagramIcon />
          </Link>
          <Link href="#" color="inherit">
            <LinkedInIcon />
          </Link>
        </Box>

        {/* Copyright */}
        <Typography
          variant="body2"
          align="center"
          sx={{ mt: 4 }}
        >
          © {new Date().getFullYear()} E-Commerce. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer; 