import { useState } from 'react';
import { Outlet } from 'react-router-dom';
// @mui
import { Box } from '@mui/material';
// hooks
import useResponsive from '../../hooks/useResponsive';
//
import Main from './Main';
import Header from './header';
import NavVertical from './nav/NavVertical';
import NavMini from './nav/NavMini';

// ----------------------------------------------------------------------

export default function DashboardLayout() {

  const isDesktop = useResponsive('up', 'lg');
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const renderNavVertical = <NavVertical openNav={open} onCloseNav={handleClose} />;

  return (
    <>
      <Header onOpenNav={handleOpen} />

      <Box
        sx={{
          display: { lg: 'flex' },
          minHeight: { lg: 1 },
        }}
      >
        {isDesktop ? <NavMini /> : renderNavVertical}

        <Main>
          <Outlet />
        </Main>
      </Box>
    </>
  );
}
