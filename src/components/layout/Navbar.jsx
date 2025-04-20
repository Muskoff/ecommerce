import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Box,
} from '@mui/material';
import {
  ShoppingCart as CartIcon,
  Person as PersonIcon,
  Menu as MenuIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState(null);

  // Mock data - replace with actual cart state
  const cartItemsCount = 0;

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMobileMenu = (event) => {
    setMobileMenuAnchor(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setMobileMenuAnchor(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Successfully logged out!');
      handleClose();
    } catch (err) {
      toast.error('Logout failed');
    }
  };

  const menuItems = [
    { label: 'Home', path: '/' },
    { label: 'Products', path: '/products' },
    { label: 'Categories', path: '/categories' },
  ];

  const userMenuItems = user
    ? [
        { label: 'Profile', path: '/profile' },
        { label: 'Orders', path: '/orders' },
        { label: 'Wishlist', path: '/wishlist' },
        { label: 'Logout', action: handleLogout },
      ]
    : [
        { label: 'Login', path: '/login' },
        { label: 'Register', path: '/register' },
      ];

  if (user?.isAdmin) {
    userMenuItems.push({ label: 'Admin Dashboard', path: '/admin' });
  }

  return (
    <AppBar position="static">
      <Toolbar>
        {/* Mobile menu button */}
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          sx={{ mr: 2, display: { sm: 'none' } }}
          onClick={handleMobileMenu}
        >
          <MenuIcon />
        </IconButton>

        {/* Logo */}
        <Typography
          variant="h6"
          component={RouterLink}
          to="/"
          sx={{
            flexGrow: 1,
            textDecoration: 'none',
            color: 'inherit',
          }}
        >
          E-Commerce
        </Typography>

        {/* Desktop Navigation */}
        <Box sx={{ display: { xs: 'none', sm: 'flex' } }}>
          {menuItems.map((item) => (
            <Button
              key={item.path}
              color="inherit"
              component={RouterLink}
              to={item.path}
            >
              {item.label}
            </Button>
          ))}
        </Box>

        {/* Cart Icon */}
        <IconButton
          color="inherit"
          component={RouterLink}
          to="/cart"
          sx={{ ml: 2 }}
        >
          <Badge badgeContent={cartItemsCount} color="secondary">
            <CartIcon />
          </Badge>
        </IconButton>

        {/* User Menu */}
        <IconButton
          color="inherit"
          onClick={handleMenu}
          sx={{ ml: 2 }}
        >
          <PersonIcon />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
        >
          {userMenuItems.map((item) => (
            <MenuItem
              key={item.label}
              onClick={() => {
                if (item.action) {
                  item.action();
                } else {
                  navigate(item.path);
                  handleClose();
                }
              }}
            >
              {item.label}
            </MenuItem>
          ))}
        </Menu>

        {/* Mobile Menu */}
        <Menu
          anchorEl={mobileMenuAnchor}
          open={Boolean(mobileMenuAnchor)}
          onClose={handleClose}
        >
          {menuItems.map((item) => (
            <MenuItem
              key={item.path}
              component={RouterLink}
              to={item.path}
              onClick={handleClose}
            >
              {item.label}
            </MenuItem>
          ))}
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 