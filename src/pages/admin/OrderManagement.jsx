import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { apiRequest, API_ENDPOINTS } from '../../config/api';
import {
  Table,
  Button,
  Modal,
  Form,
  Select,
  Input,
  Tag,
  Space,
  Card,
  Typography,
  DatePicker,
  Statistic,
  Row,
  Col,
  Tooltip,
  message,
} from 'antd';
import { EyeOutlined, EditOutlined, PrinterOutlined, SearchOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { RangePicker } = DatePicker;
const { TextArea } = Input;

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [form] = Form.useForm();
  const [filters, setFilters] = useState({
    status: undefined,
    paymentStatus: undefined,
    dateRange: null,
    search: '',
  });
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
    pendingOrders: 0,
  });
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role !== 'Admin') {
      navigate('/');
      return;
    }
    fetchOrders();
    fetchStats();
  }, [user, navigate, filters]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.paymentStatus) queryParams.append('paymentStatus', filters.paymentStatus);
      if (filters.dateRange?.[0]) queryParams.append('startDate', filters.dateRange[0].format('YYYY-MM-DD'));
      if (filters.dateRange?.[1]) queryParams.append('endDate', filters.dateRange[1].format('YYYY-MM-DD'));
      if (filters.search) queryParams.append('search', filters.search);

      const response = await apiRequest(`/api/admin/orders?${queryParams.toString()}`);
      setOrders(response);
    } catch (error) {
      console.error('Error fetching orders:', error);
      message.error('Failed to fetch orders. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await apiRequest('/api/admin/orders/stats');
      setStats({
        totalOrders: response.totalOrders || 0,
        totalRevenue: response.totalRevenue || 0,
        averageOrderValue: response.averageOrderValue || 0,
        pendingOrders: response.pendingOrders || 0
      });
    } catch (error) {
      console.error('Error fetching order statistics:', error);
      message.error('Failed to fetch order statistics. Please try again later.');
    }
  };

  const handleStatusUpdate = async (values) => {
    try {
      await apiRequest(`${API_ENDPOINTS.admin.orders.detail(selectedOrder.id)}/status`, {
        method: 'PUT',
        body: JSON.stringify(values),
      });
      message.success('Order status updated successfully');
      setModalVisible(false);
      form.resetFields();
      fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      message.error('Failed to update order status');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      Pending: 'orange',
      Processing: 'blue',
      Shipped: 'cyan',
      Delivered: 'green',
      Cancelled: 'red',
      Refunded: 'purple',
    };
    return colors[status] || 'default';
  };

  const getPaymentStatusColor = (status) => {
    const colors = {
      Pending: 'orange',
      Paid: 'green',
      Failed: 'red',
      Refunded: 'purple',
    };
    return colors[status] || 'default';
  };

  const columns = [
    {
      title: 'Order ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'date',
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Customer',
      dataIndex: 'userName',
      key: 'customer',
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      render: (total) => `$${total.toFixed(2)}`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)}>{status}</Tag>
      ),
    },
    {
      title: 'Payment',
      dataIndex: 'paymentStatus',
      key: 'paymentStatus',
      render: (status) => (
        <Tag color={getPaymentStatusColor(status)}>{status}</Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              icon={<EyeOutlined />}
              onClick={() => {
                setSelectedOrder(record);
                setModalVisible(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Print Invoice">
            <Button
              icon={<PrinterOutlined />}
              onClick={() => window.open(`/api/admin/orders/${record.id}/invoice`, '_blank')}
            />
          </Tooltip>
        </Space>
      ),
    },
    {
      title: 'Product',
      dataIndex: ['product', 'name'],
      key: 'product',
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img
            src={record.product?.images?.[0] || 'https://placehold.co/300x300?text=No+Image'}
            alt={record.product?.name}
            style={{ width: 40, height: 40, objectFit: 'cover' }}
          />
          <span>{record.product?.name}</span>
        </div>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <div style={{ marginBottom: 24 }}>
          <Title level={2}>Order Management</Title>
          
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Total Orders"
                  value={stats.totalOrders}
                  precision={0}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Total Revenue"
                  value={stats.totalRevenue}
                  precision={2}
                  prefix="$"
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Average Order Value"
                  value={stats.averageOrderValue}
                  precision={2}
                  prefix="$"
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Pending Orders"
                  value={stats.pendingOrders}
                  precision={0}
                />
              </Card>
            </Col>
          </Row>

          <Space wrap style={{ marginBottom: 16 }}>
            <Select
              placeholder="Order Status"
              allowClear
              style={{ width: 150 }}
              onChange={(value) => setFilters({ ...filters, status: value })}
            >
              <Select.Option value="Pending">Pending</Select.Option>
              <Select.Option value="Processing">Processing</Select.Option>
              <Select.Option value="Shipped">Shipped</Select.Option>
              <Select.Option value="Delivered">Delivered</Select.Option>
              <Select.Option value="Cancelled">Cancelled</Select.Option>
              <Select.Option value="Refunded">Refunded</Select.Option>
            </Select>

            <Select
              placeholder="Payment Status"
              allowClear
              style={{ width: 150 }}
              onChange={(value) => setFilters({ ...filters, paymentStatus: value })}
            >
              <Select.Option value="Pending">Pending</Select.Option>
              <Select.Option value="Paid">Paid</Select.Option>
              <Select.Option value="Failed">Failed</Select.Option>
              <Select.Option value="Refunded">Refunded</Select.Option>
            </Select>

            <RangePicker
              onChange={(dates) => setFilters({ ...filters, dateRange: dates })}
            />

            <Input
              placeholder="Search orders..."
              prefix={<SearchOutlined />}
              style={{ width: 200 }}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={orders}
          rowKey="id"
          loading={loading}
        />

        <Modal
          title="Order Details"
          open={modalVisible}
          onCancel={() => {
            setModalVisible(false);
            setSelectedOrder(null);
            form.resetFields();
          }}
          footer={null}
          width={800}
        >
          {selectedOrder && (
            <div>
              <div style={{ marginBottom: 16 }}>
                <p>Order ID: {selectedOrder.id}</p>
                <p>Date: {new Date(selectedOrder.createdAt).toLocaleString()}</p>
                <p>Customer: {selectedOrder.userName}</p>
                <p>Email: {selectedOrder.userEmail}</p>
              </div>

              <div style={{ marginBottom: 24 }}>
                <h3>Shipping Address</h3>
                <p>{selectedOrder.shippingAddress.street}</p>
                <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zipCode}</p>
                <p>{selectedOrder.shippingAddress.country}</p>
              </div>

              <div style={{ marginBottom: 24 }}>
                <h3>Order Items</h3>
                <Table
                  dataSource={selectedOrder.items}
                  columns={[
                    {
                      title: 'Product',
                      dataIndex: ['product', 'name'],
                    },
                    {
                      title: 'Quantity',
                      dataIndex: 'quantity',
                    },
                    {
                      title: 'Price',
                      dataIndex: 'price',
                      render: (price) => `$${price.toFixed(2)}`,
                    },
                    {
                      title: 'Total',
                      render: (_, record) => `$${(record.quantity * record.price).toFixed(2)}`,
                    },
                  ]}
                  pagination={false}
                />
              </div>

              <div style={{ marginBottom: 24 }}>
                <h3>Order Summary</h3>
                <p>Subtotal: ${selectedOrder.subtotal.toFixed(2)}</p>
                <p>Tax: ${selectedOrder.tax.toFixed(2)}</p>
                <p>Shipping: ${selectedOrder.shippingCost.toFixed(2)}</p>
                <p><strong>Total: ${selectedOrder.total.toFixed(2)}</strong></p>
              </div>

              <Form
                form={form}
                layout="vertical"
                onFinish={handleStatusUpdate}
                initialValues={{
                  status: selectedOrder.status,
                  paymentStatus: selectedOrder.paymentStatus,
                  trackingNumber: selectedOrder.trackingNumber,
                  notes: selectedOrder.notes,
                }}
              >
                <Form.Item
                  name="status"
                  label="Order Status"
                >
                  <Select>
                    <Select.Option value="Pending">Pending</Select.Option>
                    <Select.Option value="Processing">Processing</Select.Option>
                    <Select.Option value="Shipped">Shipped</Select.Option>
                    <Select.Option value="Delivered">Delivered</Select.Option>
                    <Select.Option value="Cancelled">Cancelled</Select.Option>
                    <Select.Option value="Refunded">Refunded</Select.Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  name="paymentStatus"
                  label="Payment Status"
                >
                  <Select>
                    <Select.Option value="Pending">Pending</Select.Option>
                    <Select.Option value="Paid">Paid</Select.Option>
                    <Select.Option value="Failed">Failed</Select.Option>
                    <Select.Option value="Refunded">Refunded</Select.Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  name="trackingNumber"
                  label="Tracking Number"
                >
                  <Input />
                </Form.Item>

                <Form.Item
                  name="notes"
                  label="Notes"
                >
                  <TextArea rows={4} />
                </Form.Item>

                <Form.Item>
                  <Button type="primary" htmlType="submit">
                    Update Order
                  </Button>
                </Form.Item>
              </Form>
            </div>
          )}
        </Modal>
      </Card>
    </div>
  );
};

export default OrderManagement; 