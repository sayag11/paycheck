var React = require('react');

var Header = require('./Components/Header');
var Auth = require('./Components/Auth');
var Content = require('./Components/Content');
var DataTable = require('react-data-components').DataTable;

var columns = [
    { title: 'Date', prop: 'date'  },
    { title: 'Time', prop: 'time' },
    { title: 'Total', prop: 'total' },
];

var data = [
    { date: '01/01/2016', time: '9:00 AM to 3:00 PM', total: '1'},
    // It also supports arrays
    // [ 'name value', 'city value', 'address value', 'phone value' ]
];


module.exports = React.createClass({
  displayName: 'App',

  render: function () {
    return (<div>
              <Header/>
              <Auth/>
            </div>)
  }
});

<DataTable
    className="container"
    keys={[ 'date', 'time','total' ]}
    columns={columns}
    initialData={data}
    initialData={data}
    initialPageLength={5}
    initialSortBy={{ prop: 'date', order: 'descending' }}
    pageLengthOptions={[ 5, 20, 50 ]}
/>