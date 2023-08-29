import sumBy from 'lodash/sumBy';
import { useState, useCallback, useRef } from 'react';
// @mui
import { useTheme, alpha } from '@mui/material/styles';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import IconButton from '@mui/material/IconButton';
import TableContainer from '@mui/material/TableContainer';
import { LinearProgress } from '@mui/material';

// routes
import { PATH_APP } from '../../../routes/paths';
import { useRouter } from '../../../routes/hook';
import { RouterLink } from '../../../routes/components';
// hooks
import { useBoolean } from '../../../hooks/use-boolean';
// utils
import { fTimestamp } from '../../../utils/format-time';
import axios from '../../../utils/axios';
// components
import Label from '../../../components/label';
import Iconify from '../../../components/iconify';
import Scrollbar from '../../../components/scrollbar';
import { ConfirmDialog } from '../../../components/custom-dialog';
import { useSettingsContext } from '../../../components/settings';
import CustomBreadcrumbs from '../../../components/custom-breadcrumbs';
import {
  useTable,
  getComparator,
  emptyRows,
  TableNoData,
  TableEmptyRows,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
} from '../../../components/table';
//
import RaccolteAnalytic from '../raccolte-analytic';
import RaccolteTableRow from '../raccolte-table-row';
import RaccolteTableToolbar from '../raccolte-table-toolbar';
import RaccolteTableFiltersResult from '../raccolte-table-filters-result';
import YearPopover from '../../year-popover';
import { useSnackbar } from '../../../components/snackbar';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'date', label: 'Data' },
  { id: 'client', label: 'Cliente' },
  { id: 'product', label: 'Prodotto' },
  { id: 'weight', label: 'Peso netto' },
  { id: 'price', label: 'Prezzo' },
  { id: 'revenue', label: 'Incasso R / Incasso T' },
  { id: 'status', label: 'Stato' },
  { id: '' },
];

const defaultFilters = {
  client: '',
  product: [],
  status: 'all',
  date: null,
};

// ----------------------------------------------------------------------

