import { useEffect, useState } from 'react';
import { Alert, Snackbar } from '@mui/material';
import { supplierHeaders } from '../../constants';
import ListingTemplate from '../../listing/ListingTemplate';
import api from '../../api/axios';
import AddSupplier from './addSupplier';
import { useThemeMode } from '../../ThemeProvider';

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [totalSuppliers, setTotalSuppliers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const { mode } = useThemeMode();
  const isDark = mode === 'dark';

  const fetchSuppliers = async (pageNumber = 0, pageSize = 5) => {
    try {
      setLoading(true);
      const response = await api.get(`/suppliers?pageNumber=${pageNumber}&pageSize=${pageSize}`);
      const payload = response?.data?.content ?? [];
      const normalizedSuppliers = Array.isArray(payload) ? payload : [];

      setSuppliers(
        normalizedSuppliers.map((supplier) => ({
          ...supplier,
          supplierID: supplier.supplierID ?? supplier.id ?? supplier.supplierId,
          supplierName: supplier.supplierName ?? supplier.name ?? 'Unknown Supplier',
          email: supplier.email ?? supplier.emailAddress ?? '-',
          mobile: supplier.mobile ?? supplier.mobileNumber ?? supplier.phone ?? '-',
          city: supplier.city ?? supplier.address?.city ?? '-',
        })),
      );
      setTotalSuppliers(response?.data?.totalElements ?? normalizedSuppliers.length);
      setError('');
    } catch (err) {
      console.error('Failed to fetch suppliers:', err);
      setError('Unable to load suppliers right now.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleChangePage = async (event, newPage, rowsPerPageValue) => {
    try {
      const response = await api.get(`http://localhost:8080/suppliers?pageNumber=${newPage}&pageSize=${rowsPerPageValue}&sortBy=supplierName&sortOrder=asc`);
      const payload = response?.data?.content ?? [];
      const normalizedSuppliers = Array.isArray(payload) ? payload : [];
      setTotalSuppliers(response?.data?.totalElements ?? 0);
      setSuppliers(
        normalizedSuppliers.map((supplier) => ({
          ...supplier,
          supplierName: supplier.supplierName ?? supplier.name ?? 'Unknown Supplier',
          email: supplier.email ?? supplier.emailAddress ?? '-',
          mobile: supplier.mobile ?? supplier.mobileNumber ?? supplier.phone ?? '-',
          city: supplier.city ?? supplier.address?.city ?? '-',
        })),
      );
    } catch (err) {
      console.error('Failed to fetch suppliers:', err);
    }
    setPage(newPage);
  };

  const handleChangeRowsPerPage = async (event) => {
    setPage(0);
    setRowsPerPage(event.target.value);
    try {
      const response = await api.get(`http://localhost:8080/suppliers?pageNumber=0&pageSize=${event.target.value}&sortBy=supplierName&sortOrder=asc`);
      const payload = response?.data?.content ?? [];
      const normalizedSuppliers = Array.isArray(payload) ? payload : [];
      setTotalSuppliers(response?.data?.totalElements ?? 0);
      setSuppliers(
        normalizedSuppliers.map((supplier) => ({
          ...supplier,
          supplierName: supplier.supplierName ?? supplier.name ?? 'Unknown Supplier',
          email: supplier.email ?? supplier.emailAddress ?? '-',
          mobile: supplier.mobile ?? supplier.mobileNumber ?? supplier.phone ?? '-',
          city: supplier.city ?? supplier.address?.city ?? '-',
        })),
      );
    } catch (err) {
      console.error('Failed to fetch suppliers:', err);
    }
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    setSubmitError('');

    try {
      if (selectedSupplier) {
        const supplierId = selectedSupplier.supplierID;
        const response = await api.put(`/suppliers/${supplierId}`, {
          supplierName: data.supplierName,
          email: data.email,
          mobile: data.mobile,
          city: data.city,
        });

        const updatedSupplier = response?.data ?? {
          ...selectedSupplier,
          supplierName: data.supplierName,
          email: data.email,
          mobile: data.mobile,
          city: data.city,
        };

        setSuppliers((prev) =>
          prev.map((supplier) => {
            const id = supplier.supplierID;
            return id === supplierId ? { ...supplier, ...updatedSupplier } : supplier;
          }),
        );
        setSnackbarMessage('Supplier updated successfully.');
      } else {
        const response = await api.post('/suppliers', {
          supplierName: data.supplierName,
          email: data.email,
          mobile: data.mobile,
          city: data.city,
        });

        const newSupplier = response?.data ?? {
          supplierName: data.supplierName,
          email: data.email,
          mobile: data.mobile,
          city: data.city,
          itemID: undefined,
        };

        setSuppliers((prev) => [
          {
            ...newSupplier,
            supplierID: newSupplier.supplierID,
          },
          ...prev,
        ]);
        setTotalSuppliers((prevCount) => prevCount + 1);
        setSnackbarMessage('Supplier added successfully.');
      }

      setSnackbarOpen(true);
      setSelectedSupplier(null);
      setShowForm(false);
    } catch (err) {
      console.error('Failed to save supplier:', err);
      setSubmitError(selectedSupplier ? 'Unable to update the supplier. Please try again.' : 'Unable to add the supplier. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenForm = () => {
    setSelectedSupplier(null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewSupplier = (supplier) => {
    setSelectedSupplier(supplier);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCloseForm = () => {
    setSelectedSupplier(null);
    setShowForm(false);
    setSubmitError('');
  };

  const handleDeleteSupplier = async (supplier) => {
    const supplierId = supplier.supplierID;
    if (!supplierId) return;

    try {
      await api.delete(`/suppliers/${supplierId}`);
      setSuppliers((prev) => prev.filter((current) => {
        const id = current.supplierID;
        return id !== supplierId;
      }));
      setTotalSuppliers((prevCount) => Math.max(0, prevCount - 1));
      setSnackbarMessage('Supplier deleted successfully.');
      setSnackbarOpen(true);
    } catch (err) {
      console.error('Failed to delete supplier:', err);
      setError('Unable to delete the supplier. Please try again.');
    }
  };

  return (
    <>
      {showForm && (
        <AddSupplier
          onSubmit={onSubmit}
          submitting={submitting}
          submitError={submitError}
          onClose={handleCloseForm}
          selectedSupplier={selectedSupplier}
        />
      )}

      <ListingTemplate
        headers={supplierHeaders}
        rows={suppliers}
        count={totalSuppliers}
        pageName="Supplier"
        page={page}
        rowsPerPage={rowsPerPage}
        setRowsPerPage={setRowsPerPage}
        setPage={setPage}
        handleChangePage={handleChangePage}
        handleChangeRowsPerPage={handleChangeRowsPerPage}
        onAdd={handleOpenForm}
        onView={handleViewSupplier}
        onDelete={handleDeleteSupplier}
        pageName="Supplier"
        title="Suppliers"
        subtitle="Manage your supplier records and contact details."
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