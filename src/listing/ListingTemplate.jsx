import React from 'react';
import {
  Box,
  Button,
  IconButton,
  Paper,
  Pagination,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TablePagination,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Stack,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useThemeMode } from '../ThemeProvider';
import api from '../api/axios';

export default function ListingTemplate({
  headers = [],
  pageName,
  page,
  setPage,
  rowsPerPage,
  setRowsPerPage,
  handleChangePage,
  handleChangeRowsPerPage,
  rows = [],
  onAdd,
  onView,
  onEdit,
  onDelete,
  count,
}) {
  const { mode, toggleThemeMode } = useThemeMode();
  const isDark = mode === 'dark';
  const surfaceColor = isDark ? '#121212' : '#ffffff';
  const borderColor = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)';
  const textColor = isDark ? '#ffffff' : '#111111';
  const mutedText = isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)';

  const defaultRowsPerPageOptions = [5, 15, 25, 50, 100];
  const defaultRowsPerPage = 5;

  const handleEdit = onEdit ?? onView;

  return (
    <Box sx={{ bgcolor: isDark ? '#0f172a' : '#f8fafc', borderRadius: 2 }}>
      <Paper elevation={1} sx={{ p: 2, bgcolor: surfaceColor, border: `1px solid ${borderColor}` }}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          justifyContent="space-between"
          alignItems="center"
          spacing={2}
        >
          <Stack direction="row" spacing={1} alignItems="center" sx={{ flex: 1, minWidth: 240 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={onAdd}
              sx={{
                textTransform: 'none',
                bgcolor: isDark ? '#90caf9' : '#1976d2',
                color: isDark ? '#0f172a' : '#ffffff',
                '&:hover': { bgcolor: isDark ? '#64b5f6' : '#1565c0' },
              }}
            >
              Add {pageName }
            </Button>
          </Stack>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Typography variant="body2" sx={{ color: mutedText }}>
              Total: {count} {pageName}
              {count !== 1 ? 's' : ''}
            </Typography>
          </Stack>
        </Stack>
      </Paper>

      <TableContainer
        component={Paper}
        elevation={1}
        sx={{ bgcolor: surfaceColor, border: `1px solid ${borderColor}` }}
      >
        <Table>
          <TableHead>
            <TableRow>
              {headers.map((header) => (
                <TableCell
                  key={header.key}
                  sx={{
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                    color: textColor,
                    borderColor,
                    width: header.width || 'auto',
                  }}
                >
                  {header.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, index) => (
              <TableRow
                key={
                  row?.receiptID ??
                  row?.paymentID ??
                  row?.purchaseID ??
                  row?.saleID ??
                  row?.salesID ??
                  row?.id ??
                  row?.supplierID ??
                  row?.customerID ??
                  row?.itemID ??
                  `${pageName}-${index}`
                }
                hover
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                {headers.map((header) => (
                  <TableCell key={header.key} sx={{ color: textColor, borderColor }}>
                    {header.key === 'actions' ? (
                      <Stack direction="row" spacing={1}>
                        <IconButton
                          size="small"
                          color={isDark ? 'secondary' : 'primary'}
                          onClick={() => handleEdit?.(row)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" color="error" onClick={() => onDelete?.(row)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    ) : (
                      (row[header.key] ?? '-')
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={defaultRowsPerPageOptions}
        component="div"
        count={count}
        page={page}
        setPage={setPage}
        rowsPerPage={rowsPerPage}
        onPageChange={(event, newPage) => handleChangePage(event, newPage, rowsPerPage)}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Box>
  );
}
