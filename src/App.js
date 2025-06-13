import React, { useState, useEffect } from 'react';
import DataTable from './components/DataTable';
import './App.css';

// this is our main app that shows the table
function App() {
  // these are all the things we need to remember
  const [myData, setMyData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [myFilters, setMyFilters] = useState({
    globalSearch: '',
    id: '',
    name: '',
    email: '',
    role: '',
    age: '',
    company: ''
  });
  const [sortStuff, setSortStuff] = useState(null);
  const [visibleCols, setVisibleCols] = useState(['id', 'name', 'email', 'role', 'age', 'company']);
  const [pageStuff, setPageStuff] = useState({
    currentPage: 1,
    itemsPerPage: 20,
    totalItems: 0,
    totalPages: 0
  });

  // this tells us what columns to show
  const myColumns = [
    { key: 'id', label: 'ID', width: '80px', filter: { type: 'text' } },
    { key: 'name', label: 'Name', width: '200px', filter: { type: 'text' } },
    { key: 'email', label: 'Email', width: '250px', filter: { type: 'text' } },
    { key: 'role', label: 'Role', width: '150px', filter: { type: 'select', options: ['Admin', 'User', 'Manager', 'Guest'] } },
    { key: 'age', label: 'Age', width: '100px', filter: { type: 'range', min: 18, max: 100 } },
    { key: 'company', label: 'Company', width: '200px', filter: { type: 'text' } }
  ];

  // get data when we start
  useEffect(() => {
    loadData();
  }, []);

  // get data from the internet
  async function loadData() {
    try {
      setIsLoading(true);
      const response = await fetch('https://jsonplaceholder.typicode.com/users');
      const data = await response.json();
      
      // make lots of fake data
      const moreData = [];
      for (let i = 0; i < 1000; i++) {
        const user = data[i % data.length];
        moreData.push({
          id: i + 1,
          name: user.name,
          email: user.email,
          role: ['Admin', 'User', 'Manager', 'Guest'][Math.floor(Math.random() * 4)],
          age: Math.floor(Math.random() * 82) + 18,
          company: user.company.name
        });
      }
      
      setMyData(moreData);
      setPageStuff(prev => ({
        ...prev,
        totalItems: moreData.length,
        totalPages: Math.ceil(moreData.length / prev.itemsPerPage)
      }));
    } catch (error) {
      console.log('Oops! Something went wrong:', error);
    } finally {
      setIsLoading(false);
    }
  }

  // filter the data based on what user typed
  const filteredData = React.useMemo(() => {
    let result = [...myData];

    // look for text in all fields
    if (myFilters.globalSearch) {
      const searchText = myFilters.globalSearch.toLowerCase();
      result = result.filter(item => {
        for (let value of Object.values(item)) {
          if (String(value).toLowerCase().includes(searchText)) {
            return true;
          }
        }
        return false;
      });
    }

    // look for specific things in each column
    if (myFilters.id) {
      result = result.filter(item => String(item.id).includes(myFilters.id));
    }
    if (myFilters.name) {
      result = result.filter(item => item.name.toLowerCase().includes(myFilters.name.toLowerCase()));
    }
    if (myFilters.email) {
      result = result.filter(item => item.email.toLowerCase().includes(myFilters.email.toLowerCase()));
    }
    if (myFilters.role) {
      result = result.filter(item => item.role === myFilters.role);
    }
    if (myFilters.age) {
      result = result.filter(item => item.age === Number(myFilters.age));
    }
    if (myFilters.company) {
      result = result.filter(item => item.company.toLowerCase().includes(myFilters.company.toLowerCase()));
    }

    // sort the data if needed
    if (sortStuff) {
      result.sort((a, b) => {
        const aValue = a[sortStuff.key];
        const bValue = b[sortStuff.key];
        
        if (aValue < bValue) {
          return sortStuff.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortStuff.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    // update how many pages we have
    setPageStuff(prev => ({
      ...prev,
      totalItems: result.length,
      totalPages: Math.ceil(result.length / prev.itemsPerPage)
    }));

    return result;
  }, [myData, myFilters, sortStuff]);

  // get just the data for this page
  const pageData = React.useMemo(() => {
    const start = (pageStuff.currentPage - 1) * pageStuff.itemsPerPage;
    const end = start + pageStuff.itemsPerPage;
    return filteredData.slice(start, end);
  }, [filteredData, pageStuff.currentPage, pageStuff.itemsPerPage]);

  // when user clicks to sort
  function handleSort(key) {
    setSortStuff(prev => {
      if (prev?.key === key && prev.direction === 'asc') {
        return { key, direction: 'desc' };
      }
      return { key, direction: 'asc' };
    });
  }

  // when user types in a filter
  function handleFilter(key, value) {
    setMyFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setPageStuff(prev => ({
      ...prev,
      currentPage: 1
    }));
  }

  // when user shows/hides a column
  function handleColumnToggle(key) {
    setVisibleCols(prev => {
      if (prev.includes(key)) {
        return prev.filter(col => col !== key);
      }
      return [...prev, key];
    });
  }

  // when user changes page
  function handlePageChange(newPage) {
    setPageStuff(prev => ({
      ...prev,
      currentPage: newPage
    }));
  }

  // when user changes how many rows to show
  function handleItemsPerPageChange(newSize) {
    setPageStuff(prev => ({
      ...prev,
      itemsPerPage: newSize,
      currentPage: 1,
      totalPages: Math.ceil(prev.totalItems / newSize)
    }));
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>My Cool Data Table</h1>
      </header>
      <main className="app-main">
        <DataTable
          data={pageData}
          columns={myColumns}
          loading={isLoading}
          onSort={handleSort}
          onFilter={handleFilter}
          onColumnToggle={handleColumnToggle}
          visibleColumns={visibleCols}
          filters={myFilters}
          sortConfig={sortStuff}
          pagination={{
            currentPage: pageStuff.currentPage,
            itemsPerPage: pageStuff.itemsPerPage,
            totalItems: pageStuff.totalItems,
            totalPages: pageStuff.totalPages,
            onPageChange: handlePageChange,
            onItemsPerPageChange: handleItemsPerPageChange
          }}
        />
      </main>
    </div>
  );
}

export default App;


