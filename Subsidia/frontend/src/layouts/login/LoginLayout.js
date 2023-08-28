import PropTypes from 'prop-types';
// @mui
import { Stack } from '@mui/material';
// components
import Logo from '../../components/logo';
//
import { StyledRoot, StyledContent } from './styles';

// ----------------------------------------------------------------------

LoginLayout.propTypes = {
  title: PropTypes.string,
  children: PropTypes.node,
  illustration: PropTypes.string,
};

export default function LoginLayout({ children, illustration, title }) {
  return (
    <StyledRoot>
      <Logo
        sx={{
          zIndex: 9,
          position: 'absolute',
          mt: { xs: 1.5, md: 5 },
          ml: { xs: 2, md: 5 },
        }}
      />

      <StyledContent>
        <Stack sx={{ width: 1 }}> {children} </Stack>
      </StyledContent>
    </StyledRoot>
  );
}
