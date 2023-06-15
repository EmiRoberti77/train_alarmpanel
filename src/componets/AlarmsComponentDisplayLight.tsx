import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { DataGrid, GridColDef, GridValueGetterParams, GridCellParams,GridRowParams } from '@mui/x-data-grid';
import { IconButton } from '@mui/material';
import { Delete, Edit, PlayArrow, Visibility } from '@mui/icons-material';
import { saveAs } from 'file-saver';
import './css/AlarmComponent.css';

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
  trainduration: number;
  trainstatus: string;
  cssClass10?: string;
  cssClass15?: string;
}

// Column definitions for the data grid
const columns: GridColDef[] = [
  { field: 'id', headerName: 'No', flex: 0.3 },
  { field: 'trainid', headerName: 'ID', flex: 0.2 },
  {
    field: 'thumbnail',
    headerName: 'Preview',
    renderCell: (params) => (
      <img
        src={params.value}
        alt={`Thumbnail ${params.row.id}`}
        style={{ width: '100%', height: 'auto' }}
        // ref={(img) => {
        //   if (img) {
        //     // Calculate the height of the thumbnail and adjust the row height
        //     const rowElement = img.closest('.MuiDataGrid-row') as HTMLElement;
        //     if (rowElement) {
        //       const thumbnailHeight = img.offsetHeight;
        //       const currentRowHeight = rowElement.offsetHeight;
        //       if (thumbnailHeight > currentRowHeight) {
        //         rowElement.style.height = `${thumbnailHeight}px`;
        //       }
        //     }
        //   }
        // }}
      />
    ),
    flex: 0.9,
  },
  { field: 'camera', headerName: 'Camera', flex: 0.7 },
  { field: 'datetime', headerName: 'Arrival Date & Time', flex: 1.7 },
  { field: 'trainduration', headerName: 'Duration', flex: 0.7 },
  {
    field: 'trainstatus',
    headerName: 'Status',
    description: 'This column has a value getter and is not sortable.',
    sortable: false,
    flex: 0.8
  },
  {
    field: 'actions',
    headerName: 'Action',
    sortable: false,
    renderCell: (params: GridCellParams) => (
      <>
        <IconButton aria-label="Delete">
          <Delete />
        </IconButton>
        <IconButton aria-label="Play">
          <PlayArrow />
        </IconButton>
      </>
    ),
    flex: 1
  },
];

// Endpoint URL
const endpoint = (datetime: string) => `https://onh0agywna.execute-api.us-east-1.amazonaws.com/prod/alarms?datetime=${datetime}`;

export const AlarmsComponentDisplay: React.FC = () => {
  const [data, setData] = useState<AlarmData[]>([]);
  const [datetime, setDatetime] = useState<string>('');
  const gridRef = useRef<HTMLDivElement>(null);

  const fetchData = async () => {
    const twelveHoursAgo = new Date();
    twelveHoursAgo.setHours(twelveHoursAgo.getHours() - 2); // set in Hrs
    const formattedDateTime = twelveHoursAgo.toISOString();

    const result = await axios.get(endpoint(formattedDateTime));
    setData(result.data);
  };


  // Fetching Data in 5s Interval
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  
  // //Alarm sound Stack
  // useEffect(() => {
  //   // Check for duration equal to 0 and play alarm sound
  //   const alarmData = data.find((item) => item.duration === 0);
  //   if (alarmData) {
  //     // Play the alarm sound here
  //     playAlarmSound();
  //   }
  // }, [data]);

  // const playAlarmSound = () => {
  //   const alarmSound = new Audio('/alarm.wav');
  //   alarmSound.play();
  // };


  const rows: RowData[] = data.map((item, index) => {
    const row: RowData = {
      id: index + 1,
      trainid: item.object_id,
      thumbnail: item.thumbnail_url,
      camera: item.camera_name,
      datetime: item.datetime,
      trainduration: item.duration,
      trainstatus: item.name,
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
    saveAs(blob, 'data.csv');
  };

  // To adjust Row Height
  const rowHeight=80;

  // Alarm Row Selection
  const getRowClassName = (params: GridRowParams) => {
    const row = params.row as RowData;
    return row.cssClass10 || row.cssClass15 || '';
  };
  

  return (
    <div>
      <div className="buttonContainer" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem', marginTop: '1rem' }}>
        <button className="button" onClick={handleExportCsv}>
          Export as CSV
        </button>
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
        checkboxSelection
      />
    </div>
  );
};
