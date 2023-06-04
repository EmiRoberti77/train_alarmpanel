import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { resourceLimits } from 'worker_threads';
import { DataGrid, GridColDef, GridValueGetterParams,GridCellParams } from '@mui/x-data-grid';
import { IconButton } from '@mui/material';
import { Delete, Edit, Visibility } from '@mui/icons-material';
import { saveAs } from 'file-saver';
import './css/AlarmComponent.css';


// Interface for datas
interface AlarmData {
  date:string;
  datetime:string;
  objectid:string;
  w:string;
  x:string;
  h:string;
  y:string;
  confidence:string;
  id:string;
  name:string;
  type:string;
}


//Interface for rowdata
interface RowData {
  trainid: string;
  thumbnail: string;
  camera: string;
  datetime: string;
  duration:string;
  trainstatus:string;
}


// This makes up the field were datas going to be displayed 
const columns: GridColDef[] = [
  { field: 'id', headerName: 'No', width: 70 },
  { field: 'trainid', headerName: 'ID', width: 70 },

  { field: 'thumbnail', 
    headerName: 'Preview', 
    width: 250,
    
    
    renderCell: (params) => (
    <img src={params.value} alt={`Thumbnail ${params.row.id}`} style={{ width: '100%', height: 'auto' }} />
  ), },

  { field: 'camera', 
  headerName: 'Camera', 
  width: 100},

  { field: 'datetime', 
    headerName: 'Arrival Date & Time', 
    width: 200 },
  {
    field: 'duration',
    headerName: 'Duration',
    width: 100,
  },
  // {
  //   field: 'overtime',
  //   headerName: ' Over Time',
  //   description: 'This column has a value getter and is not sortable.',
  //   sortable: false,
  //   width: 250,
  //   valueGetter: (params: GridValueGetterParams) =>
  //     `${params.row.duration - 15 }`,
  // },
  {
    field: 'trainstatus',
    headerName: ' Status',
    description: 'This column has a value getter and is not sortable.',
    sortable: false,
    width: 150,
    
  },
  {
    field: 'actions',
    headerName: 'Action',
    sortable: false,
    width: 150,
    renderCell: (params: GridCellParams) => (
      <>
        <IconButton aria-label="Delete">
          <Delete />
        </IconButton>
        <IconButton aria-label="Edit">
          <Edit />
        </IconButton>
        <IconButton aria-label="Preview">
          <Visibility />
        </IconButton>
      </>
    ),
  },
];


//Endpoints
const endpoint = (datetime:string) => `https://xn86efpkll.execute-api.us-east-1.amazonaws.com/prod/alarms?datetime=${datetime}`;


//grid row height
const rowHeight = 150;




//Main function
export const AlarmsComponent: React.FC = () => {

  const [data, setData] = useState<AlarmData[]>([]);
  const [datetime, setDatetime] = useState<string>('2023-05-29T12:00');

  
  //Fetch data to 'data'
  useEffect(() => {
    const fetchdata =  async () =>{ 
      const result = await axios.get(endpoint(datetime));
      console.log(result.data);
      setData( state => result.data);
    };

    fetchdata();

  }, []);

  

  
// set rows with the datas to respective field
  const rows: RowData[] = data.map((item,index) => ({
    
    // table row ID (needed for sorting)
    id: index + 1,
    // 
    trainid: item.objectid,
    thumbnail: 'https://www.thetimes.co.uk/imageserver/image/%2Fmethode%2Fsundaytimes%2Fprod%2Fweb%2Fbin%2F541a35de-f60d-11e6-82b6-6615ea199c33.jpg?crop=2041%2C1148%2C100%2C242&resize=1500',
    camera: 'Camera 12',
    datetime: item.datetime,
    duration:item.type,
    trainstatus:item.name,
    
  }));



  

  
// function to export the table grid as CSV
  const handleExportCsv = () => {
    const csvData = rows
      .map((row: any) => columns.map((column) => row[column.field as keyof typeof row]))
      .map((row) => row.join(','));

    const csvString = [
      columns.map((column) => column.headerName).join(','),
      ...csvData,
    ].join('\n');

    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8' });
    saveAs(blob, 'data.csv');
  };

  


  

  return (
    <div>
    {/* <table border={1}>
      <thead>
        <tr>
          <th>Thumbnail-2</th>
          <th>Camera</th>
          <th>Arrival time</th>
          <th>Status</th>
          <th>actions</th>
        </tr>
      </thead>
      <tbody>
        {data.map((item: AlarmData, index: number) => (
          <tr key={index}>
            <td>{item.objectid}</td>
            <td>Camera 12</td>
            <td>{item.datetime}</td>
            <td>{item.type}</td>
            <td>
              <button>clear alarm</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table> */}


    {/* Button */}

<div className='buttonContainer' style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem',marginTop: '1rem' }}>
        <button className='button' onClick={handleExportCsv}>Export as CSV</button>
      </div>

    {/* Table */}
    <DataGrid
        rows={rows}
        rowHeight={rowHeight} 
        columns={columns}
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