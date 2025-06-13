import React from 'react';
import './DataTable.css';

// this is our table that shows stuff
function DataTable(props) {
  // get stuff from props
  const {
    data = [],
    columns = [],
    loading = false,
    onSort,
    onFilter,
    onColumnToggle,
    visibleColumns = [],
    filters = {},
    sortConfig,
    pagination
  } = props;

  // show up or down arrow when we sort
  function showSortArrow(column) {
    if (!sortConfig || sortConfig.key !== column.key) {
      return '↕';
    }
    if (sortConfig.direction === 'asc') {
      return '↑';
    }
    return '↓';
  }

  // make different kinds of filter boxes
  function makeFilterBox(column) {
    if (!column.filter) {
      return null;
    }

    // text box
    if (column.filter.type === 'text') {
      return (
        <input
          key={column.key}
          type="text"
          placeholder={`Type to filter ${column.label}...`}
          value={filters[column.key] || ''}
          onChange={(e) => onFilter(column.key, e.target.value)}
          className="filter-box"
        />
      );
    }

    // slider
    if (column.filter.type === 'range') {
      return (
        <div key={column.key} className="slider-box">
          <input
            type="range"
            min={column.filter.min}
            max={column.filter.max}
            value={filters[column.key] || column.filter.min}
            onChange={(e) => onFilter(column.key, parseInt(e.target.value))}
          />
          <span>{filters[column.key] || column.filter.min}</span>
        </div>
      );
    }

    // dropdown
    if (column.filter.type === 'select') {
      return (
        <select
          key={column.key}
          value={filters[column.key] || ''}
          onChange={(e) => onFilter(column.key, e.target.value)}
          className="filter-box"
        >
          <option value="">All {column.label}</option>
          {column.filter.options.map(option => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      );
    }

    return null;
  }

  // show loading spinner
  function showLoading() {
    if (loading) {
      return (
        <div className="loading-screen">
          <div className="spinner"></div>
        </div>
      );
    }
    return null;
  }

  // show no data message
  function showNoData() {
    if (!loading && data.length === 0) {
      return (
        <div className="no-data">
          No data found
        </div>
      );
    }
    return null;
  }

  // show page controls
  function showPageControls() {
    if (!pagination) {
      return null;
    }

    return (
      <div className="page-controls">
        <div className="page-info">
          Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of {pagination.totalItems} rows
        </div>
        <div className="page-buttons">
          <select
            value={pagination.itemsPerPage}
            onChange={(e) => pagination.onItemsPerPageChange(Number(e.target.value))}
            className="page-size"
          >
            <option value="10">10 rows</option>
            <option value="20">20 rows</option>
            <option value="50">50 rows</option>
            <option value="100">100 rows</option>
          </select>
          <button
            onClick={() => pagination.onPageChange(1)}
            disabled={pagination.currentPage === 1}
            className="page-button"
          >
            First
          </button>
          <button
            onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
            disabled={pagination.currentPage === 1}
            className="page-button"
          >
            Previous
          </button>
          <span className="page-numbers">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
          <button
            onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
            disabled={pagination.currentPage === pagination.totalPages}
            className="page-button"
          >
            Next
          </button>
          <button
            onClick={() => pagination.onPageChange(pagination.totalPages)}
            disabled={pagination.currentPage === pagination.totalPages}
            className="page-button"
          >
            Last
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="my-table">
      <div className="filter-area">
        <div className="search-row">
          <input
            type="text"
            placeholder="Search anything..."
            value={filters.globalSearch || ''}
            onChange={(e) => onFilter('globalSearch', e.target.value)}
            className="search-box"
          />
        </div>
        <div className="filter-row">
          {columns.map(column => makeFilterBox(column))}
        </div>
      </div>

      <div className="column-buttons">
        {columns.map(column => (
          <label key={column.key} className="column-button">
            <input
              type="checkbox"
              checked={visibleColumns.includes(column.key)}
              onChange={() => onColumnToggle(column.key)}
            />
            {column.label}
          </label>
        ))}
      </div>

      <div className="table-area">
        <table>
          <thead>
            <tr>
              {columns
                .filter(col => visibleColumns.includes(col.key))
                .map(column => (
                  <th
                    key={column.key}
                    onClick={() => onSort(column.key)}
                    style={{ width: column.width }}
                  >
                    {column.label} {showSortArrow(column)}
                  </th>
                ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={row.id || index}>
                {columns
                  .filter(col => visibleColumns.includes(col.key))
                  .map(column => (
                    <td key={column.key}>
                      {row[column.key]}
                    </td>
                  ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showPageControls()}
      {showLoading()}
      {showNoData()}
    </div>
  );
}

export default DataTable; 