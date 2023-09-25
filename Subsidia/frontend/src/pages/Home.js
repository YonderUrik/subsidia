import { Helmet } from 'react-helmet-async';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

// @mui
import { Container, Typography, Box, Paper } from '@mui/material';
// components

import { useSettingsContext } from '../components/settings';
import { useAuthContext } from '../auth/useAuthContext';
import Iconify from '../components/iconify/Iconify';
import { PATH_APP } from '../routes/paths';

// ----------------------------------------------------------------------

export default function Home() {
  const { user } = useAuthContext();
  const { themeStretch } = useSettingsContext();

  const username = user?.email;

  return (
    <>
      <Helmet>
        <title> Home | Subsidia</title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'xl'}>
        <Typography variant="h4" sx={{ mb: 5 }}>
          Bentornato/a {username}
        </Typography>

        <ModuleCard
          title="Moduli"
          list={[
            {
              label: 'Raccolte',
              icon: 'bi:collection-fill',
              color: 'primary',
              to: PATH_APP.raccolte,
              tag: 'raccolte',
            },
            {
              label: 'Cashflow',
              to: PATH_APP.cashflow,
              icon: 'mdi:cash-sync',
              color: 'primary',
              tag: 'cashflow',
            },
            {
              label: 'Dipendenti',
              icon: 'clarity:employee-group-solid',
              color: 'primary',
              to: PATH_APP.dipendenti,
              tag: 'dipendenti',
            },
            { label: 'Agenda', icon: 'solar:book-2-bold-duotone', color: '', tag: 'agenda' },
            {
              label: 'Magazzino',
              icon: 'material-symbols:warehouse-rounded',
              color: '',
              tag: 'magazzino',
            },
          ]}
        />
      </Container>
    </>
  );
}

ModuleCard.propTypes = {
  list: PropTypes.array,
  subheader: PropTypes.string,
  title: PropTypes.string,
};

export function ModuleCard({ title, subheader, list, ...other }) {
  const { user } = useAuthContext();
  const tags = user?.tags;
  return (
    <Box display="grid" gap={1.5} gridTemplateColumns="repeat(2, 1fr)" sx={{ p: 3 }}>
      {list.map((site) =>
        tags.includes(site.tag) ? (
          <Link style={{ textDecoration: 'none' }} key={site.label} to={site.to}>
            <Paper
              variant="outlined"
              sx={{
                py: 2.5,
                textAlign: 'center',
                bgcolor: site.color ? `${site.color}.dark` : 'grey',
                color: 'white',
                '&:hover': {
                  bgcolor: site.color ? `${site.color}.darker` : 'grey',
                },
                border: (theme) => `solid 1px ${theme.palette.divider}`,
              }}
            >
              <Iconify icon={site.icon} width={36} opacity={0.7} />

              <Typography variant="h6" sx={{ mt: 0.5 }}>
                {site.total}
              </Typography>

              <Typography variant="h6">{site.label}</Typography>
            </Paper>
          </Link>
        ) : null
      )}
    </Box>
  );
}
