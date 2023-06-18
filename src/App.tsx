import React from 'react';
import './App.css';
import { AlarmsComponent } from './componets/AlarmsComponent';
import { AlarmsComponentDisplay } from './componets/AlarmsComponentDisplayLight';

function App() {
  return (
    <div className="App">
      {/* <AlarmsComponent /> */}
      <AlarmsComponentDisplay/>
    </div>
  );
  //emi
}

export default App;
