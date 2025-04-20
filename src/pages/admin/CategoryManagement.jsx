import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { apiRequest, API_ENDPOINTS } from '../../config/api';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Upload,
  message,
  Space,
  Card,
  Typography,
  Tree,
  Popconfirm,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { TextArea } = Input;

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [form] = Form.useForm();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role !== 'Admin') {
      navigate('/');
      return;
    }
    fetchCategories();
  }, [user, navigate]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await apiRequest(API_ENDPOINTS.categories.list);
      setCategories(data);
    } catch (error) {
      message.error('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    try {
      const formData = new FormData();
      
      // Add basic fields
      formData.append('name', values.name);
      if (values.description) {
        formData.append('description', values.description);
      }
      if (values.parentId) {
        formData.append('parentId', values.parentId);
      }
      formData.append('isActive', values.isActive !== false);

      // Handle image upload
      if (values.image?.[0]?.originFileObj) {
        formData.append('image', values.image[0].originFileObj);
      }

      if (editingCategory) {
        await apiRequest(`/api/admin/categories/${editingCategory.id}`, {
          method: 'PUT',
          body: formData,
          headers: {
            // Don't set Content-Type header, let the browser set it with the boundary
          },
        });
        message.success('Category updated successfully');
      } else {
        await apiRequest('/api/admin/categories', {
          method: 'POST',
          body: formData,
          headers: {
            // Don't set Content-Type header, let the browser set it with the boundary
          },
        });
        message.success('Category created successfully');
      }

      setModalVisible(false);
      form.resetFields();
      setEditingCategory(null);
      fetchCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      message.error(error.message || 'Failed to save category');
    }
  };

  const handleDelete = async (id) => {
    try {
      await apiRequest(API_ENDPOINTS.admin.categories.detail(id), {
        method: 'DELETE',
      });
      message.success('Category deleted successfully');
      fetchCategories();
    } catch (error) {
      message.error('Failed to delete category');
    }
  };

  const columns = [
    {
      title: 'Image',
      dataIndex: 'image',
      key: 'image',
      render: (image) => (
        <img
          src={image || '/placeholder.png'}
          alt="Category"
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
      title: 'Slug',
      dataIndex: 'slug',
      key: 'slug',
    },
    {
      title: 'Parent Category',
      dataIndex: 'parent',
      key: 'parent',
      render: (parent) => parent?.name || '-',
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'status',
      render: (isActive) => (
        <span style={{ color: isActive ? 'green' : 'red' }}>
          {isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => {
              setEditingCategory(record);
              form.setFieldsValue(record);
              setModalVisible(true);
            }}
          />
          <Popconfirm
            title="Are you sure you want to delete this category?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const buildTreeData = (categories) => {
    return categories.map(category => ({
      key: category.id,
      title: category.name,
      children: category.children ? buildTreeData(category.children) : undefined,
    }));
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <Title level={2}>Category Management</Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingCategory(null);
              form.resetFields();
              setModalVisible(true);
            }}
          >
            Add Category
          </Button>
        </div>

        <div style={{ display: 'flex', gap: '24px' }}>
          <div style={{ flex: 2 }}>
            <Table
              columns={columns}
              dataSource={categories}
              rowKey="id"
              loading={loading}
            />
          </div>
          <div style={{ flex: 1 }}>
            <Card title="Category Hierarchy">
              <Tree
                treeData={buildTreeData(categories)}
                defaultExpandAll
              />
            </Card>
          </div>
        </div>

        <Modal
          title={editingCategory ? 'Edit Category' : 'Add Category'}
          open={modalVisible}
          onOk={form.submit}
          onCancel={() => {
            setModalVisible(false);
            form.resetFields();
          }}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{ isActive: true }}
          >
            <Form.Item
              name="name"
              label="Name"
              rules={[{ required: true, message: 'Please enter category name' }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="description"
              label="Description"
            >
              <TextArea rows={4} />
            </Form.Item>

            <Form.Item
              name="parentId"
              label="Parent Category"
            >
              <Select allowClear>
                {categories.map(category => (
                  <Select.Option key={category.id} value={category.id}>
                    {category.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="image"
              label="Image"
            >
              <Upload
                listType="picture-card"
                maxCount={1}
                beforeUpload={() => false}
                fileList={form.getFieldValue('image')}
              >
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </div>
              </Upload>
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
          </Form>
        </Modal>
      </Card>
    </div>
  );
};

export default CategoryManagement; 