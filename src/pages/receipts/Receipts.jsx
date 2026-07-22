import { useEffect, useState } from 'react';
import { Alert } from '@mui/material';
import PageTemplate from '../PageTemplate';
import ListingTemplate from '../../listing/ListingTemplate';
import { receiptHeaders } from '../../constants';
import AddReceipt from './addReceipt';
import axios from '../../api/axios';

export default function Receipts() {
  const [receipts, setReceipts] = useState([]);
  const [saleOptions, setSaleOptions] = useState([]);
  const [customerOptions, setCustomerOptions] = useState([]);
  const [totalReceipts, setTotalReceipts] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [refreshKey, setRefreshKey] = useState(0);

  const normalizeReceipt = (receipt) => ({
    ...receipt,
    receiptID: receipt.receiptID ?? receipt.id ?? receipt.receiptId,
    salesID: receipt.sale?.salesID ?? receipt.salesID ?? receipt.sale?.id ?? receipt.saleId,
    customerID: receipt.customer?.customerID ?? receipt.customerID ?? receipt.customer?.id ?? receipt.customerId,
    saleNumber:
       receipt.sales?.invoiceNumber
      ?? '-',
    customerName:
      receipt.customerName
      ?? receipt.customer?.customerName
      ?? customerOptions.find((option) => option.customerID === (receipt.customer?.customerID ?? receipt.customerID ?? receipt.customer?.id ?? receipt.customerId))?.customerName
      ?? '-',
    amount: receipt.amount ?? receipt.Amount ?? '-',
    receiptDate: receipt.receiptDate ?? receipt.date ?? '-',
  });

  const fetchReceipts = async (pageNumber = 0, pageSize = rowsPerPage) => {
    try {
      setLoading(true);
      const response = await axios.get(`/receipts?pageNumber=${pageNumber}&pageSize=${pageSize}`);
      const payload = response?.data?.content ?? [];
      const normalizedReceipts = Array.isArray(payload) ? payload : [];
      setReceipts(normalizedReceipts.map(normalizeReceipt));
      setTotalReceipts(response?.data?.totalElements ?? normalizedReceipts.length);
      setError('');
    } catch (err) {
      console.error('Failed to fetch receipts:', err);
      setError('Unable to load receipts right now.');
    } finally {
      setLoading(false);
    }
  };

  const fetchReceiptFormOptions = async () => {
    try {
      const customerRes = await axios.get('/customers?pageNumber=0&pageSize=200&sortBy=customerName&sortOrder=asc');

      const salePayload = saleRes?.data?.content ?? [];
      const customerPayload = customerRes?.data?.content ?? [];


      setCustomerOptions(
        (Array.isArray(customerPayload) ? customerPayload : [])
          .map((item) => ({
            customerID: item.customerID ?? item.id,
            customerName: item.customerName ?? item.name,
          }))
          .filter((item) => item.customerID),
      );
    } catch (err) {
      console.error('Failed to fetch receipt dropdown options:', err);
    }
  };

  useEffect(() => {
    fetchReceiptFormOptions();
    fetchReceipts(0, rowsPerPage);
  }, []);

 

  useEffect(() => {
    if (!refreshKey) return;
    fetchReceipts(page, rowsPerPage);
  }, [refreshKey]);

  const handleChangePage = async (event, newPage, rowsPerPageValue) => {
    await fetchReceipts(newPage, rowsPerPageValue);
    setPage(newPage);
  };

  const handleChangeRowsPerPage = async (event) => {
    const nextRowsPerPage = Number(event.target.value);
    setPage(0);
    setRowsPerPage(nextRowsPerPage);
    await fetchReceipts(0, nextRowsPerPage);
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
      await axios.delete(`/receipts/${record.receiptID}`);
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      console.error('Failed to delete receipt:', err);
      setError('Unable to delete the receipt. Please try again.');
    }
  };
console.log(selectedRecord,"selectedRecord");

  return (
    <>
      {showForm ? (
        <AddReceipt
          open={showForm}
          onClose={handleCloseForm}
          selectedRecord={selectedRecord}
          onSaved={() => setRefreshKey((prev) => prev + 1)}
        />
      ) : null}

      <ListingTemplate
        title="Receipts"
        pageName="Receipt"
        rows={receipts}
        headers={receiptHeaders}
        count={totalReceipts}
        page={page}
        rowsPerPage={rowsPerPage}
        setRowsPerPage={setRowsPerPage}
        setPage={setPage}
        handleChangePage={handleChangePage}
        handleChangeRowsPerPage={handleChangeRowsPerPage}
        onAdd={handleCreate}
        onEdit={handleEdit}
        onDelete={handleDelete}
        addButtonLabel="Add Receipt"
      />
    </>
  );
}
