import PropTypes from 'prop-types';
import { format } from 'date-fns';
// @mui
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import IconButton from '@mui/material/IconButton';
import CardHeader from '@mui/material/CardHeader';
import Card from '@mui/material/Card';
import ListItemText from '@mui/material/ListItemText';
import Badge, { badgeClasses } from '@mui/material/Badge';
import TableContainer from '@mui/material/TableContainer';
// utils
import { fCurrency } from 'src/utils/format-number';
// components
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import { TableHeadCustom } from 'src/components/table';
import { CustomAvatar } from 'src/components/custom-avatar';

// ----------------------------------------------------------------------

const TABLE_COLUMNS = [
  { id: 'date', label: 'Data' },
  { id: 'opeario', label: 'Operaio' },
  { id: 'pay', label: 'Paga' },
  { id: 'payed', label: 'Pagato' },
  { id: 'type', label: 'Tipo' },
  { id: 'status', label: 'Status' },
  { id: 'actions', label: '' },
];

export default function DipendentiTransazioni({ tableData, ...other }) {
  return (
    <Card {...other}>
      <CardHeader title="Ultime giornate" sx={{ mb: 3 }} />

      <TableContainer sx={{ overflow: 'unset' }}>
        <Scrollbar sx={{ minWidth: 720 }}>
          <Table>
            <TableHeadCustom headLabel={TABLE_COLUMNS} />

            <TableBody>
              {tableData.map((row) => (
                <DipendentiTransazioniRow key={row._id} row={row} />
              ))}
            </TableBody>
          </Table>
        </Scrollbar>
      </TableContainer>
    </Card>
  );
}

DipendentiTransazioni.propTypes = {
  tableData: PropTypes.array,
};

// ----------------------------------------------------------------------

function DipendentiTransazioniRow({ row }) {
  console.log(row);
  const theme = useTheme();
  const isLight = theme.palette.mode === 'light';

  const popover = usePopover();

  const handleDownload = () => {
    popover.onClose();
    console.info('DOWNLOAD', row._id);
  };

  const handlePrint = () => {
    popover.onClose();
    console.info('PRINT', row._id);
  };

  const handleShare = () => {
    popover.onClose();
    console.info('SHARE', row._id);
  };

  const handleDelete = () => {
    popover.onClose();
    console.info('DELETE', row._id);
  };

  const renderAvatar = (
    <Box sx={{ position: 'relative', mr: 2 }}>
      <CustomAvatar
        name={row.operaio}
        sx={{
          width: 48,
          height: 48,
          color: 'text.secondary',
          bgcolor: 'background.neutral',
        }}
      />
    </Box>
  );

  return (
    <>
      <TableRow sx={{ py: 0 }}>
        {/* DATA */}
        <TableCell sx={{ py: 0 }}>
          <ListItemText
            primary={format(new Date(row.date), 'dd MMM yyyy')}
            primaryTypographyProps={{ typography: 'body2' }}
          />
        </TableCell>

        {/* OPERAIO */}
        <TableCell sx={{ py: 0 }}>
          {renderAvatar}
          <ListItemText primary={row.message} secondary={row.category} />
        </TableCell>

        {/* PAGA */}
        <TableCell sx={{ py: 0 }}>€{fCurrency(row.pay)}</TableCell>

        {/* PAGATO */}
        <TableCell sx={{ py: 0 }}>€{fCurrency(row.payed)}</TableCell>

        {/* STATO  */}
        <TableCell sx={{ py: 0 }}>
          <Label variant={isLight ? 'soft' : 'filled'} color='info'>
            {row.type === 0 ? 'Mezza Giornata' : '1 Giornata'}
          </Label>
        </TableCell>

        {/* STATO  */}
        <TableCell sx={{ py: 0 }}>
          <Label
            variant={isLight ? 'soft' : 'filled'}
            color={
              (row.pay === row.payed && 'success') ||
              (row.payed > 0 && row.payed < row.pay && 'warning') ||
              'error'
            }
          >
            {(row.pay === row.payed && 'Pagto') ||
              (row.payed > 0 && row.payed < row.pay && 'Acconto') ||
              'Da Saldare'}
          </Label>
        </TableCell>

        <TableCell sx={{ py: 0 }}>
          <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 160 }}
      >
        <MenuItem onClick={handleDownload}>
          <Iconify icon="eva:cloud-download-fill" />
          Download
        </MenuItem>

        <MenuItem onClick={handlePrint}>
          <Iconify icon="solar:printer-minimalistic-bold" />
          Print
        </MenuItem>

        <MenuItem onClick={handleShare}>
          <Iconify icon="solar:share-bold" />
          Share
        </MenuItem>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <Iconify icon="solar:trash-bin-trash-bold" />
          Delete
        </MenuItem>
      </CustomPopover>
    </>
  );
}

DipendentiTransazioniRow.propTypes = {
  row: PropTypes.object,
};
