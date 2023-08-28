import PropTypes from 'prop-types';
// @mui
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
// components
import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';

// ----------------------------------------------------------------------

export default function YearPopover({ year, yearOptions, onChange }) {
  const popover = usePopover();

  return (
    <>
      <Button
        disableRipple
        color="inherit"
        onClick={popover.onOpen}
        endIcon={
          <Iconify
            icon={popover.open ? 'eva:arrow-ios-upward-fill' : 'eva:arrow-ios-downward-fill'}
          />
        }
        sx={{ fontWeight: 'fontWeightSemiBold', textTransform: 'capitalize' }}
      >
        Anno:
        <Box component="span" sx={{ ml: 0.5, fontWeight: 'fontWeightBold' }}>
          {year}
        </Box>
      </Button>

      <CustomPopover open={popover.open} onClose={popover.onClose} sx={{ width: 140 }}>
        {yearOptions.map((option) => (
          <MenuItem
            key={option}
            selected={year === option}
            onClick={() => {
              popover.onClose();
              onChange(option);
            }}
          >
            {option}
          </MenuItem>
        ))}
      </CustomPopover>
    </>
  );
}

YearPopover.propTypes = {
  onChange: PropTypes.func,
  year: PropTypes.number,
  yearOptions: PropTypes.array,
};
