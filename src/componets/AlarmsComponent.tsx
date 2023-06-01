import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { resourceLimits } from 'worker_threads';

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

const endpoint = (datetime:string) => `https://ldjbfj10di.execute-api.us-east-1.amazonaws.com/prod/alarms?datetime=${datetime}`;

export const AlarmsComponent: React.FC = () => {

  const [data, setData] = useState<AlarmData[]>([]);
  //const [datetime, setDatetime] = useState<string>('2023-05-29T12:00');
  
  useEffect(() => {
    const fetchdata =  async () =>{ 
      const result = await axios.get('https://xn86efpkll.execute-api.us-east-1.amazonaws.com/prod/alarms');
      console.log(result.data);
      setData( state => result.data);
    };

    fetchdata();

  }, []);

  return (
    
    <table border={1}>
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
            <td>{item.name}</td>
            <td>Camera 12</td>
            <td>{item.datetime}</td>
            <td>{item.type}</td>
            <td>
              <button>clear alarm</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};