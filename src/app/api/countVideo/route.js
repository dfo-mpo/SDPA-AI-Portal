import path from 'path';  

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms)); 

// Return the path to the processed video
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
        
        // Create file path for output video
        const outputPath = '/data/' + fileName.split('.')[0] + '-output.mp4';
  
        // Parse the PDF content
        return new Response(outputPath, { status: 200 });
    } catch (error) {
      console.error("Caught an outside error:", error);
      return new Response(error.message, { status: 500 });
    }
    } else {   
        return new Response(`Method ${req.method} Not Allowed`, { status: 405 });
    }  
}