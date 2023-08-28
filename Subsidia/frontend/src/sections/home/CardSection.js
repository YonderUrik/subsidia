import PropTypes from 'prop-types';
// @mui
import { Typography, Link, Stack, Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';

import { Link as RouterLink } from 'react-router-dom';

import Iconify from '../../components/iconify';

// ----------------------------------------------------------------------

CardSection.propTypes = {
  icon: PropTypes.string,
  sx: PropTypes.object,
  tags: PropTypes.array,
  title: PropTypes.string,
  desc: PropTypes.string,
  color: PropTypes.string,
  to: PropTypes.string,
};

export default function CardSection({ title, desc, to, color, icon,tags, sx, ...other }) {
  const theme = useTheme();

  return (
    <Link component={RouterLink} to={to} color="inherit" sx={{ display: 'contents' }}>
      <Stack
        direction="row"
        alignItems="center"
        sx={{
          p: 3,
          borderRadius: 2,
          overflow: 'hidden',
          position: 'relative',
          color: 'white',
          bgcolor: color ? `${color}.dark`: 'grey',
          ...sx,
        }}
        {...other}
      >
        <Box sx={{ ml: 3 }}>
          <Typography variant="h4">{title}</Typography>

          <Typography variant="body2" sx={{ opacity: 0.72 }}>
            {desc}
          </Typography>
        </Box>

        <Iconify
          icon={icon}
          sx={{
            width: 100,
            height: 100,
            opacity: 0.12,
            position: 'absolute',
            right: theme.spacing(0),
          }}
        />
      </Stack>
    </Link>
  );
}
