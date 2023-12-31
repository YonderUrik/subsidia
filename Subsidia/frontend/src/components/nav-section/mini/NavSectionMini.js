import PropTypes from 'prop-types';
import { memo } from 'react';
// @mui
import { Box, Stack } from '@mui/material';
//
import NavList from './NavList';
import AccountPopover from '../../../layouts/dashboard/header/AccountPopover';
import { useAuthContext } from '../../../auth/useAuthContext';

// ----------------------------------------------------------------------

NavSectionMini.propTypes = {
  sx: PropTypes.object,
  data: PropTypes.array,
};

function NavSectionMini({ data, sx, ...other }) {
  return (
    <Stack
      spacing={0.5}
      alignItems="center"
      sx={{
        px: 0.75,
        ...sx,
      }}
      {...other}
    >
      <AccountPopover />

      <Box
        sx={{
          width: 24,
          height: '1px',
          bgcolor: 'divider',
          my: '8px !important',
        }}
      />
      {data.map((group, index) => (
        <Items key={group.subheader} items={group.items} isLastGroup={index + 1 === data.length} />
      ))}
    </Stack>
  );
}

export default memo(NavSectionMini);

// ----------------------------------------------------------------------

Items.propTypes = {
  items: PropTypes.array,
  isLastGroup: PropTypes.bool,
};

function Items({ items, isLastGroup }) {
  const { user } = useAuthContext();
  const tags = user?.tags;
  return (
    <>
      {items.map((list) =>
        !list.tag || tags.includes(list.tag) ? (
          <NavList key={list.title + list.path} data={list} depth={1} hasChild={!!list.children} />
        ) : null
      )}

      {!isLastGroup && (
        <Box
          sx={{
            width: 24,
            height: '1px',
            bgcolor: 'divider',
            my: '8px !important',
          }}
        />
      )}
    </>
  );
}
