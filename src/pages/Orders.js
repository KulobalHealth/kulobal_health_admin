import React, { useState, useEffect } from 'react';
import { 
  HiMagnifyingGlass, 
  HiEye, 
  HiPencil,
  HiArrowPath,
  HiArrowDownTray,
  HiFunnel,
  HiXMark
} from 'react-icons/hi2';
import { FaShoppingBag } from 'react-icons/fa';
import { getOrders, getOrderById, updateOrderStatus, shipOrder, completeOrder, getOrdersByStatus, getOrdersByDate } from '../utils/ordersService';
import { toast } from 'react-toastify';
import OrderDetails from '../components/Orders/OrderDetails';
import OrderInvoice from '../components/Orders/OrderInvoice';
import './Orders.css';

const Orders = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All'); // Changed default to 'All'
  const [selectedDate, setSelectedDate] = useState('Select Dates');
  const [itemsPerPage, setItemsPerPage] = useState('10 per page');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showInvoice, setShowInvoice] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderDetailsLoading, setOrderDetailsLoading] = useState(false);
  const [orderDetailsError, setOrderDetailsError] = useState(null);
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({
    status: '',
    dateFrom: '',
    dateTo: '',
    paymentStatus: '',
    minAmount: '',
    maxAmount: '',
    location: '',
    pharmacyName: '',
  });

  // Helper function to normalize order data from API
  const normalizeOrderData = (order) => {
    // Helper to safely extract string value, ensuring we never return an object
    const getStringValue = (value, fallback = 'N/A') => {
      if (typeof value === 'string') return value;
      if (typeof value === 'number') return String(value);
      if (value && typeof value === 'object') {
        // If it's an object, try to get a name or string property
        return value.name || value.pharmacyName || value.productName || fallback;
      }
      return fallback;
    };

    // Extract pharmacy name safely
    let pharmacyName = 'N/A';
    if (order.pharmacyName && typeof order.pharmacyName === 'string') {
      pharmacyName = order.pharmacyName;
    } else if (order.pharmacy) {
      if (typeof order.pharmacy === 'string') {
        pharmacyName = order.pharmacy;
      } else if (order.pharmacy.name) {
        pharmacyName = order.pharmacy.name;
      } else if (order.pharmacy.pharmacyName) {
        pharmacyName = order.pharmacy.pharmacyName;
      }
    }

    // Extract product name safely
    let productName = 'N/A';
    if (order.productName && typeof order.productName === 'string') {
      productName = order.productName;
    } else if (order.product) {
      if (typeof order.product === 'string') {
        productName = order.product;
      } else if (order.product.name) {
        productName = order.product.name;
      }
    }

    // Extract location safely
    let location = 'N/A';
    if (order.location && typeof order.location === 'string') {
      location = order.location;
    } else if (order.pharmacy?.location && typeof order.pharmacy.location === 'string') {
      location = order.pharmacy.location;
    } else if (order.address && typeof order.address === 'string') {
      location = order.address;
    }

    // Map API response to component's expected format
    return {
      id: order.id || order.orderId || order._id || `#${order.id || 'N/A'}`,
      productName: productName,
      pharmacyName: pharmacyName,
      amount: order.amount || order.total || order.totalAmount || '0.00',
      paymentStatus: getStringValue(order.paymentStatus, 'Full Payment') || 
        getStringValue(order.payment?.status, 'Full Payment'),
      paymentStatusColor: order.paymentStatusColor || 
        (order.paymentStatus === 'Credit' ? 'orange' : 
         order.paymentStatus === 'Partial Payment' ? 'yellow' : 'green'),
      orderDate: order.orderDate || order.createdAt || order.date || new Date().toLocaleDateString(),
      location: location,
      status: order.status || order.orderStatus || 'PENDING',
      statusColor: order.statusColor || 
        (order.status === 'DELIVERED' || order.status === 'Delivered' ? 'green' :
         order.status === 'SHIPPED' || order.status === 'Shipped' ? 'blue' :
         order.status === 'PROCESSING' || order.status === 'Processing' ? 'yellow' :
         order.status === 'PENDING' || order.status === 'Pending' ? 'orange' :
         order.status === 'CANCELLED' || order.status === 'Cancelled' ? 'red' : 'grey'),
      // Include original order data for details view (but don't let it overwrite normalized values)
      originalOrder: order
    };
  };

  // Helper function to find array in nested object
  const findArrayInObject = (obj, depth = 0, maxDepth = 3) => {
    if (depth > maxDepth) return null;
    if (!obj || typeof obj !== 'object') return null;
    
    // Check if current object is an array
    if (Array.isArray(obj)) {
      return obj.length > 0 ? obj : null;
    }
    
    // Check common array property names
    const arrayKeys = ['orders', 'data', 'results', 'items', 'orderList', 'orderData'];
    for (const key of arrayKeys) {
      if (obj[key] && Array.isArray(obj[key]) && obj[key].length > 0) {
        return obj[key];
      }
    }
    
    // Recursively search nested objects
    for (const key in obj) {
      if (obj.hasOwnProperty(key) && typeof obj[key] === 'object') {
        const found = findArrayInObject(obj[key], depth + 1, maxDepth);
        if (found) return found;
      }
    }
    
    return null;
  };

  // Fetch orders from API on component mount
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Orders Page: Fetching orders...');
        const response = await getOrders();
        
        console.log('=== Orders API Response Debug ===');
        console.log('Full Response:', JSON.stringify(response, null, 2));
        console.log('Response Type:', typeof response);
        console.log('Is Array?', Array.isArray(response));
        if (response && typeof response === 'object') {
          console.log('Response Keys:', Object.keys(response));
          console.log('Response Structure:', response);
        }
        
        // Handle different response structures - similar to Products.js approach
        let ordersData = [];
        
        // First, try simple fallback approach (like Products.js)
        if (Array.isArray(response)) {
          ordersData = response;
          console.log('✓ Orders found as direct array:', ordersData.length);
        } else if (response?.data) {
          if (Array.isArray(response.data)) {
            ordersData = response.data;
            console.log('✓ Orders found in response.data:', ordersData.length);
          } else if (response.data.data && Array.isArray(response.data.data)) {
            ordersData = response.data.data;
            console.log('✓ Orders found in response.data.data:', ordersData.length);
          } else if (response.data.orders && Array.isArray(response.data.orders)) {
            ordersData = response.data.orders;
            console.log('✓ Orders found in response.data.orders:', ordersData.length);
          }
        } else if (response?.orders && Array.isArray(response.orders)) {
          ordersData = response.orders;
          console.log('✓ Orders found in response.orders:', ordersData.length);
        } else if (response?.results && Array.isArray(response.results)) {
          ordersData = response.results;
          console.log('✓ Orders found in response.results:', ordersData.length);
        } else if (response?.items && Array.isArray(response.items)) {
          ordersData = response.items;
          console.log('✓ Orders found in response.items:', ordersData.length);
        }
        
        // If still no orders found, try recursive search
        if (ordersData.length === 0 && response && typeof response === 'object') {
          console.log('⚠ No orders found in common locations, searching recursively...');
          const foundArray = findArrayInObject(response);
          if (foundArray) {
            ordersData = foundArray;
            console.log('✓ Orders found via recursive search:', ordersData.length);
          }
        }
        
        // Final fallback - try response.data || response.orders || response || []
        if (ordersData.length === 0) {
          ordersData = response?.data || response?.orders || response || [];
          if (Array.isArray(ordersData)) {
            console.log('✓ Using fallback approach, found:', ordersData.length, 'items');
          } else {
            console.warn('⚠ Fallback did not return an array');
            ordersData = [];
          }
        }
        
        console.log('Final ordersData:', ordersData);
        console.log('Final ordersData length:', ordersData.length);
        console.log('First order sample:', ordersData[0]);
        console.log('================================');
        
        // Normalize order data to match component format
        const normalizedOrders = Array.isArray(ordersData) && ordersData.length > 0
          ? ordersData.map(normalizeOrderData)
          : [];
        
        console.log('Normalized orders count:', normalizedOrders.length);
        
        // Set orders from API
        setOrders(normalizedOrders);
        
        if (normalizedOrders.length === 0) {
          if (response) {
            console.warn('⚠ No orders found. Full response structure:', JSON.stringify(response, null, 2));
            setError('No orders found. Please check the browser console for the API response structure.');
          } else {
            setError('No orders found. The API returned an empty response.');
          }
        } else {
          console.log('✅ Successfully loaded', normalizedOrders.length, 'orders');
          setError(null); // Clear any previous errors
        }
      } catch (err) {
        // Handle 401 errors gracefully
        if (err.response?.status === 401) {
          console.error('Authentication failed. Please login again.');
          setError('Authentication failed. Please login again.');
          setOrders([]);
          return;
        }
        
        // Handle 404 errors - endpoint might not be implemented yet
        if (err.response?.status === 404) {
          console.error('Orders endpoint not found.');
          setError('Orders endpoint not found. Please check if the endpoint is implemented.');
          setOrders([]);
          return;
        }
        
        setError(err.message || 'Failed to fetch orders');
        console.error('Error fetching orders:', err);
        console.error('Error details:', {
          message: err.message,
          status: err.response?.status,
          data: err.response?.data,
          url: err.config?.url,
          baseURL: err.config?.baseURL
        });
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Status tabs configuration
  const statusTabs = [
    { id: 'All', label: 'All Orders' },
    { id: 'PENDING', label: 'Pending' },
    { id: 'PROCESSING', label: 'Processing' },
    { id: 'SHIPPED', label: 'Shipped' },
    { id: 'DELIVERED', label: 'Delivered' },
  ];

  // Calculate counts for each status
  const getStatusCount = (statusId) => {
    if (statusId === 'All') {
      return orders.length;
    }
    return orders.filter((order) => order.status === statusId).length;
  };

  const dateOptions = ['Select Dates', 'Today', 'This Week', 'This Month', 'Custom Range'];

  const itemsPerPageOptions = ['10 per page', '20 per page', '50 per page', '100 per page'];

  // Helper function to parse date string
  const parseDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
  };

  // Filter and search orders
  const getFilteredOrders = () => {
    let filtered = [...orders];

    // Status filter
    if (selectedStatus !== 'All') {
      filtered = filtered.filter((order) => order.status === selectedStatus);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (order) =>
          order.productName?.toLowerCase().includes(query) ||
          order.id?.toLowerCase().includes(query) ||
          order.pharmacyName?.toLowerCase().includes(query) ||
          order.location?.toLowerCase().includes(query)
      );
    }

    // Date filter (simplified - in real app, you'd parse actual dates)
    if (selectedDate !== 'Select Dates') {
      // For demo purposes, we'll just return all orders
      // In a real app, you'd filter by actual dates
    }

    // Advanced filters
    if (advancedFilters.dateFrom) {
      const fromDate = parseDate(advancedFilters.dateFrom);
      if (fromDate) {
        filtered = filtered.filter((order) => {
          const orderDate = parseDate(order.orderDate);
          return orderDate && orderDate >= fromDate;
        });
      }
    }
    if (advancedFilters.dateTo) {
      const toDate = parseDate(advancedFilters.dateTo);
      if (toDate) {
        filtered = filtered.filter((order) => {
          const orderDate = parseDate(order.orderDate);
          return orderDate && orderDate <= toDate;
        });
      }
    }
    if (advancedFilters.paymentStatus) {
      filtered = filtered.filter((order) => 
        order.paymentStatus?.toLowerCase() === advancedFilters.paymentStatus.toLowerCase()
      );
    }
    if (advancedFilters.minAmount) {
      filtered = filtered.filter((order) => {
        const amount = parseFloat(String(order.amount).replace(/[^0-9.]/g, '') || 0);
        return amount >= parseFloat(advancedFilters.minAmount);
      });
    }
    if (advancedFilters.maxAmount) {
      filtered = filtered.filter((order) => {
        const amount = parseFloat(String(order.amount).replace(/[^0-9.]/g, '') || 0);
        return amount <= parseFloat(advancedFilters.maxAmount);
      });
    }
    if (advancedFilters.location) {
      filtered = filtered.filter((order) =>
        order.location?.toLowerCase().includes(advancedFilters.location.toLowerCase())
      );
    }
    if (advancedFilters.pharmacyName) {
      filtered = filtered.filter((order) =>
        order.pharmacyName?.toLowerCase().includes(advancedFilters.pharmacyName.toLowerCase())
      );
    }

    return filtered;
  };

  const filteredOrders = getFilteredOrders();

  // Pagination
  const itemsPerPageNum = parseInt(itemsPerPage.split(' ')[0]);
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPageNum);
  const startIndex = (currentPage - 1) * itemsPerPageNum;
  const endIndex = startIndex + itemsPerPageNum;
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

  // Generate page numbers
  const pages = [];
  const maxPagesToShow = 7;
  if (totalPages <= maxPagesToShow) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push('...');
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push('...');
    pages.push(totalPages);
  }

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedStatus, selectedDate, itemsPerPage]);

  // Handle date filter changes
  useEffect(() => {
    const fetchOrdersByDate = async () => {
      if (selectedDate === 'Select Dates' || !selectedDate) {
        return; // Don't fetch if no date is selected
      }

      try {
        setLoading(true);
        setError(null);

        let dateParam = '';
        const today = new Date();

        // Calculate date based on selection
        if (selectedDate === 'Today') {
          dateParam = today.toISOString().split('T')[0];
        } else if (selectedDate === 'This Week') {
          // Get date from 7 days ago
          const weekAgo = new Date(today);
          weekAgo.setDate(today.getDate() - 7);
          dateParam = weekAgo.toISOString().split('T')[0];
        } else if (selectedDate === 'This Month') {
          // Get date from 30 days ago
          const monthAgo = new Date(today);
          monthAgo.setDate(today.getDate() - 30);
          dateParam = monthAgo.toISOString().split('T')[0];
        } else if (selectedDate === 'Custom Range') {
          // For custom range, open advanced filters
          setShowAdvancedFilter(true);
          setLoading(false);
          return;
        }

        if (dateParam) {
          console.log('📅 Fetching orders by date:', dateParam);
          const response = await getOrdersByDate(dateParam);

          // Handle different response structures
          let ordersData = [];
          
          if (Array.isArray(response)) {
            ordersData = response;
          } else if (response?.data) {
            if (Array.isArray(response.data)) {
              ordersData = response.data;
            } else if (response.data.data && Array.isArray(response.data.data)) {
              ordersData = response.data.data;
            } else if (response.data.orders && Array.isArray(response.data.orders)) {
              ordersData = response.data.orders;
            }
          } else if (response?.orders && Array.isArray(response.orders)) {
            ordersData = response.orders;
          }

          // Normalize order data
          const normalizedOrders = ordersData.map(normalizeOrderData);

          console.log('✅ Orders by date loaded:', normalizedOrders.length);
          setOrders(normalizedOrders);

          if (normalizedOrders.length === 0) {
            setError(`No orders found for ${selectedDate}`);
          }
        }
      } catch (err) {
        console.error('❌ Error fetching orders by date:', err);
        setError(err.message || 'Failed to fetch orders by date');
      } finally {
        setLoading(false);
      }
    };

    fetchOrdersByDate();
  }, [selectedDate]);

  const handleSearch = (e) => {
    e.preventDefault();
    // Search is handled by filteredOrders
  };

  const handleEditOrder = (order) => {
    // TODO: Navigate to edit page or open edit modal
    console.log('Editing order:', order);
    // For now, we'll just show an alert
    alert(`Edit functionality for order ${order.id} will be implemented here.`);
  };

  const handleViewOrder = async (order) => {
    try {
      setOrderDetailsLoading(true);
      setOrderDetailsError(null);
      
      // Extract order ID - try multiple sources and remove # prefix if present
      let orderId = order.originalOrder?.id || order.originalOrder?.orderId || order.originalOrder?._id || 
                    order.id || order.orderId || order._id;
      
      // Remove # prefix if present
      if (typeof orderId === 'string' && orderId.startsWith('#')) {
        orderId = orderId.substring(1);
      }
      
      // Ensure we have a valid ID
      if (!orderId || orderId === 'N/A') {
        throw new Error('Order ID not found');
      }
      
      console.log('Fetching order details for ID:', orderId);
      
      // Fetch order details from API
      const orderDetailsResponse = await getOrderById(orderId);
      
      console.log('Order details response:', orderDetailsResponse);
      
      // Handle different response structures
      let orderDetails = null;
      if (orderDetailsResponse) {
        if (orderDetailsResponse.data) {
          orderDetails = orderDetailsResponse.data;
        } else if (orderDetailsResponse.order) {
          orderDetails = orderDetailsResponse.order;
        } else {
          orderDetails = orderDetailsResponse;
        }
      }
      
      if (orderDetails) {
        // Normalize the fetched order details
        const normalizedDetails = normalizeOrderData(orderDetails);
        // Merge with the original order data to preserve any UI state
        setSelectedOrder({
          ...normalizedDetails,
          originalOrder: orderDetails,
          // Preserve the original order data for reference
          fetchedDetails: orderDetails
        });
      } else {
        // If no details found, use the existing order data
        setSelectedOrder(order);
        setOrderDetailsError('Order details not found. Showing available information.');
      }
    } catch (err) {
      console.error('Error fetching order details:', err);
      
      // Handle 404 errors
      if (err.response?.status === 404) {
        setOrderDetailsError('Order details not found. Showing available information.');
        // Still show the order with available data
        setSelectedOrder(order);
      } else if (err.response?.status === 401) {
        setOrderDetailsError('Authentication failed. Please login again.');
        setSelectedOrder(null);
      } else {
        setOrderDetailsError(err.message || 'Failed to fetch order details. Showing available information.');
        // Still show the order with available data
        setSelectedOrder(order);
      }
    } finally {
      setOrderDetailsLoading(false);
    }
  };

  const handleCloseDetails = () => {
    setSelectedOrder(null);
    setOrderDetailsError(null);
  };

  const handleViewInvoice = (order) => {
    setSelectedOrder(order);
    setShowInvoice(true);
  };

  const handleCloseInvoice = () => {
    setShowInvoice(false);
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      setOrderDetailsLoading(true);
      setOrderDetailsError(null);
      
      // Get pharmacyId from the selected order
      const pharmacyId = selectedOrder?.originalOrder?.pharmacyId || 
                        selectedOrder?.fetchedDetails?.pharmacyId || 
                        selectedOrder?.pharmacyId;
      
      if (!pharmacyId) {
        throw new Error('Pharmacy ID not found. Please ensure the order has a pharmacy ID.');
      }
      
      console.log('Updating order status:', { orderId, pharmacyId, newStatus });
      
      // Call the appropriate endpoint based on the new status
      let apiResponse;
      if (newStatus === 'PROCESSING') {
        // Use process-order endpoint
        apiResponse = await updateOrderStatus(orderId, pharmacyId);
      } else if (newStatus === 'SHIPPED') {
        // Use ship-order endpoint
        apiResponse = await shipOrder(orderId, pharmacyId);
      } else if (newStatus === 'DELIVERED') {
        // Use complete-order endpoint
        apiResponse = await completeOrder(orderId, pharmacyId);
      } else {
        throw new Error(`Unknown status: ${newStatus}`);
      }
      
      console.log('API Response:', apiResponse);
      
      // Show success message
      const statusMessages = {
        'PROCESSING': 'Order confirmed and moved to processing',
        'SHIPPED': 'Order marked as shipped',
        'DELIVERED': 'Order confirmed as delivered'
      };
      toast.success(statusMessages[newStatus] || 'Order status updated successfully');
      
      // Update the order in the local orders list
      setOrders(prevOrders => 
        prevOrders.map(order => {
          const orderIdToMatch = order.originalOrder?.orderId || order.id || order.orderId || order._id;
          let currentOrderId = orderId;
          if (typeof orderId === 'string' && orderId.startsWith('#')) {
            currentOrderId = orderId.substring(1);
          }
          
          if (String(orderIdToMatch) === String(currentOrderId)) {
            // Update the order status
            const updatedOrder = {
              ...order,
              status: newStatus,
              statusColor: newStatus === 'DELIVERED' ? 'green' :
                          newStatus === 'SHIPPED' ? 'blue' :
                          newStatus === 'PROCESSING' ? 'yellow' :
                          newStatus === 'PENDING' ? 'orange' : 'grey',
              originalOrder: {
                ...order.originalOrder,
                status: newStatus
              },
              fetchedDetails: {
                ...order.fetchedDetails,
                status: newStatus
              }
            };
            return updatedOrder;
          }
          return order;
        })
      );
      
      // Update the selected order if it's currently open
      if (selectedOrder) {
        const selectedOrderId = selectedOrder.originalOrder?.orderId || selectedOrder.id || selectedOrder.orderId || selectedOrder._id;
        let currentOrderId = orderId;
        if (typeof orderId === 'string' && orderId.startsWith('#')) {
          currentOrderId = orderId.substring(1);
        }
        
        if (String(selectedOrderId) === String(currentOrderId)) {
          setSelectedOrder(prev => ({
            ...prev,
            status: newStatus,
            statusColor: newStatus === 'DELIVERED' ? 'green' :
                        newStatus === 'SHIPPED' ? 'blue' :
                        newStatus === 'PROCESSING' ? 'yellow' :
                        newStatus === 'PENDING' ? 'orange' : 'grey',
            originalOrder: {
              ...prev.originalOrder,
              status: newStatus
            },
            fetchedDetails: {
              ...prev.fetchedDetails,
              status: newStatus
            }
          }));
        }
      }
      
      // Refresh orders list to get updated data
      await handleRefresh();
      
    } catch (err) {
      console.error('Error updating order status:', err);
      toast.error(err.message || 'Failed to update order status');
      setOrderDetailsError(err.message || 'Failed to update order status');
    } finally {
      setOrderDetailsLoading(false);
    }
  };

  const handleConfirmOrder = () => {
    // This is now handled by handleUpdateOrderStatus
    if (selectedOrder) {
      const orderId = selectedOrder.originalOrder?.orderId || selectedOrder.id || selectedOrder.orderId || selectedOrder._id;
      handleUpdateOrderStatus(orderId, 'PROCESSING');
    }
  };

  const handleRefresh = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getOrders();
      
      // Use the same logic as fetchOrders
      let ordersData = [];
      
      if (Array.isArray(response)) {
        ordersData = response;
      } else if (response?.data) {
        if (Array.isArray(response.data)) {
          ordersData = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          ordersData = response.data.data;
        } else if (response.data.orders && Array.isArray(response.data.orders)) {
          ordersData = response.data.orders;
        }
      } else if (response?.orders && Array.isArray(response.orders)) {
        ordersData = response.orders;
      } else if (response?.results && Array.isArray(response.results)) {
        ordersData = response.results;
      } else if (response?.items && Array.isArray(response.items)) {
        ordersData = response.items;
      }
      
      // Try recursive search if still no orders
      if (ordersData.length === 0 && response && typeof response === 'object') {
        const foundArray = findArrayInObject(response);
        if (foundArray) {
          ordersData = foundArray;
        }
      }
      
      // Final fallback
      if (ordersData.length === 0) {
        ordersData = response?.data || response?.orders || response || [];
        if (!Array.isArray(ordersData)) {
          ordersData = [];
        }
      }
      
      // Normalize order data
      const normalizedOrders = Array.isArray(ordersData) && ordersData.length > 0
        ? ordersData.map(normalizeOrderData)
        : [];
      
      setOrders(normalizedOrders);
      
      if (normalizedOrders.length === 0) {
        setError('No orders found. Please check the browser console for the API response structure.');
      } else {
        console.log('✅ Successfully refreshed', normalizedOrders.length, 'orders');
        setError(null);
      }
    } catch (err) {
      if (err.response?.status === 401) {
        console.error('Authentication failed. Please login again.');
        setError('Authentication failed. Please login again.');
        setOrders([]);
        return;
      }
      
      if (err.response?.status === 404) {
        console.error('Orders endpoint not found.');
        setError('Orders endpoint not found. Please check if the endpoint is implemented.');
        setOrders([]);
        return;
      }
      
      setError(err.message || 'Failed to refresh orders');
      console.error('Error refreshing orders:', err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Exporting orders...');
    // Could export to CSV, Excel, PDF, etc.
    alert('Export functionality will be implemented here. This will export the filtered orders.');
  };

  const handleAdvancedFilter = () => {
    setShowAdvancedFilter(true);
  };

  const handleCloseAdvancedFilter = () => {
    setShowAdvancedFilter(false);
  };

  const handleAdvancedFilterChange = (field, value) => {
    setAdvancedFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
  const handleApplyAdvancedFilters = async () => {
    // If status filter is selected, fetch orders by status from API
    if (advancedFilters.status && advancedFilters.status !== 'All') {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🔍 Applying advanced filter - Status:', advancedFilters.status);
        const response = await getOrdersByStatus(advancedFilters.status);
        
        // Handle different response structures
        let ordersData = [];
        
        if (Array.isArray(response)) {
          ordersData = response;
        } else if (response?.data) {
          if (Array.isArray(response.data)) {
            ordersData = response.data;
          } else if (response.data.data && Array.isArray(response.data.data)) {
            ordersData = response.data.data;
          } else if (response.data.orders && Array.isArray(response.data.orders)) {
            ordersData = response.data.orders;
          }
        } else if (response?.orders && Array.isArray(response.orders)) {
          ordersData = response.orders;
        }
        
        // Normalize order data
        const normalizedOrders = ordersData.map(normalizeOrderData);
        
        console.log('✅ Filtered orders loaded:', normalizedOrders.length);
        setOrders(normalizedOrders);
        
        if (normalizedOrders.length === 0) {
          setError(`No orders found with status: ${advancedFilters.status}`);
        }
      } catch (err) {
        console.error('❌ Error fetching filtered orders:', err);
        setError(err.message || 'Failed to fetch filtered orders');
      } finally {
        setLoading(false);
      }
    }
    
    setShowAdvancedFilter(false);
    setCurrentPage(1); // Reset to first page when filters are applied
  };

  const handleResetAdvancedFilters = () => {
    setAdvancedFilters({
      status: '',
      dateFrom: '',
      dateTo: '',
      paymentStatus: '',
      minAmount: '',
      maxAmount: '',
      location: '',
      pharmacyName: '',
    });
    
    // Reload all orders when filters are reset
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await getOrders();
        let ordersData = [];
        
        if (Array.isArray(response)) {
          ordersData = response;
        } else if (response?.data) {
          if (Array.isArray(response.data)) {
            ordersData = response.data;
          } else if (response.data.data && Array.isArray(response.data.data)) {
            ordersData = response.data.data;
          } else if (response.data.orders && Array.isArray(response.data.orders)) {
            ordersData = response.data.orders;
          }
        } else if (response?.orders && Array.isArray(response.orders)) {
          ordersData = response.orders;
        }
        
        const normalizedOrders = ordersData.map(normalizeOrderData);
        setOrders(normalizedOrders);
        setError(null);
      } catch (err) {
        console.error('Error reloading orders:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
  };

  const getStatusDotColor = (color) => {
    const colors = {
      green: '#00A170',
      orange: '#f97316',
      grey: '#9ca3af',
      blue: '#3b82f6',
      red: '#ef4444',
      yellow: '#eab308',
    };
    return colors[color] || colors.grey;
  };

  return (
    <>
      <div className="orders-page">
        {/* Header */}
        <div className="orders-header">
          <div>
            <h1 className="orders-title">Orders Management</h1>
            <p className="orders-subtitle">View and manage all orders from marketplace.</p>
          </div>
        </div>

        {/* Status Tabs */}
        <div className="orders-status-tabs">
          {statusTabs.map((tab) => {
            const count = getStatusCount(tab.id);
            
            return (
              <button
                key={tab.id}
                className={`status-tab ${selectedStatus === tab.id ? 'active' : ''}`}
                onClick={() => setSelectedStatus(tab.id)}
              >
                <span className="status-tab-label">{tab.label}</span>
                {count > 0 && (
                  <span className="status-tab-count">{count}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Search and Filter Bar */}
        <div className="orders-filters">
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-input-wrapper">
              <HiMagnifyingGlass className="search-icon" />
              <input
                type="text"
                placeholder="Search order"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
          </form>

          <div className="orders-actions">
            <button
              type="button"
              className="action-icon-button"
              onClick={handleRefresh}
              title="Refresh"
              disabled={loading}
            >
              <HiArrowPath className={loading ? 'spinning' : ''} />
            </button>
            
            <button
              type="button"
              className="action-icon-button"
              onClick={handleAdvancedFilter}
              title="Advanced Filter"
            >
              <HiFunnel />
            </button>

            <button
              type="button"
              className="action-icon-button"
              onClick={handleExport}
              title="Export Orders"
            >
              <HiArrowDownTray />
            </button>

            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="filter-dropdown"
            >
              {dateOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>

            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(e.target.value)}
              className="filter-dropdown"
            >
              {itemsPerPageOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p>Loading orders...</p>
          </div>
        )}

        {/* Error Message */}
        {error && !loading && (
          <div className="orders-error" style={{ 
            padding: '12px 16px', 
            backgroundColor: '#fee2e2', 
            color: '#dc2626', 
            borderRadius: '8px', 
            marginBottom: '20px' 
          }}>
            {error}
          </div>
        )}

        {/* Orders Table */}
        {!loading && (
        <div className="orders-table-container">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Pharmacy</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedOrders.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>
                    <div style={{ color: '#9ca3af', fontSize: '14px' }}>
                      No orders found matching your criteria.
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((order, index) => (
                <tr key={index}>
                  <td>
                    <div className="order-id-cell">
                      <div className="order-icon-wrapper">
                        <FaShoppingBag className="order-icon" />
                      </div>
                      <div className="order-id-content">
                        <div className="product-name">{order.productName}</div>
                        <div className="order-id">{order.id}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="pharmacy-cell">
                      <div className="pharmacy-name-text">{order.pharmacyName}</div>
                      <div className="pharmacy-location">{order.location}</div>
                    </div>
                  </td>
                  <td>
                    <div className="amount-cell">
                      <div className="amount">GHS {order.amount}</div>
                      <div
                        className="payment-status"
                        style={{ color: getStatusDotColor(order.paymentStatusColor) }}
                      >
                        <span
                          className="status-dot"
                          style={{ backgroundColor: getStatusDotColor(order.paymentStatusColor) }}
                        />
                        {order.paymentStatus}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="order-date">{order.orderDate}</div>
                  </td>
                  <td>
                    <div
                      className="order-status"
                      style={{ 
                        color: getStatusDotColor(order.statusColor),
                        backgroundColor: `${getStatusDotColor(order.statusColor)}15`
                      }}
                    >
                      <span
                        className="status-dot"
                        style={{ backgroundColor: getStatusDotColor(order.statusColor) }}
                      />
                      {order.status}
                    </div>
                  </td>
                  <td>
                    <div className="actions-cell">
                      <button
                        className="action-button"
                        title="View Details"
                        onClick={() => handleViewOrder(order)}
                      >
                        <HiEye />
                      </button>
                    </div>
                  </td>
                </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        )}

        {/* Pagination */}
        {!loading && filteredOrders.length > 0 && (
          <div className="pagination">
            <div className="pagination-info">
              Showing {startIndex + 1} - {Math.min(endIndex, filteredOrders.length)} of{' '}
              {filteredOrders.length} orders
            </div>
            <div className="pagination-controls">
              <button
                className="pagination-button"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                ← Previous
              </button>
              <div className="pagination-numbers">
                {pages.map((page, index) => (
                  <button
                    key={index}
                    className={`pagination-number ${page === currentPage ? 'active' : ''} ${
                      page === '...' ? 'ellipsis' : ''
                    }`}
                    onClick={() => typeof page === 'number' && setCurrentPage(page)}
                    disabled={page === '...'}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <button
                className="pagination-button"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Order Details Panel */}
      {selectedOrder && !showInvoice && (
        <OrderDetails
          order={selectedOrder}
          onClose={handleCloseDetails}
          onConfirmOrder={handleConfirmOrder}
          onUpdateStatus={handleUpdateOrderStatus}
          onViewInvoice={() => handleViewInvoice(selectedOrder)}
          loading={orderDetailsLoading}
          error={orderDetailsError}
        />
      )}

      {/* Invoice Modal */}
      {showInvoice && selectedOrder && (
        <OrderInvoice
          order={selectedOrder}
          onClose={handleCloseInvoice}
        />
      )}

      {/* Advanced Filter Modal */}
      {showAdvancedFilter && (
        <div className="advanced-filter-overlay" onClick={handleCloseAdvancedFilter}>
          <div className="advanced-filter-modal" onClick={(e) => e.stopPropagation()}>
            <div className="advanced-filter-header">
              <h2 className="advanced-filter-title">Advanced Filters</h2>
              <button
                className="advanced-filter-close"
                onClick={handleCloseAdvancedFilter}
                aria-label="Close"
              >
                <HiXMark />
              </button>
            </div>

            <div className="advanced-filter-content">
              {/* Order Status */}
              <div className="filter-group">
                <label className="filter-label">Order Status</label>
                <select
                  value={advancedFilters.status}
                  onChange={(e) => handleAdvancedFilterChange('status', e.target.value)}
                  className="filter-input"
                >
                  <option value="">All Status</option>
                  <option value="PENDING">Pending</option>
                  <option value="PROCESSING">Processing</option>
                  <option value="SHIPPED">Shipped</option>
                  <option value="DELIVERED">Delivered</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>

              {/* Date Range */}
              <div className="filter-group">
                <label className="filter-label">Date Range</label>
                <div className="filter-date-range">
                  <div className="filter-date-input">
                    <label className="filter-date-label">From</label>
                    <input
                      type="date"
                      value={advancedFilters.dateFrom}
                      onChange={(e) => handleAdvancedFilterChange('dateFrom', e.target.value)}
                      className="filter-input"
                    />
                  </div>
                  <div className="filter-date-input">
                    <label className="filter-date-label">To</label>
                    <input
                      type="date"
                      value={advancedFilters.dateTo}
                      onChange={(e) => handleAdvancedFilterChange('dateTo', e.target.value)}
                      className="filter-input"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Status */}
              <div className="filter-group">
                <label className="filter-label">Payment Status</label>
                <select
                  value={advancedFilters.paymentStatus}
                  onChange={(e) => handleAdvancedFilterChange('paymentStatus', e.target.value)}
                  className="filter-input"
                >
                  <option value="">All Payment Status</option>
                  <option value="Full Payment">Full Payment</option>
                  <option value="Credit">Credit</option>
                  <option value="Partial Payment">Partial Payment</option>
                </select>
              </div>

              {/* Amount Range */}
              <div className="filter-group">
                <label className="filter-label">Amount Range (GHS)</label>
                <div className="filter-amount-range">
                  <div className="filter-amount-input">
                    <label className="filter-amount-label">Min</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={advancedFilters.minAmount}
                      onChange={(e) => handleAdvancedFilterChange('minAmount', e.target.value)}
                      className="filter-input"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="filter-amount-input">
                    <label className="filter-amount-label">Max</label>
                    <input
                      type="number"
                      placeholder="100000.00"
                      value={advancedFilters.maxAmount}
                      onChange={(e) => handleAdvancedFilterChange('maxAmount', e.target.value)}
                      className="filter-input"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="filter-group">
                <label className="filter-label">Location</label>
                <input
                  type="text"
                  placeholder="Enter location"
                  value={advancedFilters.location}
                  onChange={(e) => handleAdvancedFilterChange('location', e.target.value)}
                  className="filter-input"
                />
              </div>

              {/* Pharmacy Name */}
              <div className="filter-group">
                <label className="filter-label">Pharmacy Name</label>
                <input
                  type="text"
                  placeholder="Enter pharmacy name"
                  value={advancedFilters.pharmacyName}
                  onChange={(e) => handleAdvancedFilterChange('pharmacyName', e.target.value)}
                  className="filter-input"
                />
              </div>
            </div>

            <div className="advanced-filter-footer">
              <button
                className="filter-button filter-button-secondary"
                onClick={handleResetAdvancedFilters}
              >
                Reset
              </button>
              <button
                className="filter-button filter-button-primary"
                onClick={handleApplyAdvancedFilters}
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Orders;