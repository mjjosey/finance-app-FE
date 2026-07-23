import { Backdrop, CircularProgress, Table, TableContainer, TablePagination } from '@mui/material';
import Body from './body';
import Head from './head';
import { defaultRowsPerPageOptions } from '../../utils/common';
import { API, graphqlOperation } from 'aws-amplify';
import { useEffect, useRef, useState } from 'react';
import { showWarningSnackbar } from '../snackBar/snakbar';
function useDeepCompareEffect(callback, object) {
  const previousObjectRef = useRef(JSON.stringify({}));

  useEffect(() => {
    const currentObjectString = JSON.stringify(object);

    if (previousObjectRef.current !== currentObjectString) {
      callback();
      previousObjectRef.current = currentObjectString;
    }
  }, [object, callback]);
}

const Listing = ({
  storage,
  headData,
  bodyData,
  dayBook,
  showSearch,
  renderCell,
  count,
  includeOpeningBalance,
  startTimeStamp,
  endTimeStamp,
  maxAmounts,
  rowsPerPage,
  setRowsPerPage,
  page,
  setAccountID,
  accountid,
  setPage,
  queryCount,
  query,
  navigateLink,
  localStorageVar,
  setDataCount,
  queryCountName,
  countVariable,
  debo,
  setDebo,
  ordertype,
  queryName,
  queryParams,
  searchArr,
  setBodyData,
  onColumnNameChange,
}) => {
  const [searchValues, setSearchValues] = useState({});
  const [columnname, setcolumnName] = useState(queryParams);
  const [backdropOpen, setBackdropOpen] = useState(false);
  const [order, setOrder] = useState('asc');
  const prevIncludeOpeningBalanceRef = useRef(includeOpeningBalance);
  useEffect(() => {
    setSearchValues({});
  }, [startTimeStamp, endTimeStamp]);
  useEffect(() => {
    if (onColumnNameChange) {
      onColumnNameChange(columnname);
    }
  }, [columnname, onColumnNameChange]);

  const isEmptyObject = (obj) => {
    // Check if the object is empty or contains only empty values
    return (
      typeof obj === 'object' &&
      obj !== null &&
      !Array.isArray(obj) &&
      Object.keys(obj).length === 0
    );
  };
  const hasValidValues = (obj = {}) => {
    return Object.values(obj).some(
      (value) => value !== undefined && value !== null && value !== '',
    );
  };

  const hasOnlyEmptyValues = (obj) => {
    return Object.values(obj).every(
      (value) =>
        value === undefined ||
        value === null ||
        value === '' ||
        value === false ||
        value === 0 ||
        Number.isNaN(value) ||
        (typeof value === 'object' && hasValidValues(value)),
    );
  };
  const cleanObject = (obj) => {
    return Object.fromEntries(
      Object.entries(obj).filter(([key, value]) => {
        if (
          value === undefined ||
          value === null ||
          value === '' ||
          value === false ||
          value === 0 ||
          Number.isNaN(value) ||
          isEmptyObject(value) ||
          (typeof value === 'object' && hasOnlyEmptyValues(value))
        ) {
          return false; // Exclude this field
        }
        return true; // Include this field
      }),
    );
  };
  const cleanedData = searchArr ? cleanObject(searchArr) : '';
  const searchList = async () => {
    try {
      setBackdropOpen(true);

      let resActive = await API.graphql(
        graphqlOperation(query, {
          rowfrom: 0,
          limitno: Math.abs(rowsPerPage * 1),
          columnname: queryParams ? queryParams : 'enteredtimestamp',
          accountid,
          openingbalance: includeOpeningBalance === true ? 1 : 0,
          startdate: startTimeStamp,
          enddate: endTimeStamp,
          ordertype,
          searchmode: 1,
          searcharray: JSON.stringify([searchArr]),
        }),
      );
      let count = await API.graphql(
        graphqlOperation(queryCount, {
          columnname,
          ordertype,
          accountid,
          openingbalance: includeOpeningBalance === true ? 1 : 0,
          startdate: startTimeStamp,
          enddate: endTimeStamp,
          searchmode: 1,
          searcharray: JSON.stringify([searchArr]),
        }),
      );
      if (accountid && queryName !== 'listDayBookTransactionDetails') {
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
    } catch (err) {
      showWarningSnackbar('Invalid input');
    } finally {
      setBackdropOpen(false);
    }
  };

  useEffect(() => {
    if (prevIncludeOpeningBalanceRef.current !== includeOpeningBalance) {
      console.log(includeOpeningBalance, 'includeOpeningBalance');
      searchList();
      prevIncludeOpeningBalanceRef.current = includeOpeningBalance;
    }
  }, [includeOpeningBalance]);
  const cleanObj = isEmptyObject(cleanedData);
  useDeepCompareEffect(() => {
    searchList();
  }, searchArr);
  const handleChangePage = async (event, newPage) => {
    if (newPage > page) {
      if (bodyData.length !== count) {
        if (bodyData.length <= rowsPerPage * newPage) {
          setBackdropOpen(true);
          const rowfrom = bodyData.length;
          try {
            let resActive = await API.graphql(
              graphqlOperation(query, {
                rowfrom,
                limitno: rowsPerPage,
                columnname: columnname ? columnname : 'enteredtimestamp',
                accountid,
                startdate: startTimeStamp,
                enddate: endTimeStamp,
                openingbalance: includeOpeningBalance === true ? 1 : 0,
                ordertype: order,
                searchmode: Object.keys(searchArr).length === 0 ? 0 : 1,
                searcharray:
                  Object.keys(searchArr).length === 0 ? '[]' : JSON.stringify([searchArr]),
              }),
            );
            if (accountid) {
              setBodyData((prevItems) => {
                const existingIndex = prevItems.findIndex((item) => item.accountid === accountid);

                if (existingIndex !== -1) {
                  return prevItems.map((item, idx) =>
                    idx === existingIndex
                      ? {
                          ...item,
                          data: [...item.data, ...resActive.data[queryName]],
                        }
                      : item,
                  );
                } else {
                  return [
                    ...prevItems,
                    {
                      data: resActive.data[queryName],
                      accountid,
                      count: count.data[queryCountName][0][countVariable],
                      credit: count.data[queryCountName][0]?.totalcredit,
                      debit: count.data[queryCountName][0]?.totaldebit,
                      total: count.data[queryCountName][0]?.closingbalance,
                    },
                  ];
                }
              });
            } else {
              setBodyData((prev) => [...prev, ...resActive.data[queryName]]);
            }
          } catch (err) {
            console.log(err);
          } finally {
            setBackdropOpen(false);
          }
        }
      }
    }
    setPage(newPage);
  };
  const handleChangeRowsPerPage = async (event) => {
    setPage(0);
    setRowsPerPage(event.target.value);
    setBackdropOpen(true);
    const limitno = accountid ? event.target.value - 1 : event.target.value;
    let resActive = await API.graphql(
      graphqlOperation(query, {
        rowfrom: 0,
        limitno,
        columnname: columnname ? columnname : 'enteredtimestamp',
        accountid,
        startdate: startTimeStamp,
        enddate: endTimeStamp,
        openingbalance: includeOpeningBalance === true ? 1 : 0,
        ordertype: order,
        searchmode: Object.keys(searchArr).length === 0 ? 0 : 1,
        searcharray: Object.keys(searchArr).length === 0 ? '[]' : JSON.stringify([searchArr]),
      }),
    );
    if (accountid) {
      setBodyData((prevItems) => {
        const existingIndex = prevItems.findIndex((item) => item.accountid === accountid);

        if (existingIndex !== -1) {
          return prevItems.map((item, idx) =>
            idx === existingIndex
              ? {
                  ...item,
                  data: resActive.data[queryName],
                }
              : item,
          );
        } else {
          return [
            ...prevItems,
            {
              data: resActive.data[queryName],
              accountid,
              count: count.data[queryCountName][0][countVariable],
              credit: count.data[queryCountName][0]?.totalcredit,
              debit: count.data[queryCountName][0]?.totaldebit,
              total: count.data[queryCountName][0]?.closingbalance,
            },
          ];
        }
      });
    } else {
      setBodyData(resActive.data[queryName]);
    }
    setBackdropOpen(false);
  };
  return (
    <>
      <TableContainer
        className="custom-scrollbar"
        sx={{
          ...(dayBook
            ? {}
            : {
                height: {
                  sm: 'calc( 100vh - 280px )',
                  xs: 'calc( 100vh - 180px )',
                },
              }),
        }}
      >
        <Table stickyHeader aria-label="sticky table" sx={{ borderRadius: 2, color: 'black' }}>
          <Head
            searchValues={searchValues}
            setSearchValues={setSearchValues}
            data={headData}
            startdate={startTimeStamp}
            enddate={endTimeStamp}
            accountid={accountid}
            maxAmounts={maxAmounts}
            debo={debo}
            setPage={setPage}
            searchBool={showSearch}
            setDebo={setDebo}
            query={query}
            order={order}
            setcolumnName={setcolumnName}
            columnname={columnname}
            setOrder={setOrder}
            rowsPerPage={rowsPerPage}
            setDataCount={setDataCount}
            queryCount={queryCount}
            setBodyData={setBodyData}
            queryName={queryName}
            queryCountName={queryCountName}
            countVariable={countVariable}
          />
          <Body
            storage={storage}
            headData={headData}
            dayBook={dayBook}
            setAccountID={setAccountID}
            navigateLink={navigateLink}
            localStorageVar={localStorageVar}
            data={bodyData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)}
            columns={headData}
            renderCell={renderCell}
          />
        </Table>
      </TableContainer>
      {bodyData && bodyData.length > 1 && (
        <TablePagination
          align="right"
          rowsPerPageOptions={defaultRowsPerPageOptions}
          component="div"
          count={count}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      )}
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={backdropOpen}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      {/* // </Box> */}
    </>
  );
};

export default Listing;
