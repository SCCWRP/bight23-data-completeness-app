import React, { useState, useEffect } from 'react';
import Table from './components/Table';
import {StationDataModal, LoadingModal} from './components/Modals';
import DropdownSelector from './components/DropdownSelector';

// Styles
import './styles/generic.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/modal.css'; // Import the custom CSS for the modal

function App() {
    // Datatype options
    const [dtypes, setDtypes] = useState([]);
    const [dtype, setDtype] = useState('');

    // Grouping options
    const [groupings, setGroupings] = useState([]);
    const [grouping, setGrouping] = useState('');

    const [currentReport, setCurrentReport] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [stationData, setStationData] = useState({
        all_station_data: [],
        unfinished_station_data: [],
        finished_station_data: [],
    });
    const [mainOrderedColumns, setMainOrderedColumns] = useState([]);
    const [modalOrderedColumns, setModalOrderedColumns] = useState([]);
    const [loading, setLoading] = useState(false); // Loading state

    // Fetch Datatypes
    useEffect(() => {
        setLoading(true);
        fetch('dtypes') // Your API endpoint for fetching datatypes
            .then((response) => response.json())
            .then((data) => {
                setDtypes(data.dtypes);
                // Set current dtype to the first one if available
                if (data.dtypes.length > 0) {
                    setDtype(data.dtypes[0]);
                }
                setLoading(false);
            })
            .catch((error) => {
                console.error('Error:', error);
                setLoading(false);
            });
    }, []);

    // Fetch Groupings
    useEffect(() => {
        if (!dtype) return;

        setLoading(true);
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
                setLoading(false);
            })
            .catch((error) => {
                console.error('Error:', error);
                setLoading(false);
            });
    }, [dtype]);

    // Fetch data when dtype or grouping is changed
    useEffect(() => {
        if (!dtype || !grouping) return;

        setLoading(true);
        const params = new URLSearchParams({
            dtype,
            grouping,
        });

        fetch(`completeness-report-json?${params.toString()}`)
            .then((response) => response.json())
            .then((data) => {
                setCurrentReport(data.data);
                setMainOrderedColumns(data.ordered_columns);
                setLoading(false);
            })
            .catch((error) => {
                console.error('Error:', error);
                setLoading(false);
            });
    }, [dtype, grouping]);

    const handleRowClick = (row) => {
        setLoading(true);
        const postData = {
            all_stations: row.dataset.allStations,
            unfinished_stations: row.dataset.unfinishedStations,
            finished_stations: row.dataset.finishedStations,
        };

        fetch('station-data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(postData),
        })
        .then((response) => response.json())
        .then((data) => {
            setStationData({
                all_station_data: data.all_station_data,
                unfinished_station_data: data.unfinished_station_data,
                finished_station_data: data.finished_station_data,
            });
            setModalOrderedColumns(data.ordered_columns);
            setShowModal(true);
            setLoading(false);
        })
        .catch((error) => {
            console.error('Error:', error);
            setLoading(false);
        });
    };

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
                    <Table data={currentReport} specialKeys={specialKeys} onRowClick={handleRowClick} orderedColumns={mainOrderedColumns} />
                ) : (
                    <p>No data available</p>
                )}
            </div>
            <StationDataModal show={showModal} handleClose={() => setShowModal(false)} stationData={stationData} orderedColumns={modalOrderedColumns} />
            {loading && <LoadingModal />} {/* Show loading modal when loading */}
        </div>
    );
}

export default App;
