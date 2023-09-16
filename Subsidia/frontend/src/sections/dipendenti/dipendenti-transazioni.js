import PropTypes from 'prop-types';
import { format } from 'date-fns';
import { useState } from 'react';
// @mui
import { useTheme } from '@mui/material/styles';
import Table from '@mui/material/Table';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import IconButton from '@mui/material/IconButton';
import CardHeader from '@mui/material/CardHeader';
import Card from '@mui/material/Card';
import ListItemText from '@mui/material/ListItemText';
import TableContainer from '@mui/material/TableContainer';
import { LoadingButton } from '@mui/lab';
import { Tooltip } from '@mui/material';
// utils
import { fCurrency } from 'src/utils/format-number';
// components
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import { TableHeadCustom, TableNoData } from 'src/components/table';
import { useBoolean } from 'src/hooks/use-boolean';
import ConfirmDialog from 'src/components/confirm-dialog';
import { useSnackbar } from '../../components/snackbar';
import axios from '../../utils/axios';

// ----------------------------------------------------------------------

const TABLE_COLUMNS = [
  { id: 'date', label: 'Data' },
  { id: 'opeario', label: 'Operaio' },
  { id: 'pay', label: 'Paga' },
  { id: 'payed', label: 'Pagato' },
  { id: 'type', label: 'Tipo' },
  { id: 'status', label: 'Status' },
  { id: 'activity', label: 'Attività' },
  { id: 'actions', label: '' },
];

export default function DipendentiTransazioni({ tableData, refreshTable, ...other }) {
  return (
    <Card {...other}>
      <CardHeader title="Ultime giornate" sx={{ mb: 3 }} />

      <TableContainer sx={{ overflow: 'auto', maxHeight: '75vh' }}>
        <Scrollbar sx={{ minWidth: 720 }}>
          <Table>
            <TableHeadCustom headLabel={TABLE_COLUMNS} />

            <TableBody>
              {tableData.map((row) => (
                <DipendentiTransazioniRow
                  key={row._id}
                  row={row}
                  refreshData={() => refreshTable()}
                />
              ))}
              <TableNoData notFound={tableData.length === 0} />
            </TableBody>
          </Table>
        </Scrollbar>
      </TableContainer>
    </Card>
  );
}

DipendentiTransazioni.propTypes = {
  tableData: PropTypes.array,
  refreshTable: PropTypes.func,
};

// ----------------------------------------------------------------------

function DipendentiTransazioniRow({ row, refreshData }) {
  const theme = useTheme();
  const isLight = theme.palette.mode === 'light';
  const [isDeleting, setIsDeleting] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const popoverActivity = usePopover();
  const popover = usePopover();
  const confirmDialog = useBoolean();

  const handleDelete = () => {
    popover.onClose();
    confirmDialog.onTrue();
  };

  const handleDeleteGiornata = async () => {
    setIsDeleting(true);
    try {
      await axios.post('/dipendenti/delete-giornata', {
        id: row._id,
      });
      confirmDialog.onFalse();
      enqueueSnackbar('Giornata eliminata con successo');
      refreshData();
    } catch (error) {
      enqueueSnackbar(error.message || error, { variant: 'error' });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <TableRow hover sx={{ py: 0 }}>
        {/* DATA */}
        <TableCell sx={{ py: 0 }}>
          <ListItemText
            primary={format(new Date(row.date), 'dd MMM yyyy')}
            primaryTypographyProps={{ typography: 'body2' }}
          />
        </TableCell>

        {/* OPERAIO */}
        <TableCell sx={{ py: 0.5 }}>{row.operaio}</TableCell>

        {/* PAGA */}
        <TableCell sx={{ py: 0 }}>€{fCurrency(row.pay)}</TableCell>

        {/* PAGATO */}
        <TableCell sx={{ py: 0 }}>€{fCurrency(row.payed)}</TableCell>

        {/* STATO  */}
        <TableCell sx={{ py: 0 }}>
          <Label variant={isLight ? 'soft' : 'filled'} color="info">
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
            {(row.pay === row.payed && 'Pagato') ||
              (row.payed > 0 && row.payed < row.pay && 'Acconto') ||
              'Da Saldare'}
          </Label>
        </TableCell>

        {/* ATTIVITÁ */}
        <TableCell sx={{ py: 0 }}>
          <>
            <Tooltip title="Visualizza attività">
              <IconButton onClick={popoverActivity.onOpen}>
                <Iconify icon="solar:notebook-bold-duotone" />
              </IconButton>
            </Tooltip>
            <CustomPopover
              arrow="left-top"
              open={popoverActivity.open}
              onClose={popoverActivity.onClose}
            >
              <Card
                style={{
                  maxWidth: '300px', // Adjust the max width as needed
                  wordWrap: 'break-word', // Allow text to break and wrap
                }}
                sx={{ p: 2 }}
              >
                {row.activity}
              </Card>
            </CustomPopover>
          </>
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
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <Iconify icon="solar:trash-bin-trash-bold" />
          Elimina
        </MenuItem>
      </CustomPopover>
      <ConfirmDialog
        open={confirmDialog.value}
        onClose={confirmDialog.onFalse}
        title="Delete"
        content={<>Sei sicuro di voler eliminare la giornata?</>}
        action={
          <LoadingButton
            loading={isDeleting}
            variant="contained"
            color="error"
            onClick={handleDeleteGiornata}
          >
            Elimina
          </LoadingButton>
        }
      />
    </>
  );
}

DipendentiTransazioniRow.propTypes = {
  row: PropTypes.object,
  refreshData: PropTypes.func,
};
