import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiRequest, API_ENDPOINTS } from '../config/api';
import {
  Table,
  Card,
  Typography,
  Button,
  Space,
  Spin,
  Empty,
  message,
} from 'antd';
import { DeleteOutlined, ShoppingCartOutlined } from '@ant-design/icons';

const { Title } = Typography;

const Wishlist = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchWishlistItems();
  }, []);

  const fetchWishlistItems = async () => {
    try {
      setLoading(true);
      const data = await apiRequest(API_ENDPOINTS.wishlist.list);
      setWishlistItems(data);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      message.error('Failed to fetch wishlist items');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (productId) => {
    try {
      await apiRequest(API_ENDPOINTS.wishlist.remove(productId), {
        method: 'DELETE',
      });
      message.success('Item removed from wishlist');
      fetchWishlistItems();
    } catch (error) {
      console.error('Error removing item from wishlist:', error);
      message.error('Failed to remove item from wishlist');
    }
  };

  const handleAddToCart = async (productId) => {
    try {
      await apiRequest(API_ENDPOINTS.cart.add, {
        method: 'POST',
        body: JSON.stringify({ productId, quantity: 1 }),
      });
      message.success('Item added to cart');
    } catch (error) {
      console.error('Error adding item to cart:', error);
      message.error('Failed to add item to cart');
    }
  };

  const columns = [
    {
      title: 'Product',
      dataIndex: 'product',
      key: 'product',
      render: (product) => (
        <Space>
          <img
            src={product.image}
            alt={product.name}
            style={{ width: 50, height: 50, objectFit: 'cover' }}
          />
          <div>
            <div>{product.name}</div>
            <div>${product.price.toFixed(2)}</div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<ShoppingCartOutlined />}
            onClick={() => handleAddToCart(record.product.id)}
          >
            Add to Cart
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleRemoveFromWishlist(record.product.id)}
          >
            Remove
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <Title level={2}>My Wishlist</Title>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Spin size="large" />
          </div>
        ) : wishlistItems.length === 0 ? (
          <Empty
            description="Your wishlist is empty"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <Table
            columns={columns}
            dataSource={wishlistItems}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        )}
      </Card>
    </div>
  );
};

export default Wishlist; 