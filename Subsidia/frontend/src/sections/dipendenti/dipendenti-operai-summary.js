import PropTypes from 'prop-types';
// @mui
import Stack from '@mui/material/Stack';
import CardHeader from '@mui/material/CardHeader';
import Card from '@mui/material/Card';
import ListItemText from '@mui/material/ListItemText';
import { alpha} from '@mui/material/styles';

// components
import Iconify from 'src/components/iconify';
import { Grid, Paper } from '@mui/material';
import { TableNoData } from 'src/components/table';

// ----------------------------------------------------------------------

export default function OperaiSummary({ list }) {
  return (
    <Card>
      <CardHeader title="Riassunto operai" />
      <Grid container spacing={1} sx={{ p: 2 }}>
        <TableNoData notFound={list.length === 0} />
        {list.map((operaio) => {
          const remaining = operaio.total_pay - operaio.total_payed;
          let labelText = '';
          let labelColor = '';
          if (remaining > 0) {
            labelText = `Da saldare : €${remaining}`;
            labelColor = 'error.main';
          } else {
            labelText = `Saldato`;
            labelColor = 'success.main';
          }
          return (
            <Grid key={operaio._id} item xs={12} md={4}>
              <Paper
                sx={{
                  mr: 1,
                  borderRadius: 2,
                  position: 'relative',
                  border: 1.5,
                  bgcolor: 'background.paper',
                  borderColor: (theme) => alpha(theme.palette.grey[900], 0.22),
                }}
              >
                <Stack
                  spacing={2}
                  sx={{
                    px: 2,
                    pb: 1,
                    pt: 2,
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <ListItemText
                      primary={<span style={{ fontWeight: 'bold' }}>{operaio._id}</span>}
                    />
                  </Stack>
                  <Stack
                    sx={{
                      position: 'relative',
                    }}
                  >
                    {/* <IconButton
                  onClick={popover.onOpen}
                  sx={{ position: 'absolute', bottom: 20, right: 8 }}
                >
                  <Iconify icon="eva:more-vertical-fill" />
                </IconButton> */}

                    {[
                      {
                        label: labelText,
                        icon: <Iconify icon="cryptocurrency:eur" color={labelColor} />,
                      },
                      {
                        label: `Giornate lavorate : ${operaio.total_type}`,
                        icon: (
                          <Iconify icon="solar:clock-circle-bold" sx={{ color: 'info.main' }} />
                        ),
                      },
                    ].map((item) => (
                      <Stack
                        key={item.label}
                        spacing={1}
                        direction="row"
                        alignItems="center"
                        sx={{ typography: 'body2' }}
                      >
                        {item.icon}
                        {item.label}
                      </Stack>
                    ))}
                  </Stack>
                </Stack>
              </Paper>
            </Grid>
          );
        })}
      </Grid>
    </Card>
  );
}

OperaiSummary.propTypes = {
  list: PropTypes.array,
};
