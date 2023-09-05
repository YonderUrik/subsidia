import PropTypes from 'prop-types';
import { useCallback} from 'react';
// @mui
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import IconButton from '@mui/material/IconButton';
import FormControl from '@mui/material/FormControl';
import InputAdornment from '@mui/material/InputAdornment';
import OutlinedInput from '@mui/material/OutlinedInput';
import Select from '@mui/material/Select';
import html2canvas from 'html2canvas';

// components
import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';

// ----------------------------------------------------------------------

export default function RaccolteTableToolbar({
  filters,
  onFilters,
  componentRef,
  //
  productOptions,
}) {
  const popover = usePopover();

  const handleClientName = useCallback(
    (event) => {
      onFilters('client', event.target.value);
    },
    [onFilters]
  );

  const handleFilterProduct = useCallback(
    (event) => {
      onFilters(
        'product',
        typeof event.target.value === 'string' ? event.target.value.split(',') : event.target.value
      );
    },
    [onFilters]
  );

  const handleFilterDate = useCallback(
    (newValue) => {
      onFilters('date', newValue);
    },
    [onFilters]
  );

  const handleExport = async () => {
    if (componentRef.current) {
      const canvas = await html2canvas(componentRef);
      const imageURL = canvas.toDataURL('image/png');

      const a = document.createElement('a');
      a.href = imageURL;
      a.download = 'exported-image.png';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  return (
    <>
      <Stack
        spacing={2}
        alignItems={{ xs: 'flex-end', md: 'center' }}
        direction={{
          xs: 'column',
          md: 'row',
        }}
        sx={{
          p: 2.5,
          pr: { xs: 2.5, md: 1 },
        }}
      >
        <FormControl
          sx={{
            flexShrink: 0,
            width: { xs: 1, md: 180 },
          }}
          size="small"
        >
          <InputLabel>Prodotto</InputLabel>
          <Select
            multiple
            value={filters.product}
            onChange={handleFilterProduct}
            input={<OutlinedInput label="Prodotto" />}
            renderValue={(selected) => selected.map((value) => value).join(', ')}
            sx={{ textTransform: 'capitalize' }}
          >
            {productOptions.map((option) => (
              <MenuItem key={option} value={option}>
                <Checkbox disableRipple size="small" checked={filters.product.includes(option)} />
                {option}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <DatePicker
          label="Data"
          value={filters.date}
          onChange={handleFilterDate}
          slotProps={{ textField: { fullWidth: true, size: 'small' } }}
          sx={{
            maxWidth: { md: 180 },
          }}
        />

        <Stack direction="row" alignItems="center" spacing={2} flexGrow={1} sx={{ width: 1 }}>
          <TextField
            fullWidth
            size="small"
            value={filters.client}
            onChange={handleClientName}
            placeholder="Cerca cliente..."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                </InputAdornment>
              ),
            }}
          />

          <IconButton onClick={popover.onOpen}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </Stack>
      </Stack>

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 140 }}
      >
        <MenuItem
          onClick={() => {
            handleExport();
            popover.onClose();
          }}
        >
          <Iconify icon="solar:printer-minimalistic-bold" />
          Print
        </MenuItem>

        <MenuItem
          onClick={() => {
            popover.onClose();
          }}
        >
          <Iconify icon="solar:export-bold" />
          Export
        </MenuItem>
      </CustomPopover>
    </>
  );
}

RaccolteTableToolbar.propTypes = {
  filters: PropTypes.object,
  onFilters: PropTypes.func,
  componentRef: PropTypes.any,
  productOptions: PropTypes.array,
};
