import {
  Autocomplete,
  Backdrop,
  Box,
  CircularProgress,
  IconButton,
  InputBase,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  Slider,
  Stack,
  Table,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TextField,
  Typography,
} from '@mui/material';
import NorthIcon from '@mui/icons-material/North';
import SouthIcon from '@mui/icons-material/South';
import SearchIcon from '@mui/icons-material/Search';
import { useEffect, useRef, useState } from 'react';
import EWayCustomDate from '../Date/eWayCustomDate';
import MoneyRanger from '../formElements/MoneyRanger';
import { Clear } from '@mui/icons-material';
import CustomDate from '../Date/CustomDate';
import dayjs from 'dayjs';
import { showWarningSnackbar } from '../snackBar/snakbar';
import { ClearIcon } from '@mui/x-date-pickers';
import { API, graphqlOperation } from 'aws-amplify';
import { useThemes } from '../Theme/theme';
import { DateRangeRsuite, MoneyTextFieldRange } from '../_components';
const Head = ({
  data,
  maxAmounts,
  searchValues,
  debo,
  // bodyData,
  query,
  columnname,
  startdate,
  enddate,
  setcolumnName,
  countVariable,
  queryCountName,
  setBodyData,
  rowsPerPage,
  queryName,
  order,
  accountid,
  setOrder,
  setDataCount,
  queryCount,
  searchBool,
  setPage,
  setDebo,
  setSearchValues,
}) => {
  // const [showSearch, setShowSearch] = useState(false);
  const [backdropOpen, setBackdropOpen] = useState(false);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  console.log(debo, 'debo');
  const { theme } = useThemes();
  const useDebouncedUpdate = (value, delay, callback) => {
    const timeoutRef = useRef(null);
    // useEffect(() => {
    //   if (searchBool === false) {
    //     setShowSearch(false);
    //   }
    // }, [searchBool]);
    console.log(typeof setDataCount, 'typeof setDataCount'); // should be "function"

    useEffect(() => {
      // Clear previous timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      // Set new timeout to update after delay
      timeoutRef.current = setTimeout(() => {
        callback(value);
      }, delay);

      // Cleanup on unmount or value change
      return () => clearTimeout(timeoutRef.current);
    }, [value, delay, callback]);
  };
  // useEffect(() => {
  //   if (to) {
  //     if (from < to) {
  //       setSearchValues((prev) => ({
  //         ...prev,
  //         [field.field]: { from, to },
  //       }));
  //     } else {
  //       showWarningSnackbar('Please provide valid dates');
  //     }
  //   }
  // }, [to]);
  useDebouncedUpdate(searchValues, 500, setDebo);
  const handleChange = (field, value, name) => {
    console.log(field, 'filed');
    if (name.inputType === 'number') {
      const numberRegex = /^\d+$/;

      if (numberRegex.test(value)) {
        setSearchValues((prev) => ({ ...prev, [field]: value }));
      } else {
        showWarningSnackbar('Please provide only numbers');
        setSearchValues((prev) => ({ ...prev, [field]: '' }));
      }
    } else {
      setSearchValues((prev) => ({ ...prev, [field]: value }));
    }
  };
  console.log(from, 'frommmmm');
  useEffect(() => {}, [searchValues]);
  const renderSearchField = (field) => {
    switch (field.type) {
      case 'text':
        return (
          <Paper
            sx={{
              p: '2px 4px',
              display: 'flex',
              alignItems: 'center',
              width: '100%',
            }}
          >
            <InputBase
              value={searchValues[field.field] || ''}
              onChange={(e) => handleChange(field.field, e.target.value, field)}
              sx={{ flex: 1 }}
              placeholder="Search"
              autoComplete="off"
            />
            <IconButton type="button" sx={{ p: '0px' }}>
              {searchValues[field.field] && searchValues[field.field] !== '' ? (
                <Clear
                  fontSize="small"
                  onClick={() => {
                    setSearchValues((prev) => ({
                      ...prev,
                      [field.field]: '',
                    }));
                    // setFilteredList(invoiceRows);
                  }}
                />
              ) : (
                <SearchIcon fontSize="small" />
              )}
            </IconButton>
          </Paper>
          // <TextField
          //   size="small"
          //   placeholder="Search"
          //   value={searchValues[field.field] || ""}
          //   onChange={(e) => handleChange(field.field, e.target.value)}
          // />
        );

      case 'slider':
        const maxAmount = maxAmounts?.[field?.field];
        return (
          <Paper
            sx={{
              p: '2px 4px',

              width: '100%',
            }}
          >
            <Stack direction={'row'} height={'32px'} gap="5px" className="noTableCellBorder">
              {/* <MoneyRanger
                min={searchValues[field.field]?.min || 0}
                max={searchValues[field.field]?.max}
                maxValue={0}
                onChange={(e) => {
                  console.log(e, 'eeeeeeeee');
                  // handleChange(e, field.field, e);
                  // setMin(e[0]);
                  // setMax(e[1]);
                  // if (e[0] || e[1]) {
                  setSearchValues((prev) => ({
                    ...prev,
                    [field.field]: { min: e[0], max: e[1] },
                  }));
                  // }
                }}
              /> */}
              <MoneyTextFieldRange
                value={[searchValues[field.field]?.min, searchValues[field.field]?.max]}
                onChange={(e) => {
                  setSearchValues((prev) => ({
                    ...prev,
                    [field.field]: { min: e[0], max: e[1] },
                  }));
                }}
              />

              <IconButton type="button" sx={{ p: '0px' }}>
                {searchValues[field.field] && searchValues[field.field]?.min !== '' ? (
                  <Clear
                    fontSize="small"
                    onClick={() => {
                      setSearchValues((prev) => ({
                        ...prev,
                        [field.field]: {
                          min: '',
                          max: '',
                        },
                      }));
                      // setMin(0);
                      // setFilteredList(invoiceRows);
                    }}
                  />
                ) : (
                  <SearchIcon fontSize="small" />
                )}
              </IconButton>
            </Stack>
          </Paper>
        );
      case 'date':
        console.log(field, 'field');
        return (
          <Paper
            sx={{
              p: '2px 4px',
              display: 'flex',
              alignItems: 'center',
              width: '100%',
            }}
          >
            {/* <InputBase
    name="supplierInvoiceDate"
    value={filterColumns.supplierInvoiceDate}
    onChange={(e) =>
      handleFilterBySearch(e, "SupplierInvoiceDate")
    }
    sx={{ flex: 1 }}
    placeholder="Search"
    autoComplete="off"
  /> */}
            {/* <EWayCustomDate
              value={[from ? dayjs.unix(from) : null, to ? dayjs.unix(to) : null]}
              onChange={(e, f) => {
                console.log(e, f, 'hhhhbbbb');
                setFrom(e.from ? e.from : '');
                setTo(e.to ? e.to : '');
                if (e.from && e.to) {
                  if (e.from < e.to) {
                    setSearchValues((prev) => ({
                      ...prev,
                      [field.field]: { from: e.from, to: e.to },
                    }));
                  }
                }
              }}
            /> */}
            <DateRangeRsuite
              value={[searchValues[field.field]?.from ? searchValues[field.field]?.from : null, searchValues[field.field]?.to]} // tuple in ms
              ranges={[]}
              restrictToFinancialYear={true}
              onChange={(e) => {
                setFrom(e.from ? e.from : null);
                setTo(e.to ? e.to : null);
                if (e.to) {
                  setSearchValues((prev) => ({
                    ...prev,
                    [field.field]: { from: e.from, to: e.to },
                  }));
                } else {
                  setSearchValues((prev) => ({
                    ...prev,
                    [field.field]: { from: '', to: '' },
                  }));
                }
              }}
              // onOk={() => {
              //   setAnchorEl(null);
              // }}
            />
            {/* <IconButton type="button" sx={{ p: '0px' }}>
              {searchValues[field.field] && (searchValues[field.field]?.from !== '' || searchValues[field.field]?.to != '') ? (
                <Clear
                  fontSize="small"
                  onClick={() => {
                    console.log(searchValues, 'searchValues');
                    setSearchValues((prev) => ({
                      ...prev,
                      [field.field]: {
                        from: '',
                        to: '',
                      },
                    }));
                    setFrom('');
                    setTo('');
                    // setFilteredList(rows);
                  }}
                />
              ) : (
                <SearchIcon fontSize="small" />
              )}
            </IconButton> */}
          </Paper>
          // <EWayCustomDate
          //   // value={[from ? dayjs.unix(from) : null, to ? dayjs.unix(to) : null]}
          //   onChange={(e) => {
          //     setSearchValues((prev) => ({
          //       ...prev,
          //       [field.field]: { from: e.from, to: e.to },
          //     }));
          //   }}
          // />
        );
      case 'select':
        return (
          <Paper
            sx={{
              p: '2px 4px',
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              border: 'none',
            }}
          >
            <Autocomplete
              id={''}
              disableClearable
              options={field.options}
              isOptionEqualToValue={(option, value) => option == value}
              clearIcon={searchValues[field.field] && searchValues[field.field] !== '' ? <ClearIcon style={{ fontSize: '20px' }} /> : null}
              value={searchValues[field.field] || ''}
              onChange={(e, value) =>
                setSearchValues((prev) => ({
                  ...prev,
                  [field.field]: value,
                }))
              }
              size="small"
              sx={{ height: '32px' }}
              renderOption={(props, option) => (
                <>
                  <MenuItem {...props} key={option.value} value={option.value}>
                    <ListItemText primary={option.label} />
                  </MenuItem>
                </>
              )}
              renderInput={(params) => (
                <TextField
                  sx={{
                    minWidth: '150px',

                    border: 'none', // Ensure border is removed
                    '& .MuiInput-underline:before': {
                      borderBottom: 'none', // Remove underline in standard variant
                    },
                    '& .MuiInput-underline:hover:not(.Mui-disabled):before': {
                      borderBottom: 'none', // Remove hover effect
                    },
                    '& .MuiInput-underline:after': {
                      borderBottom: 'none', // Remove underline for focused state
                    },
                    '& fieldset': { border: 'none' },
                  }}
                  placeholder={'Search'}
                  variant="standard"
                  InputLabelProps={{
                    shrink: true,
                    style: { color: 'black' },
                  }}
                  {...params}
                />
              )}
            />

            <IconButton type="button" sx={{ p: '0px' }}>
              {searchValues[field.field] && searchValues[field.field] !== '' ? (
                <Clear
                  fontSize="small"
                  onClick={() => {
                    setSearchValues((prev) => ({
                      ...prev,
                      [field.field]: '',
                    }));
                    // setFilteredList(invoiceRows);
                  }}
                />
              ) : (
                <SearchIcon fontSize="small" />
              )}
            </IconButton>
          </Paper>
          // <>
          //   <Autocomplete
          //     disableClearable
          //     options={field.options}
          //     isOptionEqualToValue={(option, value) => option == value}
          //     // value={filterColumns.Status}
          //     onChange={(e, value) => {
          //       console.log(value, e.target.value, "vvvvv");
          //       setSearchValues((prev) => ({
          //         ...prev,
          //         [field.field]: value,
          //       }));
          //       // handleFilterBySearch(e, "Status", value)
          //     }}
          //     size="small"
          //     sx={{ height: "32px" }}
          //     renderOption={(props, option) => (
          //       <>
          //         <MenuItem {...props} key={option.value} value={option.value}>
          //           <ListItemText primary={option.label} />
          //         </MenuItem>
          //       </>
          //     )}
          //     renderInput={(params) => (
          //       <TextField
          //         placeholder={"Search"}
          //         InputLabelProps={{
          //           shrink: true,
          //           style: { color: "black" },
          //         }}
          //         {...params}
          //       />
          //     )}
          //   />
          // </>
          // <Select
          //   size="small"
          //   value={searchValues[field.field] || ""}
          //   onChange={(e) => handleChange(field.field, e.target.value)}
          //   displayEmpty
          //   fullWidth

          // >
          //   <MenuItem value="">Select</MenuItem>
          //   {field.options.map((option, index) => (
          //     <MenuItem key={index} value={option.value}>
          //       {option.label}
          //       {console.log(option, "option")}
          //     </MenuItem>
          //   ))}
          // </Select>
        );

      case 'button':
        return (
          <IconButton onClick={() => console.log('Search:', searchValues)}>
            <SearchIcon fontSize="small" />
          </IconButton>
        );

      default:
        return null;
    }
  };

  const searchList = async (queryParams, ordertype) => {
    setBackdropOpen(true);
    let resActive = await API.graphql(
      graphqlOperation(query, {
        rowfrom: 0,
        limitno: Math.abs(rowsPerPage * 1),
        columnname: queryParams,
        ordertype,
        startdate,
        enddate,
        accountid,
        searchmode: 0,
        searcharray: '[]',
      })
    );
    console.log(resActive, 'resActive');
    let count = await API.graphql(
      graphqlOperation(queryCount, {
        columnname: queryParams,
        accountid,
        startdate,
        enddate,
        ordertype,
        searchmode: 0,
        searcharray: '[]',
      })
    );
    if (accountid) {
      setBodyData((prevItems) => {
        const existingIndex = prevItems.findIndex((item) => item.accountid === accountid);

        const newItem = {
          data: resActive.data[queryName],
          accountid,
          count: count.data[queryCountName][0][countVariable],
          credit: count.data[queryCountName][0]?.totalcredit,
          debit: count.data[queryCountName][0]?.totaldebit,
          total: count.data[queryCountName][0]?.closingbalance,
        };

        if (existingIndex !== -1) {
          // Update existing item
          const updatedItems = [...prevItems];
          updatedItems[existingIndex] = newItem;
          return updatedItems;
        } else {
          // Add new item
          return [...prevItems, newItem];
        }
      });
    } else {
      setBodyData(resActive.data[queryName]);
      setDataCount(count.data[queryCountName][0][countVariable]);
    }
    // setBodyData(resActive.data[queryName]);
    // setDataCount(count.data[queryCountName][0][countVariable]);
    setBackdropOpen(false);
  };
  // console.log(bodyData, 'bodyData');
  console.log(data, 'fffffffffffffff');

  return (
    <TableHead key={accountid}>
      <TableRow
        // sx={{
        //   '.MuiTableCell-root:focus-within': {
        //     backgroundColor: 'primary.main',
        //   },
        //   height: '35px',
        // }}
        sx={{
          '.MuiTableCell-root': {
            backgroundColor: `${theme.palette.background.tablebg} !important`,
            fontSize: '13px',
            padding: '0px',
            '& .MuiCheckbox-root': {
              padding: '4px',
            },
          },
          '.MuiTableCell-head': {
            backgroundColor: 'background.tablebg',
            padding: '2px 10px',
            borderBottom: '0px',
          },
          height: '35px',
        }}
        className="noTableCellBorder"
      >
        {data.map((data, i) => (
          <TableCell
            align={data.align}
            sx={{
              cursor: 'pointer',
              backgroundColor: 'primary.main',
              minWidth: data.width,
              // padding: '3px',
              paddingLeft: i === 0 ? '20px' : '0px',
              paddingRight: data.length - 1 === i ? '20px' : '0px',
              '& th .MuiBox-root': {
                display: 'flex',
                justifyContent: 'flex-end' /* Aligns text and button to the right */,
                alignItems: 'center',
              },
              '.MuiTableCell-head': {
                backgroundColor: 'primary.main',
                padding: i === 0 || data.length - 1 === i ? '15px' : '2px',
                borderBottom: '0px',
              },
              '.MuiTableCell-root': {
                backgroundColor: 'primary.main',
                fontSize: '14px',
                padding: i === 0 || data.length - 1 === i ? '15px' : '2px',
                color: 'white',
                // '& .MuiCheckbox-root': {
                //   padding: '4px',
                // },
              },
            }}
            className="noTableCellBorder"
          >
            {data.enableSort === true ? (
              <TableSortLabel
                direction={order}
                sx={{ fontWeight: 'bold' }}
                align={data.align}
                onClick={() => {
                  console.log(data, 'datavvvvv');
                  // console.log(bodyData, 'bodyDatahhhh');

                  setPage(0);
                  if (order === 'asc') {
                    setOrder('desc');
                    searchList(data.field, 'desc');
                  } else {
                    setOrder('asc');
                    searchList(data.field, 'asc');
                  }
                  // if (queryName !== 'listDayBookTransactionDetails') {
                  //   setcolumnName(bodyData[1][data.field]);
                  // } else {
                  // debugger;
                  setcolumnName(data.field);
                  // }
                }}
                // onMouseEnter={() => setLabelEnter(data.field)}
                // onMouseLeave={() => setLabelEnter(null)}
              >
                {data.label}
              </TableSortLabel>
            ) : (
              <span sx={{ fontWeight: 'bold' }}>{data.label}</span>
            )}
            {/* <Box
              sx={{
                display: 'flex',
                color: labelEnter === data.field && 'secondary.main',
                fontFamily: 'Milliard Book',
                backgroundColor: 'primary.main',
                fontWeight: 700,
                lineHeight: 1,
              }}
            >
              <Typography align={data.align} onMouseEnter={() => setLabelEnter(data.field)} onMouseLeave={() => setLabelEnter(null)}>
                {data.label}
              </Typography>
              {/* {searchBool && data.type && (
                <IconButton
                  sx={{
                    padding: '0px',
                    marginLeft: '3px',
                    color: labelEnter === data.field ? 'secondary.main' : 'white',
                  }}
                >
                  <SearchIcon
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      // setShowSearch((prev) => !prev);
                    }}
                    sx={{ cursor: 'pointer' }}
                    fontSize="small"
                  />
                </IconButton>
              )} 
              {searchBool && labelEnter === data.field && data.enableSort === true ? (
                <IconButton
                  sx={{
                    padding: '0px',
                    marginLeft: '3px',
                    color: labelEnter === data.field ? 'secondary.main' : 'white',
                  }}
                >
                  {order === 'asc' ? <NorthIcon fontSize="small" /> : <SouthIcon fontSize="small" />}
                </IconButton>
              ) : (
                <IconButton sx={{ padding: '0px', visibility: 'hidden' }}>
                  {' '}
                  <NorthIcon fontSize="3px" />
                </IconButton>
              )}
            </Box> */}
          </TableCell>
        ))}
      </TableRow>
      {searchBool && (
        <TableRow
          className="noTableCellBorder"
          sx={{
            '.MuiTableCell-root': {
              backgroundColor: 'transparent ',
              padding: '8px 15px',
            },
            '.css-wrnu0i-MuiInputBase-root': {
              fontSize: '13px',
            },
            '.css-xk0adg-MuiButtonBase-root-MuiIconButton-root': {
              padding: '2px 4px',
            },
            '.css-1gqfvv-MuiPaper-root': {
              boxShadow: 'none',
              borderBottom: 'solid 1px rgba(0,0,0,0.24)',
              borderRadius: '0px',
            },
          }}
        >
          {data.map((col, index) => (
            <TableCell
              key={index}
              align="center"
              sx={{
                // minWidth: col.width,
                // maxWidth: '400px',
                padding: '2px',
              }}
            >
              {renderSearchField(col)}
            </TableCell>
          ))}
        </TableRow>
      )}
      <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={backdropOpen}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </TableHead>
  );
};

export default Head;
