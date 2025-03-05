import logo from './logo.svg';
import './App.css';
import React, { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const [data, setData] = useState(null);  
  const [error, setError] = useState(null);
  const [file, setFile] = useState(null);  
  const [score, setScore] = useState(null);
  const [filePii, setFilePii] = useState(null);

  const handleFileChange = (event) => {  
    setFile(event.target.files[0]);  
  }; 

  const handleSubmit = async (event) => {  
    event.preventDefault();  
    const formData = new FormData();  
    formData.append('file', file);  
  
    const response = await fetch('http://localhost:8000/sensitivity_score/', {  
      method: 'POST',  
      body: formData  
    });  
  
    const data = await response.json();  
    setScore(data.sensitivity_score);  
  }; 

  const handleFileChangePII = (event) => {  
    setFilePii(event.target.files[0]);  
  }; 

  const handleSubmitPII = async (event) => {  
    event.preventDefault();  
    const formData = new FormData();  
    formData.append('file', file);  
  
    try {  
      const response = await axios.post('http://localhost:8000/pii_redact/', formData, {  
        responseType: 'blob', // Important to handle the response as a Blob  
      });  
  
      if (response.status === 200) {  
        const url = window.URL.createObjectURL(new Blob([response.data]));  
        const link = document.createElement('a');  
        link.href = url;  
        link.setAttribute('download', `redacted_${filePii.name}`); // Set download attribute  
        document.body.appendChild(link);  
        link.click();  
        link.remove();  
      } else {  
        console.error('Failed to download the redacted PDF');  
        alert('Failed to download the redacted PDF');  
      }  
    } catch (error) {  
      console.error('Error:', error);  
      alert('An error occurred while processing the file.');  
    }  
  }; 

  useEffect(() => {  
    const fetchData = async () => {  
      try {  
        const response = await fetch("http://localhost:8000/");  
        if (!response.ok) {  
          throw new Error(`HTTP error! status: ${response.status}`);  
        }  
        const data = await response.json();  
        setData(data);  
      } catch (error) {  
        setError(error.message);  
      }  
    };  

    fetchData(); 

  }, []);  

  return (  
      <div className="App">  
          <header className="App-header">  
            {error && <p>Error: {error}</p>}
            {data ? <p>{data.Hello}</p> : <p>Loading...</p>}  
          </header>
          <h1>Calculate Sensitivity Score</h1>  
          <form onSubmit={handleSubmit}>  
            <input type="file" onChange={handleFileChange} />  
            <button type="submit">Submit</button>  
          </form>  
          {score !== null && (  
            <div>  
              <h2>Sensitivity Score: {score}</h2>  
            </div>  
          )}
          <h1>PII Redaction</h1>  
          <form onSubmit={handleSubmitPII}>  
            <input type="file" onChange={handleFileChangePII} />  
            <button type="submit">Submit</button>  
          </form>  
          {/* {downloadfile !== null && (  
            <div>  
              <button>Download File</button>
            </div>  
          )} */}
      </div>  
  );  
}

export default App;
