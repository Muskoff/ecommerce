import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { apiRequest, API_ENDPOINTS } from '../../config/api';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Upload,
  message,
  Space,
  Card,
  Typography,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined, EyeOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { TextArea } = Input;

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form] = Form.useForm();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role !== 'Admin') {
      navigate('/');
      return;
    }
    fetchProducts();
    fetchCategories();
  }, [user, navigate]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await apiRequest(API_ENDPOINTS.admin.products.list);
      console.log('Products fetched from database:', data);
      setProducts(data);
    } catch (error) {
      message.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await apiRequest(API_ENDPOINTS.categories.list);
      setCategories(data);
    } catch (error) {
      message.error('Failed to fetch categories');
    }
  };

  const handleSubmit = async (values) => {
    try {
      const formData = new FormData();
      
      // Add basic fields
      formData.append('name', values.name);
      formData.append('description', values.description);
      formData.append('categoryId', values.categoryId);
      formData.append('price', values.price);
      formData.append('stock', values.stock);
      formData.append('isActive', values.isActive);
      
      // Handle specifications
      if (values.specifications) {
        formData.append('specifications', values.specifications);
      }

      // Handle image upload
      if (values.images && values.images.length > 0) {
        values.images.forEach(file => {
          if (file.originFileObj) {
            formData.append('images', file.originFileObj);
          }
        });
      }

      if (editingProduct) {
        await apiRequest(`/api/admin/products/${editingProduct.id}`, {
          method: 'PUT',
          body: formData,
        });
        message.success('Product updated successfully');
      } else {
        await apiRequest('/api/admin/products', {
          method: 'POST',
          body: formData,
        });
        message.success('Product created successfully');
      }

      setModalVisible(false);
      form.resetFields();
      setEditingProduct(null);
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      message.error(error.message || 'Failed to save product');
    }
  };

  const handleDelete = async (id) => {
    try {
      await apiRequest(API_ENDPOINTS.admin.products.detail(id), {
        method: 'DELETE',
      });
      message.success('Product deleted successfully');
      fetchProducts();
    } catch (error) {
      message.error('Failed to delete product');
    }
  };

  const handleEdit = (record) => {
    setEditingProduct(record);
    form.setFieldsValue({
      name: record.name,
      description: record.description,
      categoryId: record.categoryId,
      price: record.price,
      stock: record.stock,
      isActive: record.isActive,
      specifications: record.specifications,
      images: record.images ? record.images.map(url => ({
        uid: url,
        name: url.split('/').pop(),
        status: 'done',
        url: url
      })) : []
    });
    setModalVisible(true);
  };

  const handleAdd = () => {
    setEditingProduct(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleCancel = () => {
    setModalVisible(false);
    form.resetFields();
    setEditingProduct(null);
  };

  const handleViewDetails = (productId) => {
    console.log('Viewing details for product ID:', productId);
    const product = products.find(p => String(p.id) === String(productId));
    console.log('Product object:', product);
    
    // Make sure we have a valid product ID
    if (!productId) {
      message.error('Invalid product ID');
      return;
    }
    
    // Navigate to the product detail page
    navigate(`/admin/products/${productId}`);
  };

  const columns = [
    {
      title: 'Image',
      dataIndex: 'images',
      key: 'image',
      render: (images) => (
        <img
          src={images?.[0] || 'https://placehold.co/300x300?text=No+Image'}
          alt="Product"
          style={{ width: 50, height: 50, objectFit: 'cover' }}
        />
      ),
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (category) => category?.name,
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price) => `$${Number(price).toFixed(2)}`,
    },
    {
      title: 'Stock',
      dataIndex: 'stock',
      key: 'stock',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            onClick={() => handleViewDetails(record.id)}
            title="View Details"
          />
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <Title level={2}>Product Management</Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
          >
            Add Product
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={products}
          rowKey="id"
          loading={loading}
        />

        <Modal
          title={editingProduct ? 'Edit Product' : 'Add New Product'}
          open={modalVisible}
          onCancel={handleCancel}
          footer={null}
          width={800}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={editingProduct}
          >
            <Form.Item
              name="name"
              label="Name"
              rules={[{ required: true, message: 'Please enter product name' }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="description"
              label="Description"
              rules={[{ required: true, message: 'Please enter product description' }]}
            >
              <TextArea rows={4} />
            </Form.Item>

            <Form.Item
              name="categoryId"
              label="Category"
              rules={[{ required: true, message: 'Please select a category' }]}
            >
              <Select>
                {categories.map(category => (
                  <Select.Option key={category.id} value={category.id}>
                    {category.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="price"
              label="Price"
              rules={[
                { required: true, message: 'Please enter product price' },
                { type: 'number', message: 'Price must be a number' }
              ]}
            >
              <InputNumber
                min={0}
                step={0.01}
                precision={2}
                style={{ width: '100%' }}
              />
            </Form.Item>

            <Form.Item
              name="stock"
              label="Stock"
              rules={[{ required: true, message: 'Please enter product stock' }]}
            >
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              name="images"
              label="Images"
              rules={[{ required: true, message: 'Please upload at least one image' }]}
            >
              <Upload
                listType="picture-card"
                maxCount={5}
                beforeUpload={() => false}
                accept="image/*"
                multiple
              >
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </div>
              </Upload>
            </Form.Item>

            <Form.Item
              name="specifications"
              label="Specifications"
            >
              <Input.TextArea rows={4} />
            </Form.Item>

            <Form.Item
              name="isActive"
              label="Status"
              valuePropName="checked"
            >
              <Select>
                <Select.Option value={true}>Active</Select.Option>
                <Select.Option value={false}>Inactive</Select.Option>
              </Select>
            </Form.Item>
            
            <Form.Item>
              <Button type="primary" htmlType="submit">
                {editingProduct ? 'Update Product' : 'Add Product'}
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </Card>
    </div>
  );
};

export default ProductManagement; 