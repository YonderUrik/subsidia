import PropTypes from 'prop-types';
import { useState } from 'react';

import { Link as RouterLink } from 'react-router-dom';
// @mui
import { Card, Link, Typography } from '@mui/material';


// ----------------------------------------------------------------------

FileFolderCard.propTypes = {
  sx: PropTypes.object,
  folder: PropTypes.object,
  linkto: PropTypes.string,
  onDelete: PropTypes.func,
  onSelect: PropTypes.func,
  selected: PropTypes.bool,
  color: PropTypes.string,
  demo: PropTypes.bool,
};

export default function FileFolderCard({
  folder,
  demo,
  linkto,
  selected,
  onSelect,
  onDelete,
  sx,
  ...other
}) {
  const [showCheckbox, setShowCheckbox] = useState(false);

  const handleShowCheckbox = () => {
    setShowCheckbox(true);
  };

  const handleHideCheckbox = () => {
    setShowCheckbox(false);
  };

  return (
    <Link component={RouterLink} to={linkto} sx={{ display: 'contents' }}>
      <Card
        onMouseEnter={handleShowCheckbox}
        onMouseLeave={handleHideCheckbox}
        sx={{
          py: 3,
          boxShadow: 0,
          textAlign: 'center',
          bgcolor: !demo ? 'background' : 'primary.lighter',
          border: (theme) => `solid 1px ${theme.palette.divider}`,
          ...((showCheckbox || selected) && {
            borderColor: 'transparent',
            bgcolor: !demo ? 'background.default' : 'primary.light',
          }),

          ...sx,
        }}
        {...other}
      >
        <Typography variant="h5">{folder.name}</Typography>
      </Card>
    </Link>
  );
}
