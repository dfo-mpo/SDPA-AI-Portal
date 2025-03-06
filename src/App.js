// import logo from './logo.svg';
import './App.css';
import React, { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const [data, setData] = useState(null);  
  const [error, setError] = useState(null);
  const [file, setFile] = useState(null);  
  const [score, setScore] = useState(null);
  const [filePii, setFilePii] = useState(null);
  const [downloadURL, setDownloadURL] = useState(null);
  const [fileScale, setFileScale] = useState(null);
  const [scaleOutput, setScaleOutput] = useState([null, null]);
  const [fileFence, setFileFence] = useState([null, null]);
  const [fenceOutput, setFenceOutput] = useState(null);
  const [fileTranslate, setFileTranslate] = useState(null);
  const [translateOutput, setTranslateOutput] = useState(null);

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
    formData.append('file', filePii);  
  
    try {  
      const response = await axios.post('http://localhost:8000/pii_redact/', formData, {  
        responseType: 'blob', // Important to handle the response as a Blob  
      });  
  
      if (response.status === 200) {  
        const url = window.URL.createObjectURL(new Blob([response.data]));  
        setDownloadURL(url); 
      } else {  
        console.error('Failed to download the redacted PDF');  
        alert('Failed to download the redacted PDF');  
      }  
    } catch (error) {  
      console.error('Error:', error);  
      alert('An error occurred while processing the file.');  
    }  
  };

  const handleFileChangeScale = (event) => {  
    setFileScale(event.target.files[0]);  
  }; 

  const handleSubmitScale = async (event) => {  
    event.preventDefault();  
    const formData = new FormData();  
    formData.append('file', fileScale);  
  
    try {
      let response = await fetch('http://localhost:8000/age_scale/', {  
        method: 'POST',  
        body: formData  
      });  
    
      const data = await response.json();
      let pngUrl = null
      
      response = await axios.post('http://localhost:8000/to_png/', formData, {    
        responseType: 'blob',  
      });
      
      if (response.status === 200) {
        pngUrl = window.URL.createObjectURL(new Blob([response.data]));  
      } else {  
        console.error('Failed to retrieve png');  
        alert('Failed to retrieve png');  
      } 

      setScaleOutput([data.age, pngUrl])
    } catch (error) {  
      console.error('Error:', error);  
      alert('An error occurred while processing the image.');  
    }   
  };

  const handleFileChangeFence = (event) => {
    const video = event.target.files[0];
    setFileFence([video,  window.URL.createObjectURL(video)]);  
  }; 

  const handleSubmitFence = async (event) => {  
    event.preventDefault();  
    const formData = new FormData();  
    formData.append('file', fileFence[0]);  
  
    try {
      const response = await axios.post('http://localhost:8000/fence_counting/', formData, {    
        responseType: 'blob',  
      }); 
      
      if (response.status === 200) {
        const videoUrl = window.URL.createObjectURL(new Blob([response.data]));
        setFenceOutput(videoUrl)
      } else {  
        console.error('Failed to retrieve processed video');  
        alert('Failed to retrieve processed video');  
      }
    } catch (error) {  
      console.error('Error:', error);  
      alert('An error occurred while processing the image.');  
    }   
  };

  const handleFileChangeTranslate = (event) => {
    setFileTranslate(event.target.files[0]);  
  }; 

  const handleSubmitTranslate = async (event) => {  
    event.preventDefault();  
    const formData = new FormData();  
    formData.append('file', fileTranslate);  
  
    try {
      const response = await fetch('http://localhost:8000/pdf_to_french/', {  
        method: 'POST',  
        body: formData  
      });

      if (response.status === 200) {
        const data = await response.json();  
        setTranslateOutput(data.translation);
      } else {  
        console.error('Failed to retrieve translated text');  
        alert('Failed to retrieve translated text');  
      }
    } catch (error) {  
      console.error('Error:', error);  
      alert('An error occurred while processing the pdf.');  
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
          {downloadURL !== null && (  
            <a href={downloadURL} download={`redacted_${filePii? filePii.name : 'None'}`}>  
              <button>Download File</button>
            </a>  
          )}
          <h1>Age Scale</h1>  
          <form onSubmit={handleSubmitScale}>  
            <input type="file" onChange={handleFileChangeScale} />  
            <button type="submit">Submit</button>  
          </form>  
          {scaleOutput[0] !== null && (
            <div>  
              <h2>Scale Age: {scaleOutput[0]}</h2>
              <img src={scaleOutput[1]} alt='Image failed to render' style={{width: '300px'}}/>
            </div>  
          )}
          <h1>Fence Count</h1>  
          <form onSubmit={handleSubmitFence}>  
            <input type="file" onChange={handleFileChangeFence} />  
            <button type="submit">Submit</button>  
          </form>  
          {fenceOutput !== null && (
            <div>  
              <h2>Uploaded Video</h2>
              <video src={fileFence[1]} width="300px" controls/>
              <h2>Processed Video</h2>
              <video src={fenceOutput} width="300px" controls/>
            </div>  
          )}
          <h1>French Transalations</h1>  
          <form onSubmit={handleSubmitTranslate}>  
            <input type="file" onChange={handleFileChangeTranslate} />  
            <button type="submit">Submit</button>  
          </form>  
          {translateOutput !== null && (
            <div>
              <h2>Text in French</h2>
              <p>{translateOutput}</p>
            </div>  
          )}
      </div>  
  );  
}

export default App;