export default function InvoiceListView() {
  const theme = useTheme();
  const loadingData = useBoolean();
  const settings = useSettingsContext();
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();
  const table = useTable({ defaultOrderBy: 'date' });
  const componentRef = useRef(null);

  const confirm = useBoolean();

  const [tableData, setTableData] = useState([]);

  const [filters, setFilters] = useState(defaultFilters);

  const [products, setProducts] = useState([]);
  const [yearsAvailable, setYearsAvailable] = useState([]);
  const [year, setYear] = useState(new Date().getFullYear());

  const getData = useCallback(async () => {
    loadingData.onTrue();
    try {
      const response = await axios.post('/raccolte/get-data', {
        year,
      });
      console.log(response.data);
      setTableData(response.data);
    } catch (error) {
      console.log(error);
    } finally {
      loadingData.onFalse();
    }
  }, [loadingData, year]);

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
    filters,
  });

  const dataInPage = dataFiltered.slice(
    table.page * table.rowsPerPage,
    table.page * table.rowsPerPage + table.rowsPerPage
  );

  const denseHeight = table.dense ? 56 : 76;

  const canReset =
    !!filters.client || !!filters.product.length || filters.status !== 'all' || !!filters.date;

  const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length;

  const getRaccoltaLength = (status) =>
    dataFiltered.filter((item) => item.status === status).length;

  const getTotalAmount = (status) => {
    if (status === 'Da Pagare') {
      const filteredItems = dataFiltered.filter((item) => item.status === status);
      const sum = filteredItems.reduce((acc, item) => acc + item.weight * item.price, 0);
      return sum;
    }
    return sumBy(
      dataFiltered.filter((item) => item.status === status),
      'revenue'
    );
  };

  const getPercentByStatus = (status) => (getRaccoltaLength(status) / dataFiltered.length) * 100;

  const TABS = [
    { value: 'all', label: 'Tutti', color: 'default', count: tableData.length },
    { value: 'Pagato', label: 'Pagati', color: 'success', count: getRaccoltaLength('Pagato') },
    { value: 'Acconto', label: 'Acconti', color: 'warning', count: getRaccoltaLength('Acconto') },
    {
      value: 'Da Pagare',
      label: 'Da Pagare',
      color: 'error',
      count: getRaccoltaLength('Da Pagare'),
    },
  ];

  const handleFilters = useCallback(
    (name, value) => {
      console.log(name, value);
      table.onResetPage();
      setFilters((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    },
    [table]
  );

  const handleDeleteRow = useCallback(
    async (_id) => {
      try {
        await axios.post('/raccolte/delete-rows', {
          ids: [_id],
        });
        const deleteRow = tableData.filter((row) => row._id !== _id);
        setTableData(deleteRow);

        enqueueSnackbar('Riga rimossa correttamente');
      } catch (error) {
        enqueueSnackbar(error.message || error, { variant: 'error' });
      }

      table.onUpdatePageDeleteRow(dataInPage.length);
    },
    [dataInPage.length, table, tableData, enqueueSnackbar]
  );

  const handleDeleteRows = useCallback(async () => {
    try {
      await axios.post('/raccolte/delete-rows', {
        ids: table.selected,
      });
      const deleteRows = tableData.filter((row) => !table.selected.includes(row._id));
      setTableData(deleteRows);

      table.onUpdatePageDeleteRows({
        totalRows: tableData.length,
        totalRowsInPage: dataInPage.length,
        totalRowsFiltered: dataFiltered.length,
      });
      enqueueSnackbar('Righe rimosse correttamente');
    } catch (error) {
      enqueueSnackbar(error.message || error, { variant: 'error' });
    }
  }, [dataFiltered.length, dataInPage.length, table, tableData, enqueueSnackbar]);

  const getDistinctVaues = useCallback(async () => {
    try {
      const responseProducts = await axios.post('/raccolte/get-distinct-value', {
        value: 'product',
      });
      const responseYears = await axios.get('/raccolte/get-distinct-years');

      setProducts(responseProducts.data);

      const currentYear = new Date().getFullYear();
      let yearsArray = responseYears.data;
      // Check if the array is empty or doesn't contain the current year
      if (!yearsArray.length || !yearsArray.includes(currentYear)) {
        // Prepend the current year to the array
        console.log('APPENDOR');
        yearsArray = [currentYear, ...yearsArray];
      }
      setYearsAvailable(yearsArray);
    } catch (error) {
      console.log(error);
    }
  }, []);

  useState(() => {
    getData();
    getDistinctVaues();
  }, [getDistinctVaues, getData]);

  const handleEditRow = useCallback(
    (id) => {
      router.push(PATH_APP.modifica_raccolta(id));
    },
    [router]
  );

  const handleFilterStatus = useCallback(
    (event, newValue) => {
      handleFilters('status', newValue);
    },
    [handleFilters]
  );

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const onChangeYear = (newValue) => {
    setYear(newValue);
  };

  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'lg'} ref={componentRef}>
        <CustomBreadcrumbs
          heading={
            <>
              Raccolte
              <YearPopover yearOptions={yearsAvailable} year={year} onChange={onChangeYear} />
            </>
          }
          action={
            <Button
              component={RouterLink}
              href={PATH_APP.nuova_raccolta}
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
            >
              Nuova raccolta
            </Button>
          }
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        />

        {/* STATISTICS */}
        <Card
          sx={{
            mb: { xs: 3, md: 2 },
          }}
        >
          <Scrollbar>
            <Stack
              direction="row"
              divider={<Divider orientation="vertical" flexItem sx={{ borderStyle: 'dashed' }} />}
              sx={{ py: 1 }}
            >
              <RaccolteAnalytic
                title="Totale"
                percent={100}
                symbol="Q"
                price={`${sumBy(dataFiltered, 'weight') / 100}`}
                icon="solar:bill-list-bold-duotone"
                color={theme.palette.info.main}
              />

              <RaccolteAnalytic
                title="Pagati"
                symbol="€"
                percent={getPercentByStatus('Pagato')}
                price={getTotalAmount('Pagato')}
                icon="solar:check-circle-bold-duotone"
                color={theme.palette.success.main}
              />

              <RaccolteAnalytic
                title="Acconti"
                symbol="€"
                percent={getPercentByStatus('Acconto')}
                price={getTotalAmount('Acconto')}
                icon="solar:clock-circle-bold-duotone"
                color={theme.palette.warning.main}
              />

              <RaccolteAnalytic
                title="Da Pagare"
                symbol="€"
                percent={getPercentByStatus('Da Pagare')}
                price={getTotalAmount('Da Pagare')}
                icon="solar:bell-bing-bold-duotone"
                color={theme.palette.error.main}
              />
            </Stack>
          </Scrollbar>
        </Card>

        <Card>
          {/* TABS */}
          <Tabs
            value={filters.status}
            onChange={handleFilterStatus}
            sx={{
              px: 2.5,
              boxShadow: `inset 0 -2px 0 0 ${alpha(theme.palette.grey[500], 0.08)}`,
            }}
          >
            {TABS.map((tab) => (
              <Tab
                key={tab.value}
                value={tab.value}
                label={tab.label}
                iconPosition="end"
                icon={
                  <Label
                    variant={
                      ((tab.value === 'all' || tab.value === filters.status) && 'filled') || 'soft'
                    }
                    color={tab.color}
                  >
                    {tab.count}
                  </Label>
                }
              />
            ))}
          </Tabs>

          <RaccolteTableToolbar
            filters={filters}
            componentRef={componentRef.current}
            onFilters={handleFilters}
            productOptions={products.map((option) => option)}
          />

          {canReset && (
            <RaccolteTableFiltersResult
              filters={filters}
              onFilters={handleFilters}
              //
              onResetFilters={handleResetFilters}
              //
              results={dataFiltered.length}
              sx={{ p: 2.5, pt: 0 }}
            />
          )}

          {loadingData.value && <LinearProgress />}
          <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
            <TableSelectedAction
              dense={table.dense}
              numSelected={table.selected.length}
              rowCount={tableData.length}
              onSelectAllRows={(checked) =>
                table.onSelectAllRows(
                  checked,
                  tableData.map((row) => row._id)
                )
              }
              action={
                <Stack direction="row">
                  <Tooltip title="Elimina">
                    <IconButton color="primary" onClick={confirm.onTrue}>
                      <Iconify icon="solar:trash-bin-trash-bold" />
                    </IconButton>
                  </Tooltip>
                </Stack>
              }
            />

            <Scrollbar>
              <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 800 }}>
                <TableHeadCustom
                  order={table.order}
                  orderBy={table.orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={tableData.length}
                  numSelected={table.selected.length}
                  onSort={table.onSort}
                  onSelectAllRows={(checked) =>
                    table.onSelectAllRows(
                      checked,
                      tableData.map((row) => row._id)
                    )
                  }
                />

                <TableBody>
                  {dataFiltered
                    .slice(
                      table.page * table.rowsPerPage,
                      table.page * table.rowsPerPage + table.rowsPerPage
                    )
                    .map((row) => (
                      <RaccolteTableRow
                        key={row._id}
                        row={row}
                        selected={table.selected.includes(row._id)}
                        onSelectRow={() => table.onSelectRow(row._id)}
                        onEditRow={() => handleEditRow(row._id)}
                        onDeleteRow={() => handleDeleteRow(row._id)}
                      />
                    ))}

                  <TableEmptyRows
                    height={denseHeight}
                    emptyRows={emptyRows(table.page, table.rowsPerPage, tableData.length)}
                  />

                  <TableNoData notFound={notFound} />
                </TableBody>
              </Table>
            </Scrollbar>
          </TableContainer>

          <TablePaginationCustom
            count={dataFiltered.length}
            page={table.page}
            rowsPerPage={table.rowsPerPage}
            onPageChange={table.onChangePage}
            onRowsPerPageChange={table.onChangeRowsPerPage}
            //
            dense
          />
        </Card>
      </Container>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content={
          <>
            Sei sicuro di voler eliminare <strong> {table.selected.length} </strong> elementi?
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              handleDeleteRows();
              confirm.onFalse();
            }}
          >
            Elimina
          </Button>
        }
      />
    </>
  );
}

// ----------------------------------------------------------------------

function applyFilter({ inputData, comparator, filters }) {
  const { client, status, product, date } = filters;

  const stabilizedThis = inputData.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (client) {
    inputData = inputData.filter(
      (invoice) => invoice.client.toLowerCase().indexOf(client.toLowerCase()) !== -1
    );
  }

  if (status !== 'all') {
    inputData = inputData.filter((invoice) => invoice.status === status);
  }

  if (product.length) {
    inputData = inputData.filter((invoice) => product.includes(invoice.product));
  }

  if (date) {
    inputData = inputData.filter((invoice) => {
      const invoiceDate = new Date(invoice.date);
      const formattedInvoiceDate = new Date(
        invoiceDate.getFullYear(),
        invoiceDate.getMonth(),
        invoiceDate.getDate()
      );

      const selectedDate = new Date(date);
      const formattedSelectedDate = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate()
      );

      return formattedInvoiceDate.getTime() === formattedSelectedDate.getTime();
    });
  }

  return inputData;
}
