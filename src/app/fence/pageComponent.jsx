'use client'

import React, { useState, useRef, useEffect } from 'react';
import path from 'path';  
import styles from "./page.module.css";
import Header from "@/components/header";
import Banner from "@/components/banner";
import useTranslation from 'next-translate/useTranslation'; 
import UploadContainer from "@/components/uploadContainer";
import LoadingOverlay from "@/components/loadingOverlay";

function FenceComp() {
  const [isLoading, setIsLoading] = useState(false);
  const [outputPath, setOutputPath] = useState(null);
  const [uploadPath, setUploadPath] = useState(null);
  const videoContainerRef = useRef(null);
  const { t } = useTranslation('fence');

  // Use API to process selected image, right now the API does not make an external request, instead it uses hard coded outputs
  const onUpload = async (filePath) => {
    setIsLoading(true);
    setUploadPath('/data/'+path.basename(filePath));
    const response = await fetch("/api/countVideo", {  
      method: "POST",  
      headers: {  
        "Content-Type": "application/json",  
      },  
      body: JSON.stringify(filePath),  
    });  
  
    if (!response.ok) {  
      // can make error text apear on screen 
      throw new Error(response.statusText);  
    } else if (response.status === 203) {  
      console.log("No data");   
      // can make error text apear on screen 
    } else { 
      const processedPath = await response.text(); 
      
      setOutputPath(processedPath);
      setIsLoading(false);
    }  
  };

  useEffect(() => {
    if(videoContainerRef.current && outputPath) {
      window.scrollBy({
        top: videoContainerRef.current.getBoundingClientRect().top - window.pageYOffset,
        left: 0,
        behavior: 'smooth',
      });
    }
  }, [outputPath])

  return (
    <div>
      <Header/>
      <Banner title={t('banner-title')} content={t('banner-content')} page={t('common:menu-fence')} images={['salmon.png', 'sockeye.png']}/>
      <div className={styles.page}>
        <main className={styles.main}>
          <UploadContainer uploadTitle={t('upload-title')} selectTitle={t('select-title')} onUpload={onUpload}
            samples={['Sockeye-2s.mp4', 'Chinook-9s.mp4']}/>
          <div ref={videoContainerRef} className={`${styles.container} ${styles.videoContainer}`} style={{display: outputPath? '' : 'none'}}>
            <h2>{t('uploaded-title')}</h2>
            <video id="upload-video" width="100%" height="auto" controls src={uploadPath}>  
              Your browser does not support the video tag.  
            </video>
            <h2>{t('processed-title')}</h2>
            <video id="upload-video" width="100%" height="auto" controls src={outputPath}>  
              Your browser does not support the video tag.  
            </video>
          </div>
        </main>
      </div>
      <LoadingOverlay active={isLoading}/>
    </div>
  );
}

export default FenceComp;
