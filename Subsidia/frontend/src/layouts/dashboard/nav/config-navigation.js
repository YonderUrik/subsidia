// routes
import { PATH_APP } from '../../../routes/paths';
// components
import Iconify from '../../../components/iconify/Iconify';

// ----------------------------------------------------------------------

const icon = (name) => <Iconify icon={`${name}`} />;

const navConfig = [
  // GENERAL
  // ----------------------------------------------------------------------
  {
    subheader: '',
    items: [
      { title: 'Home', path: PATH_APP.home, icon: icon('mdi:home') },
      {
        title: 'Raccolte',
        path: PATH_APP.raccolte,
        icon: icon('bi:collection-fill'),
        tag: 'raccolte',
      },
      {
        title: 'Dipendenti',
        path: PATH_APP.dipendenti,
        icon: icon('clarity:employee-group-solid'),
        tag: 'dipendenti',
      },
      {
        title: 'Cashflow',
        path: PATH_APP.cashflow,
        icon: icon('mdi:cash-sync'),
        tag: 'cashflow',
      },
    ],
  },
];

export default navConfig;
