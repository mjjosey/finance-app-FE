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
  title = 'List Of Goods & Services',
  headers = [],
  elements = [],
  setElements = () => {},
  setCount,
  rows = [],
  onAdd,
  count ,
}) {
  const { mode, toggleThemeMode } = useThemeMode();
  const isDark = mode === 'dark';
  const surfaceColor = isDark ? '#121212' : '#ffffff';
  const borderColor = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)';
  const textColor = isDark ? '#ffffff' : '#111111';
  const mutedText = isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)';
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const safePage = Math.min(page, Math.max(0, count - 1));
  const visibleRows = rows.slice(safePage * rowsPerPage, safePage * rowsPerPage + rowsPerPage);
 const defaultRowsPerPageOptions = [5,15, 25, 50, 100];
 const defaultRowsPerPage = 5;
console.log(count,"count");

  const handleChangePage = async (event, newPage) => {
    console.log(newPage,"new page");
        try {
        const response = await api.get(`http://localhost:8080/items?pageNumber=${newPage}&pageSize=${rowsPerPage}&sortBy=itemName&sortOrder=asc`);
        console.log(response, 'response');
        
        const payload = response?.data?.content ??  [];
        const normalizedItems = Array.isArray(payload) ? payload : [];
        setCount(response?.data?.totalElements ?? 0);
        setElements(
          normalizedItems.map((item) => ({
            ...item,
            itemName: item.itemName,
            price: item.Price
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
        const response = await api.get(`http://localhost:8080/items?pageNumber=0&pageSize=${event.target.value}&sortBy=itemName&sortOrder=asc`);
        console.log(response, 'response');
        
        const payload = response?.data?.content ??  [];
        const normalizedItems = Array.isArray(payload) ? payload : [];
         setCount(response?.data?.totalElements ?? 0);
        setElements(
          normalizedItems.map((item) => ({
            ...item,
            itemName: item.itemName,
            price: item.Price
          })),
        );
      } catch (err) {
        console.error('Failed to fetch items:', err);
      } 
  };
  console.log(rows,"rrrrrrrrr");
  
  return (
    <Box sx={{ bgcolor: isDark ? '#0f172a' : '#f8fafc',  borderRadius: 2 }}>

      <Paper elevation={1} sx={{ p: 2, bgcolor: surfaceColor, border: `1px solid ${borderColor}` }}>
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems="center" spacing={2}>
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
              Add Item
            </Button>
          </Stack>
          <Stack direction="row" spacing={1}  sx={{alignItems:"center"}}>
            <Typography variant="body2" sx={{ color: mutedText }}>
              Total: {count} Items
            </Typography>
          </Stack>
        </Stack>
      </Paper>

      <TableContainer component={Paper} elevation={1} sx={{ bgcolor: surfaceColor, border: `1px solid ${borderColor}` }}>
        <Table>
          <TableHead>
            <TableRow>
              {headers.map((header) => (
                <TableCell key={header.key} sx={{ fontWeight: 700, whiteSpace: 'nowrap', color: textColor, borderColor,width: header.width || 'auto'     }}>
                  {header.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row?.itemID} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                {headers.map((header) => (
                  <TableCell key={header.key} sx={{ color: textColor, borderColor }}>
                    {header.key === 'actions' ? (
                      <Stack direction="row" spacing={1}>
                        <IconButton size="small" color={isDark ? 'secondary' : 'primary'}>
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" color={isDark ? 'secondary' : 'info'}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" color="error">
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    ) : (
                      row[header.key] ?? '-'
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems="center"
        spacing={2}
        sx={{ mt: 2 }}
      >
        <Typography variant="body2" sx={{ color: mutedText }}>
          Showing {rows.length === 0 ? 0 : safePage * rowsPerPage + 1} - {Math.min((safePage + 1) * rowsPerPage, rows.length)} of {rows.length}
        </Typography>
        <Pagination
          count={pageCount}
          page={safePage}
          onChange={(_, value) => setPage(value - 1)}
          color={isDark ? 'secondary' : 'primary'}
          shape="rounded"
        />
   
      </Stack> */}
           <TablePagination
          rowsPerPageOptions={defaultRowsPerPageOptions}
           component="div"
  count={count}
  page={page}
  rowsPerPage={rowsPerPage}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        /> 
    </Box>
  );
}
