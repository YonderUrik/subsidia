import PropTypes from 'prop-types';
import { format } from 'date-fns';
// @mui
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';
import { Card, Tooltip } from '@mui/material';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// utils
import { fCurrency } from 'src/utils/format-number';
// components
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import CustomPopover, { usePopover } from 'src/components/custom-popover';

// ----------------------------------------------------------------------

export default function RaccolteTableRow({
  row,
  selected,
  onSelectRow,
  onViewRow,
  onEditRow,
  onDeleteRow,
}) {
  const { date, revenue, status, weight, price, client, product, note } = row;
  const confirm = useBoolean();
  const popover = usePopover();
  const popoverNote = usePopover();

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell sx={{ py: 0 }} padding="checkbox">
          <Checkbox checked={selected} onClick={onSelectRow} />
        </TableCell>

        {/* DATE CELL */}
        <TableCell sx={{ py: 0 }}>
          <ListItemText
            primary={format(new Date(date), 'dd MMM yyyy')}
            primaryTypographyProps={{ typography: 'body2', noWrap: true }}
          />
        </TableCell>

        {/* CLIENT CELL */}
        <TableCell sx={{ py: 0 }}>{client}</TableCell>

        {/* PRODUCT CELL */}
        <TableCell sx={{ py: 0 }}>{product}</TableCell>

        {/* WEIGHT CELL */}
        <TableCell sx={{ py: 0 }}>{weight}</TableCell>

        {/* PRICE CELL */}
        <TableCell sx={{ py: 0 }}>€{fCurrency(price)}</TableCell>

        {/* REVENUE CELL */}
        <TableCell sx={{ py: 0 }}>
          <ListItemText
            disableTypography
            primary={
              <Typography variant="body2" noWrap>
                € {fCurrency(revenue) || 0} / {fCurrency(price * weight)}
              </Typography>
            }
          />
        </TableCell>

        <TableCell sx={{ py: 0 }}>
          <Label
            variant="soft"
            color={
              (status === 'Pagato' && 'success') ||
              (status === 'Acconto' && 'warning') ||
              (status === 'Da Pagare' && 'error') ||
              'default'
            }
          >
            {status}
          </Label>
        </TableCell>

        <TableCell sx={{ py: 0 }}>
          {note ? (
            <>
              <Tooltip title="Visualizza nota">
                <IconButton onClick={popoverNote.onOpen}>
                  <Iconify icon="solar:notebook-bold-duotone" />
                </IconButton>
              </Tooltip>
              <CustomPopover arrow="left-top" open={popoverNote.open} onClose={popoverNote.onClose}>
                <Card
                  style={{
                    maxWidth: '300px', // Adjust the max width as needed
                    wordWrap: 'break-word', // Allow text to break and wrap
                  }}
                  sx={{ p: 2 }}
                >
                  {note}
                </Card>
              </CustomPopover>
            </>
          ) : null}
        </TableCell>

        <TableCell align="right" sx={{ px: 1, py: 0 }}>
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
        <MenuItem
          onClick={() => {
            onEditRow();
            popover.onClose();
          }}
        >
          <Iconify icon="solar:pen-bold" />
          Modifica
        </MenuItem>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <MenuItem
          onClick={() => {
            confirm.onTrue();
            popover.onClose();
          }}
          sx={{ color: 'error.main' }}
        >
          <Iconify icon="solar:trash-bin-trash-bold" />
          Elimina
        </MenuItem>
      </CustomPopover>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Elimina"
        content="Sei sicuro di voler elimare questa riga?"
        action={
          <Button variant="contained" color="error" onClick={onDeleteRow}>
            Elimina
          </Button>
        }
      />
    </>
  );
}

RaccolteTableRow.propTypes = {
  onDeleteRow: PropTypes.func,
  onEditRow: PropTypes.func,
  onSelectRow: PropTypes.func,
  onViewRow: PropTypes.func,
  row: PropTypes.object,
  selected: PropTypes.bool,
};
