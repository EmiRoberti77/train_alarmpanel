import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { DataGrid, GridColDef, GridValueGetterParams, GridCellParams,GridRowParams } from '@mui/x-data-grid';
import { IconButton } from '@mui/material';
import { Delete, Edit, PlayArrow, Visibility } from '@mui/icons-material';
import { saveAs } from 'file-saver';
import './css/AlarmsComponentsDisplayLight.css';

// Interface for data
interface AlarmData {
  date: string;
  datetime: string;
  object_id: string;
  w: string;
  x: string;
  h: string;
  y: string;
  confidence: string;
  id: string;
  name: string;
  type: string;
  thumbnail_url: string;
  camera_name: string;
  duration: number;
}

// Interface for row data
interface RowData {
  id: number;
  trainid: string;
  thumbnail: string;
  camera: string;
  datetime: string;
  formattedDatetime: string;
  trainduration: number;
  trainstatus: string;
  cssClass7?: string;
  cssClass10?: string;
  cssClass15?: string;
}

// Column definitions for the data grid
const columns: GridColDef[] = [
  { field: 'id', 
    headerName: 'No', 
    headerClassName: 'header-style',
    flex: 0.3, 
  },
  { field: 'trainid', 
    headerName: 'ID', 
    headerClassName: 'header-style',
    flex: 0.5
    
  },

  { field: 'camera', 
    headerName: 'Camera', 
    flex: 2,
    headerClassName: 'header-style',
    renderCell: (params) => (
      <div className="main-cell">
        <span>{params.value}</span>
      </div>
    ),
  },
  { field: 'trainduration', 
    headerName: 'Duration', 
    headerClassName: 'header-style',
    flex: 0.5,
    renderCell: (params) => (
      <div className="main-cell">
        <span>{params.value}</span>
      </div>
    ),

  },
  {
    field: 'trainstatus',
    headerName: 'Status',
    description: 'This column has a value getter and is not sortable.',
    sortable: false,
    headerClassName: 'header-style',
    flex: 0.8,
    renderCell: (params) => (
      <div className="main-cell">
        <span>{params.value}</span>
      </div>
    ),
  },
  {
    field: 'formattedDatetime', 
    headerName: 'Arrival Date & Time',
    headerClassName: 'header-style',
    flex: 0.5,
  },
];

// Endpoint URL
const endpoint = (datetime: string) => `https://onh0agywna.execute-api.us-east-1.amazonaws.com/prod/alarms?datetime=${datetime}`;

export const AlarmsComponentDisplay: React.FC = () => {
  const [data, setData] = useState<AlarmData[]>([]);
  const [datetime, setDatetime] = useState<string>('');
  const gridRef = useRef<HTMLDivElement>(null);
  const [isConnected, setIsConnected] = useState<boolean>(true); // Added state for network status

  const fetchData = async () => {
    try {
      const twelveHoursAgo = new Date();
      twelveHoursAgo.setHours(twelveHoursAgo.getHours() - 24); // set in Hrs
      const formattedDateTime = twelveHoursAgo.toISOString();

      const result = await axios.get(endpoint(formattedDateTime));
      setData(result.data);
      setIsConnected(true); // Set network status to connected
    } catch (error) {
      setIsConnected(false); // Set network status to not connected
    }
  };


  // Fetching Data in 5s Interval
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => {
      clearInterval(interval);
    };
  }, []);





  const rows: RowData[] = data.map((item, index) => {

    const formattedDatetime = new Date(item.datetime).toLocaleString('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  


    const row: RowData = {
      id: index + 1,
      trainid: item.object_id,
      thumbnail: item.thumbnail_url,
      camera: item.camera_name,
      datetime: item.datetime,
       formattedDatetime: formattedDatetime,
      trainduration: item.duration,
      trainstatus: item.name,
      cssClass7: item.duration > 4 && item.duration < 10  ? 'yellow-row' : '',
      cssClass10: item.duration >10 && item.duration < 15 ? 'orange-row' : '',
      cssClass15: item.duration >15 ? 'red-row' : '',
    };

   

  return row;
  });

  //To Export CSV File of the Table
  const handleExportCsv = () => {
    const csvData = rows
      .map((row: any) => columns.map((column) => row[column.field as keyof typeof row]))
      .map((row) => row.join(','));

    const csvString = [columns.map((column) => column.headerName).join(','), ...csvData].join('\n');

    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8' });
    saveAs(blob,'Train Detection.csv');
  };

  // To adjust Row Height
  const rowHeight=100;

  // Alarm Row Selection
  const getRowClassName = (params: GridRowParams) => {
    const row = params.row as RowData;
    return row.cssClass10 || row.cssClass15 || row.cssClass7 || '';
  };
  

  return (
    <div >
      <div className='top-container'>
      <div className="status-bar" style={{ backgroundColor: isConnected ? 'green' : 'red' }}>Network Status</div>
      <div className="buttonContainer">
        <button className="button" onClick={handleExportCsv}>
          Export as CSV
        </button>
      </div>
      </div>

      <DataGrid
        rows={rows}
        rowHeight={rowHeight}
        columns={columns}
        getRowClassName={getRowClassName} // Apply row CSS class
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 5 },
          },
        }}
        pageSizeOptions={[5, 10]}
      />
    </div>
  );
};
