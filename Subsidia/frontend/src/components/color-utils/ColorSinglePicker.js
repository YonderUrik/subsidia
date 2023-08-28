import PropTypes from 'prop-types';
import { forwardRef } from 'react';
// @mui
import { Radio, RadioGroup, FormControlLabel } from '@mui/material';
//
import Icon from './Icon';

// ----------------------------------------------------------------------

const ColorSinglePicker = forwardRef(({ colors, ...other }, ref) => (
  <RadioGroup row ref={ref} {...other}>
    {colors.map((color) => {
      const whiteColor = color.id === '#FFFFFF' || color.id === 'white';

      return (
        <FormControlLabel
          key={color.name}
          control={
            <Radio
              {...other}
              value={color.name}
              color="default"
              icon={<Icon whiteColor={whiteColor} />}
              checkedIcon={<Icon checked whiteColor={whiteColor} />}
              sx={{
                color: color.id,
                '&:hover': { opacity: 0.72 },
                '& svg': { width: 12, height: 12 },
              }}
            />
          }
          label={color.name}
        />
      );
    })}
  </RadioGroup>
));

ColorSinglePicker.propTypes = {
  colors: PropTypes.arrayOf(PropTypes.object),
};

export default ColorSinglePicker;
