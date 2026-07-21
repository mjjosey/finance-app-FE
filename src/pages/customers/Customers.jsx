import { useEffect, useState } from 'react';
import { Alert, Snackbar } from '@mui/material';
import { customerHeaders } from '../../constants';
import ListingTemplate from '../../listing/ListingTemplate';
import api from '../../api/axios';
import AddCustomer from './addCustomer';
import { useThemeMode } from '../../ThemeProvider';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const { mode } = useThemeMode();
  const isDark = mode === 'dark';
  const fetchCustomers = async (pageNumber = 0, pageSize = 5) => {
    try {
      setLoading(true);
      const response = await api.get(`/customers?pageNumber=${pageNumber}&pageSize=${pageSize}`);
      const payload = response?.data?.content ?? [];
      const normalizedCustomers = Array.isArray(payload) ? payload : [];

      setCustomers(
        normalizedCustomers.map((customer) => ({
          ...customer,
          customerID: customer.customerID ?? customer.id ?? customer.customerId,
          customerName: customer.customerName ?? customer.name ?? 'Unknown Customer',
          email: customer.email ?? customer.emailAddress ?? '-',
          mobile: customer.mobile ?? customer.mobileNumber ?? customer.phone ?? '-',
          city: customer.city ?? customer.address?.city ?? '-',
        })),
      );
      setTotalCustomers(response?.data?.totalElements ?? normalizedCustomers.length);
      setError('');
    } catch (err) {
      console.error('Failed to fetch customers:', err);
      setError('Unable to load customers right now.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);
 const handleChangePage = async (event, newPage,rowsPerPage) => {
    console.log(newPage,"new page");
        try {
        const response = await api.get(`http://localhost:8080/customers?pageNumber=${newPage}&pageSize=${rowsPerPage}&sortBy=customerName&sortOrder=asc`);
        console.log(response, 'response');
        
        const payload = response?.data?.content ??  [];
        const normalizedItems = Array.isArray(payload) ? payload : [];
        setTotalCustomers(response?.data?.totalElements ?? 0);
        setCustomers(
          normalizedItems.map((item) => ({
            ...item,
            customerName: item.customerName ?? item.name ?? 'Unknown Customer',
            email: item.email ?? item.emailAddress ?? '-',
            mobile: item.mobile ?? item.mobileNumber ?? item.phone ?? '-',
            city: item.city ?? item.address?.city ?? '-'
          })),
        );
      } catch (err) {
        console.error('Failed to fetch items:', err);
      } 
    setPage(newPage);
  };
  const handleChangeRowsPerPage = async (event) => {
    console.log("oooooooooo");
    
    setPage(0);
    setRowsPerPage(event.target.value);
          try {
        const response = await api.get(`http://localhost:8080/customers?pageNumber=0&pageSize=${event.target.value}&sortBy=customerName&sortOrder=asc`);
        console.log(response, 'response');
        
        const payload = response?.data?.content ??  [];
        const normalizedItems = Array.isArray(payload) ? payload : [];
        setTotalCustomers(response?.data?.totalElements ?? 0);
        setCustomers(
          normalizedItems.map((item) => ({
            ...item,
            customerName: item.customerName ?? item.name ?? 'Unknown Customer',
            email: item.email ?? item.emailAddress ?? '-',
            mobile: item.mobile ?? item.mobileNumber ?? item.phone ?? '-',
            city: item.city ?? item.address?.city ?? '-'
          })),
        );
      } catch (err) {
        console.error('Failed to fetch items:', err);
      } 
  };
  const onSubmit = async (data) => {
    setSubmitting(true);
    setSubmitError('');

    try {
      if (selectedCustomer) {
        const customerId = selectedCustomer.customerID ;
        const response = await api.put(`/customers/${customerId}`, {
          customerName: data.customerName,
          email: data.email,
          mobile: data.mobile,
          city: data.city,
        });

        const updatedCustomer = response?.data ?? {
          ...selectedCustomer,
          customerName: data.customerName,
          email: data.email,
          mobile: data.mobile,
          city: data.city,
        };

        setCustomers((prev) =>
          prev.map((customer) => {
            const id = customer.customerID;
            return id === customerId ? { ...customer, ...updatedCustomer } : customer;
          }),
        );
        setSnackbarMessage('Customer updated successfully.');
      } else {
        const response = await api.post('/customers', {
          customerName: data.customerName,
          email: data.email,
          mobile: data.mobile,
          city: data.city,
        });

        const newCustomer = response?.data ?? {
          customerName: data.customerName,
          email: data.email,
          mobile: data.mobile,
          city: data.city,
          itemID: undefined,
        };

        setCustomers((prev) => [
          {
            ...newCustomer,
            customerID: newCustomer.customerID,
          },
          ...prev,
        ]);
        setTotalCustomers((prevCount) => prevCount + 1);
        setSnackbarMessage('Customer added successfully.');
      }

      setSnackbarOpen(true);
      setSelectedCustomer(null);
      setShowForm(false);
    } catch (err) {
      console.error('Failed to save customer:', err);
      setSubmitError(selectedCustomer ? 'Unable to update the customer. Please try again.' : 'Unable to add the customer. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenForm = () => {
    setSelectedCustomer(null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewCustomer = (customer) => {
    setSelectedCustomer(customer);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCloseForm = () => {
    setSelectedCustomer(null);
    setShowForm(false);
    setSubmitError('');
  };

  const handleDeleteCustomer = async (customer) => {
    const customerId = customer.customerID;
    if (!customerId) return;

    try {
      await api.delete(`/customers/${customerId}`);
      setCustomers((prev) => prev.filter((current) => {
        const id = current.customerID;
        return id !== customerId;
      }));
      setTotalCustomers((prevCount) => Math.max(0, prevCount - 1));
      setSnackbarMessage('Customer deleted successfully.');
      setSnackbarOpen(true);
    } catch (err) {
      console.error('Failed to delete customer:', err);
      setError('Unable to delete the customer. Please try again.');
    }
  };

  return (
    <>
      {showForm && (
        <AddCustomer
          onSubmit={onSubmit}
          submitting={submitting}
          submitError={submitError}
          onClose={handleCloseForm}
          selectedCustomer={selectedCustomer}
        />
      )}

      <ListingTemplate
        headers={customerHeaders}
        rows={customers}
        count={totalCustomers}
         pageName="Customer"
         page={page}
         rowsPerPage={rowsPerPage}
                setRowsPerPage={setRowsPerPage}
                setPage={setPage}
        handleChangePage={handleChangePage}
                handleChangeRowsPerPage={handleChangeRowsPerPage}
        onAdd={handleOpenForm}
        onView={handleViewCustomer}
        onDelete={handleDeleteCustomer}
        pageName="Customer"
        title="Customers"
        subtitle="Manage your customer records and contact details."
        loading={loading}
        error={error}
      />

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity="success" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
}
