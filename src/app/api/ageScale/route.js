import path from 'path';  

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms)); 

// Return the predicted age as a string
export async function POST(request) { 
    if (request.method === 'POST') {  
        const filePath = await request.json();
    
    if (!filePath) {  
        return new Response('File path is required', { status: 400 });
    }
  
    try {
        await delay(1000);  
        
        // Read the file name from the file path  
        const fileName = path.basename(filePath);
        var age = '7';  

        // Return a hardcoded message 
        if (fileName === 'Chum_SCL_2001_01.tif') age = '5';
        else if (fileName === 'Chum_SCL_2001_02.tif') age = '6';
  
        // Parse the PDF content
        return new Response(age, { status: 200 });
    } catch (error) {
      console.error("Caught an outside error:", error);
      return new Response(error.message, { status: 500 });
    }
    } else {   
        return new Response(`Method ${req.method} Not Allowed`, { status: 405 });
    }  
}