import React from 'react';
import '../styles/Table.css';

const Table = ({ data, specialKeys }) => {
    const handleRowClick = (row) => {
        const postData = {
            all_stations: JSON.parse(row.dataset.allStations),
            unfinished_stations: JSON.parse(row.dataset.unfinishedStations),
            finished_stations: JSON.parse(row.dataset.finishedStations),
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
            console.log('Success:', data);
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    };

    const orderedKeys = Object.keys(data[0]).filter(key => !specialKeys.includes(key));

    return (
        <table className="table table-hover">
            <thead>
                <tr>
                    {orderedKeys.map((key) => (
                        <th key={key}>{key}</th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {data.map((item, index) => (
                    <tr
                        key={index}
                        data-row-id={item.row_id}
                        data-all-stations={JSON.stringify(item.all_stations)}
                        data-finished-stations={JSON.stringify(item.finished_stations)}
                        data-unfinished-stations={JSON.stringify(item.unfinished_stations)}
                        onClick={(e) => handleRowClick(e.currentTarget)}
                    >
                        {orderedKeys.map((key, i) => (
                            <td key={i}>{item[key]}</td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default Table;
