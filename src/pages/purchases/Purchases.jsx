import { useEffect, useState } from 'react';
import { Alert, Snackbar } from '@mui/material';
import { purchaseHeaders } from '../../constants';
import ListingTemplate from '../../listing/ListingTemplate';
import api from '../../api/axios';
import AddPurchase from './addPurchase';

export default function Purchases() {
  const [purchases, setPurchases] = useState([]);
  const [supplierOptions, setSupplierOptions] = useState([]);
  const [itemOptions, setItemOptions] = useState([]);
  const [totalPurchases, setTotalPurchases] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const normalizePurchase = (purchase) => ({
    ...purchase,
    purchaseID: purchase.purchaseID ?? purchase.id ?? purchase.purchaseId,
    supplierID: purchase.supplierID ?? purchase.supplier?.supplierID ?? purchase.supplier?.id,
    itemID: purchase.itemID ?? purchase.item?.itemID ?? purchase.item?.id,
    invoiceNumber: purchase.invoiceNumber ?? purchase.invoiceNo ?? purchase.invoice ?? '-',
    supplierName:
      purchase.supplierName ??
      purchase.supplier?.supplierName ??
      purchase.supplier?.name ??
      supplierOptions.find(
        (supplier) =>
          supplier.supplierID ===
          (purchase.supplierID ?? purchase.supplier?.supplierID ?? purchase.supplier?.id),
      )?.supplierName ??
      '-',
    itemName:
      purchase.itemName ??
      purchase.item?.itemName ??
      purchase.item?.name ??
      itemOptions.find(
        (item) => item.itemID === (purchase.itemID ?? purchase.item?.itemID ?? purchase.item?.id),
      )?.itemName ??
      '-',
    quantity: purchase.quantity ?? '-',
    price: purchase.price ?? purchase.Price ?? '-',
    purchaseDate: purchase.purchaseDate ?? purchase.date ?? '-',
    paidStatus: purchase.paidStatus ?? purchase.status ?? '-',
  });

  const fetchPurchases = async (pageNumber = 0, pageSize = 5) => {
    try {
      setLoading(true);
      const response = await api.get(`/purchases?pageNumber=${pageNumber}&pageSize=${pageSize}`);
      const payload = response?.data?.content ?? [];
      const normalizedPurchases = Array.isArray(payload) ? payload : [];

      setPurchases(normalizedPurchases.map(normalizePurchase));
      setTotalPurchases(response?.data?.totalElements ?? normalizedPurchases.length);
      setError('');
    } catch (err) {
      console.error('Failed to fetch purchases:', err);
      setError('Unable to load purchases right now.');
    } finally {
      setLoading(false);
    }
  };

  const fetchPurchaseFormOptions = async () => {
    try {
      const [suppliersResponse, itemsResponse] = await Promise.all([
        api.get('/suppliers?pageNumber=0&pageSize=200&sortBy=supplierName&sortOrder=asc'),
        api.get('/items?pageNumber=0&pageSize=200&sortBy=itemName&sortOrder=asc'),
      ]);

      const suppliersPayload = suppliersResponse?.data?.content ?? [];
      const itemsPayload = itemsResponse?.data?.content ?? [];

      const normalizedSuppliers = Array.isArray(suppliersPayload) ? suppliersPayload : [];
      const normalizedItems = Array.isArray(itemsPayload) ? itemsPayload : [];

      setSupplierOptions(
        normalizedSuppliers
          .map((supplier) => ({
            supplierID: supplier.supplierID ?? supplier.id,
            supplierName: supplier.supplierName ?? supplier.name,
            supplierPrice: supplier.price ?? supplier.Price ?? '',
          }))
          .filter((supplier) => supplier.supplierID && supplier.supplierName),
      );

      setItemOptions(
        normalizedItems
          .map((item) => ({
            itemID: item.itemID ?? item.id,
            itemName: item.itemName ?? item.name,
            itemPrice: item.price ?? item.Price ?? '',
          }))
          .filter((item) => item.itemID && item.itemName),
      );
    } catch (err) {
      console.error('Failed to fetch purchase dropdown options:', err);
    }
  };
  useEffect(() => {
    if(showForm) {
    fetchPurchaseFormOptions();
    }
  }, [showForm]);


  useEffect(() => {
    fetchPurchases();
  }, []);

  useEffect(() => {
    setPurchases((prevPurchases) => prevPurchases.map(normalizePurchase));
  }, [supplierOptions, itemOptions]);

  const handleChangePage = async (event, newPage, rowsPerPageValue) => {
    try {
      const response = await api.get(
        `http://localhost:8080/purchases?pageNumber=${newPage}&pageSize=${rowsPerPageValue}&sortBy=purchaseDate&sortOrder=asc`,
      );
      const payload = response?.data?.content ?? [];
      const normalizedPurchases = Array.isArray(payload) ? payload : [];
      setTotalPurchases(response?.data?.totalElements ?? 0);
      setPurchases(normalizedPurchases.map(normalizePurchase));
    } catch (err) {
      console.error('Failed to fetch purchases:', err);
    }
    setPage(newPage);
  };

  const handleChangeRowsPerPage = async (event) => {
    const nextRowsPerPage = Number(event.target.value);
    setPage(0);
    setRowsPerPage(nextRowsPerPage);

    try {
      const response = await api.get(
        `http://localhost:8080/purchases?pageNumber=0&pageSize=${nextRowsPerPage}&sortBy=purchaseDate&sortOrder=asc`,
      );
      const payload = response?.data?.content ?? [];
      const normalizedPurchases = Array.isArray(payload) ? payload : [];
      setTotalPurchases(response?.data?.totalElements ?? 0);
      setPurchases(normalizedPurchases.map(normalizePurchase));
    } catch (err) {
      console.error('Failed to fetch purchases:', err);
    }
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    setSubmitError('');

    const payload = {
      invoiceNumber: data.invoiceNumber,
      price: Number(data.price),
      quantity: Number(data.quantity),
      purchaseDate: data.purchaseDate,
      paidStatus: data.paidStatus !== '' ? data.paidStatus : 'NOT PAID',
      supplier: {
        supplierID: Number(data.supplier?.supplierID),
      },
      item: {
        itemID: Number(data.item?.itemID),
      },
    };

    try {
      if (selectedPurchase) {
        const purchaseId = selectedPurchase.purchaseID;
        await api.put(`/purchases/${purchaseId}`, payload);
        setSnackbarMessage('Purchase updated successfully.');
      } else {
        await api.post('/purchases', payload);
        setSnackbarMessage('Purchase added successfully.');
      }

      await fetchPurchases(page, rowsPerPage);
      setSnackbarOpen(true);
      setSelectedPurchase(null);
      setShowForm(false);
    } catch (err) {
      console.error('Failed to save purchase:', err);
      setSubmitError(
        selectedPurchase
          ? 'Unable to update the purchase. Please try again.'
          : 'Unable to add the purchase. Please try again.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenForm = () => {
    setSelectedPurchase(null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewPurchase = (purchase) => {
    setSelectedPurchase(purchase);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCloseForm = () => {
    setSelectedPurchase(null);
    setShowForm(false);
    setSubmitError('');
  };

  const handleDeletePurchase = async (purchase) => {
    const purchaseId = purchase.purchaseID;
    if (!purchaseId) return;

    try {
      await api.delete(`/purchases/${purchaseId}`);
      setPurchases((prev) => prev.filter((current) => current.purchaseID !== purchaseId));
      setTotalPurchases((prevCount) => Math.max(0, prevCount - 1));
      setSnackbarMessage('Purchase deleted successfully.');
      setSnackbarOpen(true);
    } catch (err) {
      console.error('Failed to delete purchase:', err);
      setError('Unable to delete the purchase. Please try again.');
    }
  };

  return (
    <>
      {showForm && (
        <AddPurchase
          onSubmit={onSubmit}
          submitting={submitting}
          submitError={submitError}
          onClose={handleCloseForm}
          selectedPurchase={selectedPurchase}
          supplierOptions={supplierOptions}
          itemOptions={itemOptions}
        />
      )}

      <ListingTemplate
        headers={purchaseHeaders}
        rows={purchases}
        count={totalPurchases}
        pageName="Purchase"
        page={page}
        rowsPerPage={rowsPerPage}
        setRowsPerPage={setRowsPerPage}
        setPage={setPage}
        handleChangePage={handleChangePage}
        handleChangeRowsPerPage={handleChangeRowsPerPage}
        onAdd={handleOpenForm}
        onView={handleViewPurchase}
        onDelete={handleDeletePurchase}
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
