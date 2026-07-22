import { useEffect, useState } from 'react';
import { Alert } from '@mui/material';
import PageTemplate from '../PageTemplate';
import ListingTemplate from '../../listing/ListingTemplate';
import { paymentHeaders } from '../../constants';
import AddPayment from './addPayment';
import axios from '../../api/axios';

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [purchaseOptions, setPurchaseOptions] = useState([]);
  const [supplierOptions, setSupplierOptions] = useState([]);
  const [totalPayments, setTotalPayments] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [refreshKey, setRefreshKey] = useState(0);

  const normalizePayment = (payment) => ({
    ...payment,
    paymentID: payment.paymentID ?? payment.id ?? payment.paymentId,
    purchaseID: payment.purchase?.purchaseID ?? payment.purchaseID ?? payment.purchase?.id ?? payment.purchaseId,
    supplierID: payment.supplier?.supplierID ?? payment.supplierID ?? payment.supplier?.id ?? payment.supplierId,
    purchaseName:
      payment.purchaseName
      ?? payment.purchase?.invoiceNumber
      ?? purchaseOptions.find((option) => option.purchaseID === (payment.purchase?.purchaseID ?? payment.purchaseID ?? payment.purchase?.id ?? payment.purchaseId))?.invoiceNumber
      ?? '-',
    supplierName:
      payment.supplierName
      ?? payment.supplier?.supplierName
      ?? supplierOptions.find((option) => option.supplierID === (payment.supplier?.supplierID ?? payment.supplierID ?? payment.supplier?.id ?? payment.supplierId))?.supplierName
      ?? '-',
    amount: payment.amount ?? payment.Amount ?? '-',
    paymentDate: payment.paymentDate ?? payment.date ?? '-',
  });

  const fetchPayments = async (pageNumber = 0, pageSize = rowsPerPage) => {
    try {
      setLoading(true);
      const response = await axios.get(`/payments?pageNumber=${pageNumber}&pageSize=${pageSize}`);
      const payload = response?.data?.content ?? [];
      const normalizedPayments = Array.isArray(payload) ? payload : [];
      setPayments(normalizedPayments.map(normalizePayment));
      setTotalPayments(response?.data?.totalElements ?? normalizedPayments.length);
      setError('');
    } catch (err) {
      console.error('Failed to fetch payments:', err);
      setError('Unable to load payments right now.');
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentFormOptions = async () => {
    try {
      const [purchaseRes, supplierRes] = await Promise.all([
        axios.get('/purchases?pageNumber=0&pageSize=200&sortBy=invoiceNumber&sortOrder=asc'),
        axios.get('/suppliers?pageNumber=0&pageSize=200&sortBy=supplierName&sortOrder=asc'),
      ]);

      const purchasePayload = purchaseRes?.data?.content ?? [];
      const supplierPayload = supplierRes?.data?.content ?? [];

      setPurchaseOptions(
        (Array.isArray(purchasePayload) ? purchasePayload : [])
          .map((item) => ({
            purchaseID: item.purchaseID ?? item.id,
            invoiceNumber: item.invoiceNumber ?? item.invoiceNo ?? item.invoice ?? `Purchase #${item.purchaseID ?? item.id}`,
          }))
          .filter((item) => item.purchaseID),
      );

      setSupplierOptions(
        (Array.isArray(supplierPayload) ? supplierPayload : [])
          .map((item) => ({
            supplierID: item.supplierID ?? item.id,
            supplierName: item.supplierName ?? item.name,
          }))
          .filter((item) => item.supplierID),
      );
    } catch (err) {
      console.error('Failed to fetch payment dropdown options:', err);
    }
  };

  useEffect(() => {
    fetchPaymentFormOptions();
    fetchPayments(0, rowsPerPage);
  }, []);

  useEffect(() => {
    setPayments((prevPayments) => prevPayments.map(normalizePayment));
  }, [purchaseOptions, supplierOptions]);

  useEffect(() => {
    if (!refreshKey) return;
    fetchPayments(page, rowsPerPage);
  }, [refreshKey]);

  const handleChangePage = async (event, newPage, rowsPerPageValue) => {
    await fetchPayments(newPage, rowsPerPageValue);
    setPage(newPage);
  };

  const handleChangeRowsPerPage = async (event) => {
    const nextRowsPerPage = Number(event.target.value);
    setPage(0);
    setRowsPerPage(nextRowsPerPage);
    await fetchPayments(0, nextRowsPerPage);
  };

  const handleCreate = () => {
    setSelectedRecord(null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEdit = (record) => {
    setSelectedRecord(record);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCloseForm = () => {
    setSelectedRecord(null);
    setShowForm(false);
  };

  const handleDelete = async (record) => {
    try {
      await axios.delete(`/payments/${record.paymentID}`);
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      console.error('Failed to delete payment:', err);
      setError('Unable to delete the payment. Please try again.');
    }
  };

  return (
    <>
      {showForm ? (
        <AddPayment
          open={showForm}
          onClose={handleCloseForm}
          selectedRecord={selectedRecord}
          onSaved={() => setRefreshKey((prev) => prev + 1)}
        />
      ) : null}

      <ListingTemplate
        title="Payments"
        pageName="Payment"
        rows={payments}
        headers={paymentHeaders}
        count={totalPayments}
        page={page}
        rowsPerPage={rowsPerPage}
        setRowsPerPage={setRowsPerPage}
        setPage={setPage}
        handleChangePage={handleChangePage}
        handleChangeRowsPerPage={handleChangeRowsPerPage}
        onAdd={handleCreate}
        onEdit={handleEdit}
        onDelete={handleDelete}
        addButtonLabel="Add Payment"
      />
    </>
  );
}
