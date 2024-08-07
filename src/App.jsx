import React, { useState, useEffect } from 'react';
import Table from './components/Table';
import DropdownSelector from './components/DropdownSelector';

// Styles
import './styles/generic.css';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
    // Datatype options
    const [dtypes, setDtypes] = useState([]);
    const [dtype, setDtype] = useState('');

    // Grouping options
    const [groupings, setGroupings] = useState([]);
    const [grouping, setGrouping] = useState('');

    const [currentReport, setCurrentReport] = useState([]);

    // Fetch Datatypes
    useEffect(() => {
        fetch('dtypes') // Your API endpoint for fetching datatypes
            .then((response) => response.json())
            .then((data) => {
                setDtypes(data.dtypes);
                // Set current dtype to the first one if available
                if (data.dtypes.length > 0) {
                    setDtype(data.dtypes[0]);
                }
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    }, []);

    // Fetch Groupings
    useEffect(() => {
        if (!dtype) return;

        const params = new URLSearchParams({ dtype });

        fetch(`groupings?${params.toString()}`) // Your API endpoint for fetching groupings
            .then((response) => response.json())
            .then((data) => {
                setGroupings(data.groupings);
                // Set current grouping to the first one if available
                if (data.groupings.length > 0) {
                    setGrouping(data.groupings[0]);
                } else {
                    setGrouping(''); // Clear grouping if no groupings are available
                }
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    }, [dtype]);

    // Fetch data when dtype or grouping is changed
    useEffect(() => {
        if (!dtype || !grouping) return;

        const params = new URLSearchParams({
            dtype,
            grouping,
        });

        fetch(`completeness-report-json?${params.toString()}`)
            .then((response) => response.json())
            .then((data) => {
                console.log(data.data);
                setCurrentReport(data.data);
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    }, [dtype, grouping]);

    const specialKeys = ['row_id', 'all_stations', 'finished_stations', 'unfinished_stations'];

    return (
        <div className="container">
            <h1>Data Report</h1>
            <div className="row mb-3">
                <div className="col-md-6">
                    <label htmlFor="dtype-select">Select Datatype:</label>
                    {dtypes.length > 0 && (
                        <DropdownSelector
                            id="dtype-select"
                            options={dtypes}
                            selectedOption={dtype}
                            onSelectOption={(e) => setDtype(e.target.value)}
                            onChange={(e) => setDtype(e.target.value)}
                        />
                    )}
                </div>
                <div className="col-md-6">
                    <label htmlFor="grouping-select">Select Grouping:</label>
                    {groupings.length > 0 && (
                        <DropdownSelector
                            id="grouping-select"
                            options={groupings}
                            selectedOption={grouping}
                            onSelectOption={(e) => setGrouping(e.target.value)}
                            onChange={(e) => setGrouping(e.target.value)}
                        />
                    )}
                </div>
            </div>
            <div>
                {currentReport.length > 0 ? (
                    <Table data={currentReport} specialKeys={specialKeys} />
                ) : (
                    <p>No data available</p>
                )}
            </div>
        </div>
    );
}

export default App;
