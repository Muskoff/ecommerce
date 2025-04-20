import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiRequest, API_ENDPOINTS } from '../config/api';
import {
  Table,
  Card,
  Typography,
  Tag,
  Space,
  Button,
  Modal,
  Descriptions,
  Spin,
  Empty,
} from 'antd';
import { EyeOutlined } from '@ant-design/icons';

const { Title } = Typography;

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await apiRequest(API_ENDPOINTS.orders.list);
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      Pending: 'gold',
      Processing: 'blue',
      Shipped: 'cyan',
      Delivered: 'green',
      Cancelled: 'red',
    };
    return colors[status] || 'default';
  };

  const getPaymentStatusColor = (status) => {
    const colors = {
      Pending: 'gold',
      Completed: 'green',
      Failed: 'red',
      Refunded: 'orange',
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
      key: 'payment',
      render: (status) => (
        <Tag color={getPaymentStatusColor(status)}>{status}</Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button
          icon={<EyeOutlined />}
          onClick={() => {
            setSelectedOrder(record);
            setModalVisible(true);
          }}
        >
          View Details
        </Button>
      ),
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <Title level={2}>Order History</Title>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Spin size="large" />
          </div>
        ) : orders.length === 0 ? (
          <Empty
            description="No orders found"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <Table
            columns={columns}
            dataSource={orders}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        )}

        <Modal
          title="Order Details"
          open={modalVisible}
          onCancel={() => {
            setModalVisible(false);
            setSelectedOrder(null);
          }}
          footer={null}
          width={800}
        >
          {selectedOrder && (
            <div>
              <Descriptions bordered>
                <Descriptions.Item label="Order ID">
                  {selectedOrder.id}
                </Descriptions.Item>
                <Descriptions.Item label="Date">
                  {new Date(selectedOrder.createdAt).toLocaleString()}
                </Descriptions.Item>
                <Descriptions.Item label="Status">
                  <Tag color={getStatusColor(selectedOrder.status)}>
                    {selectedOrder.status}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Payment Status">
                  <Tag color={getPaymentStatusColor(selectedOrder.paymentStatus)}>
                    {selectedOrder.paymentStatus}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Payment Method">
                  {selectedOrder.paymentMethod}
                </Descriptions.Item>
                <Descriptions.Item label="Subtotal">
                  ${selectedOrder.subtotal.toFixed(2)}
                </Descriptions.Item>
                <Descriptions.Item label="Tax">
                  ${selectedOrder.tax.toFixed(2)}
                </Descriptions.Item>
                <Descriptions.Item label="Shipping Cost">
                  ${selectedOrder.shippingCost.toFixed(2)}
                </Descriptions.Item>
                <Descriptions.Item label="Total">
                  ${selectedOrder.total.toFixed(2)}
                </Descriptions.Item>
              </Descriptions>

              <Title level={4} style={{ marginTop: 24 }}>Shipping Address</Title>
              <Descriptions bordered>
                <Descriptions.Item label="Name">
                  {selectedOrder.shippingAddress.name}
                </Descriptions.Item>
                <Descriptions.Item label="Address">
                  {selectedOrder.shippingAddress.address}
                </Descriptions.Item>
                <Descriptions.Item label="City">
                  {selectedOrder.shippingAddress.city}
                </Descriptions.Item>
                <Descriptions.Item label="State">
                  {selectedOrder.shippingAddress.state}
                </Descriptions.Item>
                <Descriptions.Item label="ZIP Code">
                  {selectedOrder.shippingAddress.zipCode}
                </Descriptions.Item>
                <Descriptions.Item label="Country">
                  {selectedOrder.shippingAddress.country}
                </Descriptions.Item>
              </Descriptions>

              <Title level={4} style={{ marginTop: 24 }}>Order Items</Title>
              <Table
                dataSource={selectedOrder.items}
                columns={[
                  {
                    title: 'Product',
                    dataIndex: 'product',
                    key: 'product',
                    render: (product) => product.name,
                  },
                  {
                    title: 'Price',
                    dataIndex: 'price',
                    key: 'price',
                    render: (price) => `$${price.toFixed(2)}`,
                  },
                  {
                    title: 'Quantity',
                    dataIndex: 'quantity',
                    key: 'quantity',
                  },
                  {
                    title: 'Subtotal',
                    key: 'subtotal',
                    render: (_, record) =>
                      `$${(record.price * record.quantity).toFixed(2)}`,
                  },
                ]}
                rowKey="id"
                pagination={false}
              />
            </div>
          )}
        </Modal>
      </Card>
    </div>
  );
};

export default Orders; 