import logo from './logo.svg';
import './App.css';
import React, { useEffect, useState } from 'react';

function App() {
  const [data, setData] = useState(null);  
  const [error, setError] = useState(null);

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
      </div>  
  );  
}

export default App;
