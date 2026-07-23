import { useEffect, useState } from 'react';
import { Alert, Snackbar } from '@mui/material';
import { salesHeaders } from '../../constants';
import ListingTemplate from '../../listing/ListingTemplate';
import api from '../../api/axios';
import AddSale from './addSale';

export default function Sales() {
  const [sales, setSales] = useState([]);
  const [itemOptions, setItemOptions] = useState([]);
  const [customerOptions, setCustomerOptions] = useState([]);
  const [totalSales, setTotalSales] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const normalizeSale = (sale) => ({
    ...sale,
    saleID: sale.saleID ?? sale.id ?? sale.saleId,
    itemID: sale.itemID ?? sale.item?.itemID ?? sale.item?.id,
    customerID: sale.customerID ?? sale.customer?.customerID ?? sale.customer?.id,
    invoiceNumber: sale.invoiceNumber ?? sale.invoiceNo ?? sale.invoice ?? '-',
    itemName:
      sale.itemName ??
      sale.item?.itemName ??
      sale.item?.name ??
      itemOptions.find(
        (item) => item.itemID === (sale.itemID ?? sale.item?.itemID ?? sale.item?.id),
      )?.itemName ??
      '-',
    customerName:
      sale.customerName ??
      sale.customer?.customerName ??
      sale.customer?.name ??
      customerOptions.find(
        (customer) =>
          customer.customerID ===
          (sale.customerID ?? sale.customer?.customerID ?? sale.customer?.id),
      )?.customerName ??
      '-',
    quantity: sale.quantity ?? '-',
    price: sale.price ?? sale.Price ?? '-',
    saleDate: sale.saleDate ?? sale.date ?? '-',
    paidStatus: sale.paidStatus ?? sale.status ?? '-',
  });

  const fetchSales = async (pageNumber = 0, pageSize = 5) => {
    try {
      setLoading(true);
      const response = await api.get(`/sales?pageNumber=${pageNumber}&pageSize=${pageSize}`);
      const payload = response?.data?.content ?? [];
      const normalizedSales = Array.isArray(payload) ? payload : [];
      setSales(normalizedSales.map(normalizeSale));
      setTotalSales(response?.data?.totalElements ?? normalizedSales.length);
      setError('');
    } catch (err) {
      console.error('Failed to fetch sales:', err);
      setError('Unable to load sales right now.');
    } finally {
      setLoading(false);
    }
  };

  const fetchSaleFormOptions = async () => {
    try {
      const [itemsResponse, customersResponse] = await Promise.all([
        api.get('/items?pageNumber=0&pageSize=200&sortBy=itemName&sortOrder=asc'),
        api.get('/customers?pageNumber=0&pageSize=200&sortBy=customerName&sortOrder=asc'),
      ]);

      const itemsPayload = itemsResponse?.data?.content ?? [];
      const customersPayload = customersResponse?.data?.content ?? [];

      const normalizedItems = Array.isArray(itemsPayload) ? itemsPayload : [];
      const normalizedCustomers = Array.isArray(customersPayload) ? customersPayload : [];

      setItemOptions(
        normalizedItems
          .map((item) => ({
            itemID: item.itemID ?? item.id,
            itemName: item.itemName ?? item.name,
            itemPrice: item.price ?? item.Price ?? '',
          }))
          .filter((item) => item.itemID && item.itemName),
      );

      setCustomerOptions(
        normalizedCustomers
          .map((customer) => ({
            customerID: customer.customerID ?? customer.id,
            customerName: customer.customerName ?? customer.name,
          }))
          .filter((customer) => customer.customerID && customer.customerName),
      );
    } catch (err) {
      console.error('Failed to fetch dropdown options:', err);
    }
  };

  useEffect(() => {
    fetchSales();
    fetchSaleFormOptions();
  }, []);
  useEffect(() => {
    setSales((prevSales) => prevSales.map(normalizeSale));
  }, [itemOptions, customerOptions]);

  const handleChangePage = async (event, newPage, rowsPerPageValue) => {
    try {
      const response = await api.get(
        `http://localhost:8080/sales?pageNumber=${newPage}&pageSize=${rowsPerPageValue}&sortBy=saleDate&sortOrder=asc`,
      );
      const payload = response?.data?.content ?? [];
      const normalizedSales = Array.isArray(payload) ? payload : [];
      setTotalSales(response?.data?.totalElements ?? 0);
      setSales(normalizedSales.map(normalizeSale));
    } catch (err) {
      console.error('Failed to fetch sales:', err);
    }
    setPage(newPage);
  };

  const handleChangeRowsPerPage = async (event) => {
    const nextRowsPerPage = Number(event.target.value);
    setPage(0);
    setRowsPerPage(nextRowsPerPage);

    try {
      const response = await api.get(
        `http://localhost:8080/sales?pageNumber=0&pageSize=${nextRowsPerPage}&sortBy=saleDate&sortOrder=asc`,
      );
      const payload = response?.data?.content ?? [];
      const normalizedSales = Array.isArray(payload) ? payload : [];
      setTotalSales(response?.data?.totalElements ?? 0);
      setSales(normalizedSales.map(normalizeSale));
    } catch (err) {
      console.error('Failed to fetch sales:', err);
    }
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    setSubmitError('');

    const payload = {
      invoiceNumber: data.invoiceNumber,
      price: Number(data.price),
      quantity: Number(data.quantity),
      saleDate: data.saleDate,
      paidStatus: data.paidStatus !== '' ? data.paidStatus : 'NOT PAID',
      item: {
        itemID: Number(data.item?.itemID),
      },
      customer: {
        customerID: Number(data.customer?.customerID),
      },
    };

    try {
      if (selectedSale) {
        const saleId = selectedSale.salesID;
        const response = await api.put(`/sales/${saleId}`, payload);
        const updatedSale = normalizeSale(response?.data ?? { ...selectedSale, ...payload });

        setSales((prev) =>
          prev.map((sale) => {
            const id = sale.salesID;
            return id === saleId ? { ...sale, ...updatedSale } : sale;
          }),
        );
        setSnackbarMessage('Sale updated successfully.');
      } else {
        const response = await api.post('/sales', payload);
        const newSale = normalizeSale(response?.data ?? payload);

        setSales((prev) => [newSale, ...prev]);
        setTotalSales((prevCount) => prevCount + 1);
        setSnackbarMessage('Sale added successfully.');
      }

      setSnackbarOpen(true);
      setSelectedSale(null);
      setShowForm(false);
    } catch (err) {
      console.error('Failed to save sale:', err);
      setSubmitError(
        selectedSale
          ? 'Unable to update the sale. Please try again.'
          : 'Unable to add the sale. Please try again.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenForm = () => {
    setSelectedSale(null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewSale = (sale) => {
    setSelectedSale(sale);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCloseForm = () => {
    setSelectedSale(null);
    setShowForm(false);
    setSubmitError('');
  };

  const handleDeleteSale = async (sale) => {
    const saleId = sale.salesID;
    if (!saleId) return;

    try {
      await api.delete(`/sales/${saleId}`);
      setSales((prev) => prev.filter((current) => current.salesID !== saleId));
      setTotalSales((prevCount) => Math.max(0, prevCount - 1));
      setSnackbarMessage('Sale deleted successfully.');
      setSnackbarOpen(true);
    } catch (err) {
      console.error('Failed to delete sale:', err);
      setError('Unable to delete the sale. Please try again.');
    }
  };

  return (
    <>
      {showForm && (
        <AddSale
          onSubmit={onSubmit}
          submitting={submitting}
          submitError={submitError}
          onClose={handleCloseForm}
          selectedSale={selectedSale}
          itemOptions={itemOptions}
          customerOptions={customerOptions}
        />
      )}

      <ListingTemplate
        headers={salesHeaders}
        rows={sales}
        count={totalSales}
        pageName="Sale"
        page={page}
        rowsPerPage={rowsPerPage}
        setRowsPerPage={setRowsPerPage}
        setPage={setPage}
        handleChangePage={handleChangePage}
        handleChangeRowsPerPage={handleChangeRowsPerPage}
        onAdd={handleOpenForm}
        onView={handleViewSale}
        onDelete={handleDeleteSale}
        title="Sales"
        subtitle="Manage sales records, customers, pricing, and payment status."
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
