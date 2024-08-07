import React from 'react';
import { Modal, Tab, Tabs } from 'react-bootstrap';

const StationDataModal = ({ show, handleClose, stationData, orderedColumns }) => {
    const { all_station_data, unfinished_station_data, finished_station_data } = stationData;

    const renderTable = (data) => {
        if (!data || data.length === 0) return <p>No data available</p>;

        const headers = orderedColumns;

        return (
            <table className="table">
                <thead>
                    <tr>
                        {headers.map((header, index) => (
                            <th key={index}>{header}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                            {headers.map((header, index) => (
                                <td key={index}>{row[header]}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    };

    return (
        <Modal show={show} onHide={handleClose} size="xl" className="station-data-modal">
            <Modal.Header closeButton>
                <Modal.Title>Station Data</Modal.Title>
            </Modal.Header>
            <Modal.Body className="station-data-modal-body">
                <Tabs defaultActiveKey="all_stations">
                    <Tab eventKey="all_stations" title="All Stations">
                        <div className="table-responsive">{renderTable(all_station_data)}</div>
                    </Tab>
                    <Tab eventKey="unfinished_stations" title="Unfinished Stations">
                        <div className="table-responsive">{renderTable(unfinished_station_data)}</div>
                    </Tab>
                    <Tab eventKey="finished_stations" title="Finished Stations">
                        <div className="table-responsive">{renderTable(finished_station_data)}</div>
                    </Tab>
                </Tabs>
            </Modal.Body>
        </Modal>
    );
};

export default StationDataModal;
