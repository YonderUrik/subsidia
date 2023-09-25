// ----------------------------------------------------------------------

function path(root, sublink) {
  return `${root}${sublink}`;
}

const ROOT_APP = '/app';

// ----------------------------------------------------------------------

export const PATH_AUTH = {
  login: '/login',
  register: '/register',
  reset_pwd: '/reset-password',
};

export const PATH_APP = {
  root: ROOT_APP,
  home: path(ROOT_APP, '/home'),
  raccolte: path(ROOT_APP, '/raccolte'),
  nuova_raccolta: path(ROOT_APP, '/nuova-raccolta'),
  modifica_raccolta: (id) => path(ROOT_APP, `/raccolta/${id}/modifica`),
  dipendenti: path(ROOT_APP, '/dipendenti'),
  cashflow: path(ROOT_APP, '/cashflow'),
};
