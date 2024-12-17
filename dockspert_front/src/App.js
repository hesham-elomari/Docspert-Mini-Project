import './App.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ImportFiles from "./ImportFiles/ImportFiles";
import TransferFunds from './TransferFunds/TransferFunds';
import Layout from './Layout/Layout';
import DisplayAll from './DisplayAll/DisplayAll';
import DisplayDetails from './DisplayDetails/DisplayDetails';


function App() {
  return (
    
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<ImportFiles />} />
          <Route path="transfer" element={<TransferFunds />} />
          <Route path="displayall" element={<DisplayAll />} />
          <Route path="display" element={<DisplayDetails />} />
          
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
