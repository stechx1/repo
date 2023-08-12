import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Dropdown = ({selectedSheetChanged}) => {
  const [sheetNames, setSheetNames] = useState([]);
  const [selectedSheet, setSelectedSheet] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('');

  const handleSheetSelect = (event) => {
    setSelectedSheet(event.target.value);
  };

  const Alert = ({ message ,type}) => {
    return <div className={`AlertContainer ${type}`}>{message}</div>;
  };

  useEffect(() => {
    axios.get('http://localhost:8000/api/sheetNames')
    .then((response) => {
      console.log(response);
      setSheetNames(response.data.sheetNames);
    })
    .catch((error) => {
    //   // Handle any errors
    });
    }, []);
   

  const handleSheetLoad = () => {
    if (sheetNames.includes(selectedSheet)) {
      // The selected sheet is valid, load it
      axios.get(`http://localhost:8000/api/sheet/${encodeURIComponent(selectedSheet)}`, {
        params: {
          sheetName: selectedSheet
        }
      })
        .then((response) => {
          // Handle the response with the selected sheet data in the backend
          selectedSheetChanged(selectedSheet);
          setShowAlert(true);
          setAlertMessage(`${selectedSheet} Loaded successfully!`);
          setAlertType('success');
          console.log('Selected Sheet Data:', response.data.sheetData);
        })
        .catch((error) => {
          setShowAlert(true);
          setAlertMessage('Data Loaded unsuccessfully!');
          setAlertType('error');
           // Handle any errors
        });
    } else {
      setAlertMessage('Invalid sheet selection');
      setAlertType('error');// The selected sheet is not valid
      console.log('Invalid sheet selection');
    }
      
  }; 

  return (
    <div>
    <div className="menu">

<select className='dropdown' value={selectedSheet} onChange={handleSheetSelect}>

<option value="">Select a sheet</option>
    {sheetNames.map((sheetNames) => (
    <option key={sheetNames} value={sheetNames}>
    {sheetNames}
    </option>
 ))}

 </select>
 <button className ='Loadbutton' onClick={handleSheetLoad}>Load Sheet</button>
    </div>
    {showAlert && <Alert message={alertMessage} type={alertType} />}
    </div>
  );
};

export default Dropdown;