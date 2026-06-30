/**
 * Shared DataGrid sx overrides for a clean, enterprise-grade table appearance.
 * Import and spread into any DataGrid's sx prop.
 */
export const cleanDataGridSx = {
  border: 'none',
  '& .MuiDataGrid-columnSeparator': { display: 'none !important' },
  '& [class*="columnSeparator"]': { display: 'none !important' },
  '& .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-columnHeader:focus-within': { outline: 'none !important' },
  '& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within': { outline: 'none !important' },
  '& .MuiDataGrid-cell': { borderBottom: '1px solid', borderColor: 'divider' },
  '& .MuiDataGrid-columnHeaders': { borderBottom: '1px solid', borderColor: 'divider' },
  '& .MuiDataGrid-footerContainer': { borderTop: '1px solid', borderColor: 'divider' },
};
