import { TableBody, TableRow, Tooltip, Typography } from '@mui/material';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import { TRANSACTION_CONFIG, formatNumber } from '../../utils/common';
import { useDispatch } from 'react-redux';
import { memo, useCallback } from 'react';
import { CustomTableCell } from '../../pages/LedgerTransaction/styles';
import { updateTitle } from '../../redux/reducers/titleSlice';
import { TableCell } from '../../components/Table/TableCell';
import { formatUnixTimestamp } from '../../library';

const ROW_HEIGHT = 48; // your normal row height
const MIN_ROWS = 3; // keep space for at least 3 rows

const CustomTableCellRedirectToVoucher = memo(({ data, type, children, inAct }) => {
  const dispatch = useDispatch();
  const config = TRANSACTION_CONFIG[type] || {
    path: '',
    getTransactionId: () => '',
  };
  const { path, getTransactionId } = config;
  const link = path ? `/${path}/${data.vouchernumber}?transaction=${data.voucherid}` : '';
  const handleClick = useCallback(
    (e) => {
      // dispatch(
      //     updateTitle(data.vouchernumber)
      // );
      e.preventDefault();
      if (path) {
        window.open(link);
        dispatch(updateTitle(data.vouchernumber));
      }
    },
    [path, link]
  );

  return (
    <CustomTableCell>
      <Typography sx={{ fontSize: '13px' }}>
        <a
          className="myLink"
          href={link}
          onClick={handleClick}
          style={{ opacity: data.cancelflag === 1 ? 0.3 : 1, color: data.cancelflag === 1 && 'black' }}
        >
          {children}
        </a>
      </Typography>
    </CustomTableCell>
  );
});
const Body = ({ data, navigateLink, setAccountID, storage, columns, localStorageVar, dayBook, renderCell, headData }) => {
  const navigate = useNavigate();
  return (
    <>
      {dayBook ? (
        data && data.length > 0 && data[0]?.transactiontype !== 'OpeningBalance' ? (
          Object.entries(data).map(([acc, itmm], i) => (
            <TableBody
              sx={{
                '& .MuiTableCell-root': {
                  border: 'none',
                  padding: '0px 10px',
                },
              }}
            >
              {itmm[1].map((itm, index, arr) => {
                const isInactive = itm.cancelflag === 1;
                const fontSize = '13px';
                return (
                  <TableRow
                    sx={{
                      '&:hover': {
                        backgroundColor: '#E6CED7',
                      },

                      '& .MuiTableCell-root': {
                        border: 'none',
                        padding: '0px 10px',
                      },
                    }}
                  >
                    <TableCell
                      align="left"
                      size="small"
                      title={isInactive ? 'Cancelled' : ''}
                      sx={{
                        // maxWidth: "50px",
                        color: 'black',
                        whiteSpace: 'nowrap',
                        borderBottom: index === arr.length - 1 ? '3px solid black!important' : '',
                      }}
                    >
                      <Typography sx={{ opacity: isInactive ? 0.3 : 1, fontSize: fontSize }}>
                        {index === 0 ? formatUnixTimestamp(itm.enteredtimestamp) : ''}
                      </Typography>
                    </TableCell>
                    <TableCell
                      align="left"
                      size="small"
                      title={isInactive ? 'Cancelled' : ''}
                      sx={{
                        whiteSpace: 'nowrap',
                        padding: '4px 1px !important',
                        borderBottom: index === arr.length - 1 ? '3px solid black!important' : '',
                      }}
                    >
                      {index === 0 ? (
                        <CustomTableCellRedirectToVoucher data={itm} type={itm.transactiontype} inAct={isInactive}>
                          {itm.vouchernumber}
                        </CustomTableCellRedirectToVoucher>
                      ) : (
                        ''
                      )}
                    </TableCell>
                    <TableCell
                      align="left"
                      size="small"
                      title={isInactive ? 'Cancelled' : ''}
                      sx={{
                        color: 'black',
                        whiteSpace: 'nowrap',
                        borderBottom: index === arr.length - 1 ? '3px solid black!important' : '',

                        padding: '4px 13px !important',
                      }}
                    >
                      <Typography sx={{ opacity: isInactive ? 0.3 : 1, fontSize: fontSize }}>
                        {index === 0 ? itm.transactiontype?.replace(/([a-z])([A-Z])/g, '$1 $2') : ''}
                      </Typography>
                    </TableCell>
                    <TableCell
                      align="left"
                      title={isInactive ? 'Cancelled' : ''}
                      sx={{
                        textTransform: 'capitalize',
                        fontWeight: 'bold',

                        whiteSpace: 'nowrap',
                        borderBottom: index === arr.length - 1 ? '3px solid black!important' : '',

                        padding: '0px',
                      }}
                    >
                      <a
                        className="myLink"
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (isInactive) return;
                          setAccountID(itm?.accountid);
                        }}
                        style={{
                          cursor: 'pointer',

                          opacity: isInactive ? 0.3 : 1,
                          color: isInactive && 'black',
                        }}
                      >
                        <Typography sx={{ marginLeft: itm.totalcreditamount !== 0 ? '10px' : '0px', fontSize: fontSize }}>
                          {' '}
                          {itm.accountname}
                        </Typography>
                      </a>
                    </TableCell>
                    <TableCell
                      align="right"
                      size="small"
                      title={isInactive ? 'Cancelled' : ''}
                      sx={{
                        color: 'black',
                        borderBottom: index === arr.length - 1 ? '3px solid black!important' : '',
                        whiteSpace: 'nowrap',
                        padding: '0px',
                      }}
                    >
                      <Typography sx={{ opacity: isInactive ? 0.3 : 1, fontSize: fontSize }}>
                        {' '}
                        {itm.totaldebitamount === 0.0 ? '' : formatNumber(itm.totaldebitamount, false, true)}
                      </Typography>
                    </TableCell>
                    <TableCell
                      align="right"
                      size="small"
                      title={isInactive ? 'Cancelled' : ''}
                      sx={{
                        color: 'black',
                        borderBottom: index === arr.length - 1 ? '3px solid black!important' : '',
                        whiteSpace: 'nowrap',
                        padding: '0px',
                      }}
                    >
                      <Typography sx={{ opacity: isInactive ? 0.3 : 1, fontSize: fontSize }}>
                        {' '}
                        {itm.totalcreditamount === 0.0 ? '' : formatNumber(itm.totalcreditamount, false, true)}
                      </Typography>
                    </TableCell>
                    <TableCell
                      align="left"
                      size="small"
                      title={isInactive ? 'Cancelled' : ''}
                      sx={{
                        color: 'black',
                        borderBottom: index === arr.length - 1 ? '3px solid black!important' : '',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      <Typography sx={{ font: 'inherit', marginLeft: '4px', opacity: isInactive ? 0.3 : 1, fontSize: fontSize }}>
                        {itm.comments}
                      </Typography>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          ))
        ) : (
          <TableRow>
            <TableCell height={'400'} align="center" colSpan={9} sx={{ border: 'none' }}>
              No Data Found
            </TableCell>
          </TableRow>
        )
      ) : (
        <TableBody>
          {data && data.length > 0 ? (
            <>
              {data.map((row, rowIndex) => (
                <TableRow
                  key={row.id ?? rowIndex}
                  className="noTableCellBorder"
                  sx={{
                    // height: ROW_HEIGHT,
                    border: 'none',
                    '&:hover': {
                      // you can use any palette value or hard-code a color
                      backgroundColor: '#E6CED7',
                      // bgcolor: theme => theme.palette.primary.light,
                    },
                  }}
                  onClick={() => {
                    navigate(navigateLink, { state: { data: row } });
                    localStorage.setItem(localStorageVar, JSON.stringify(storage));
                  }}
                >
                  {columns.map((col) => (
                    <TableCell
                      key={col.field}
                      align={col.align}
                      sx={{
                        maxWidth: col.width,
                        border: 'none',
                        whiteSpace: 'nowrap',
                        '&.MuiTableCell-root': { paddingLeft: col.align === 'left' ? '10px' : 0 },
                      }}
                    >
                      {renderCell ? renderCell({ row, field: col.field, value: row[col.field], rowIndex }) : row[col.field]}
                    </TableCell>
                  ))}
                </TableRow>
              ))}

              {/* Filler space so 1–2 rows don't collapse the body */}
              {data.length < MIN_ROWS && (
                <TableRow
                  sx={{
                    height: (MIN_ROWS - data.length) * ROW_HEIGHT,
                    pointerEvents: 'none',
                    '& td': { border: 0, p: 0 }, // no borders or padding
                  }}
                >
                  <TableCell colSpan={headData.length} />
                </TableRow>
              )}
            </>
          ) : (
            <TableRow
              sx={{
                height: ROW_HEIGHT * MIN_ROWS,
                '& td': { border: 0 }, // remove borders for empty state
              }}
            >
              <TableCell align="center" colSpan={headData.length}>
                <Typography>No Data Found</Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      )}
    </>
  );
};

export default Body;
