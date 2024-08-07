import React, { useState, useEffect } from 'react';
import Table from './components/Table';
import { StationDataModal, LoadingModal } from './components/Modals';
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

    const [modalTitle, setModalTitle] = useState(''); // Modal title state

    // Fetch Datatypes
    useEffect(() => {
        const fetchDtypes = async () => {
            setLoading(true);
            try {
                const response = await fetch('dtypes'); // Your API endpoint for fetching datatypes
                const data = await response.json();
                setDtypes(data.dtypes);
                // Set current dtype to the first one if available
                if (data.dtypes.length > 0) {
                    setDtype(data.dtypes[0]);
                }
            } catch (error) {
                console.error('Error:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDtypes();
    }, []);

    // Fetch Groupings
    useEffect(() => {
        if (!dtype) return;

        const fetchGroupings = async () => {
            setLoading(true);
            const params = new URLSearchParams({ dtype });

            try {
                const response = await fetch(`groupings?${params.toString()}`); // Your API endpoint for fetching groupings
                const data = await response.json();
                setGroupings(data.groupings);
                // Set current grouping to the first one if available
                if (data.groupings.length > 0) {
                    setGrouping(data.groupings[0]);
                } else {
                    setGrouping(''); // Clear grouping if no groupings are available
                }
            } catch (error) {
                console.error('Error:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchGroupings();
    }, [dtype]);

    // Fetch data when dtype or grouping is changed
    useEffect(() => {
        if (!dtype || !grouping) return;

        const fetchReport = async () => {
            setLoading(true);
            const params = new URLSearchParams({
                dtype,
                grouping,
            });

            try {
                const response = await fetch(`completeness-report-json?${params.toString()}`);
                const data = await response.json();
                setCurrentReport(data.data);
                setMainOrderedColumns(data.ordered_columns);
            } catch (error) {
                console.error('Error:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchReport();
    }, [dtype, grouping]);

    const handleRowClick = async (row) => {
        setLoading(true);
        const postData = {
            all_stations: row.dataset.allStations,
            unfinished_stations: row.dataset.unfinishedStations,
            finished_stations: row.dataset.finishedStations,
        };

        const groupingValue = row.dataset[grouping];
        const assignedParameter = row.dataset.assignedParameter;


        try {
            const response = await fetch('station-data', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(postData),
            });
            const data = await response.json();
            setStationData({
                all_station_data: data.all_station_data,
                unfinished_station_data: data.unfinished_station_data,
                finished_station_data: data.finished_station_data,
            });
            setModalOrderedColumns(data.ordered_columns);
            setModalTitle(`Station Data for ${groupingValue} for the parameter ${assignedParameter}`);
            setShowModal(true);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const specialKeys = ['row_id', 'all_stations', 'finished_stations', 'unfinished_stations'];

    return (
        <div className="container">
            <h1>Bight '23 Data Completeness Report</h1>
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
            <br />
            <h6>(You may click on rows of the table for more detailed information)</h6>
            <br />
            <div>
                {currentReport.length > 0 ? (
                    <Table data={currentReport} specialKeys={specialKeys} onRowClick={handleRowClick} orderedColumns={mainOrderedColumns} />
                ) : (
                    <p>No data available</p>
                )}
            </div>
            <StationDataModal show={showModal} handleClose={() => setShowModal(false)} stationData={stationData} orderedColumns={modalOrderedColumns} title={modalTitle}/>
            {loading && <LoadingModal />} {/* Show loading modal when loading */}
        </div>
    );
}

export default App;
