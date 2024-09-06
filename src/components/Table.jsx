import React from 'react';
import '../styles/Table.css';

const Table = ({ data, specialKeys, onRowClick, orderedColumns}) => {
    const headers = orderedColumns.filter(key => !specialKeys.includes(key));

    return (
        <table className="table table-hover">
            <thead>
                <tr>
                    {headers.map((key) => (
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
                        data-abandoned-stations={JSON.stringify(item.abandoned_stations)}
                        data-stratum={JSON.stringify(item.stratum)}
                        data-agency={JSON.stringify(item.agency)}
                        data-assigned-parameter={JSON.stringify(item.assigned_parameter)}
                        onClick={(e) => onRowClick(e.currentTarget)}
                    >
                        {headers.map((key, i) => (
                            <td key={i}>{item[key]}</td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default Table;
