'use client'

import React, { useState, useRef, useEffect } from 'react';
import styles from "./page.module.css";
import Header from "@/components/header";
import Banner from "@/components/banner";
import UploadContainer from "@/components/uploadContainer";
import LoadingOverlay from "@/components/loadingOverlay";
import useTranslation from 'next-translate/useTranslation'; 

export default function Scale() {
  const [isLoading, setIsLoading] = useState(false);
  const [scaleAge, setScaleAge] = useState(null);
  const [imagePath, setImagePath] = useState(null);
  const ageContainerRef = useRef(null);
  const { t } = useTranslation('scale');

  // Use API to process selected image, right now the API does not make an external request, instead it uses hard coded outputs
  const onUpload = async (filePath) => {
    setIsLoading(true);
    const response = await fetch("/api/ageScale", {  
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
      const age = await response.text(); 
      setScaleAge(age);
      setImagePath(`${filePath.split('.')[0]}.png`);
      setIsLoading(false);
    }  
  };

  useEffect(() => {
    window.scrollBy({
      top: ageContainerRef.current.getBoundingClientRect().top - window.pageYOffset,
      left: 0,
      behavior: 'smooth',
    });
  }, [scaleAge])

  return (
    <div>
      <Header/>
      <Banner title={t('banner-title')} content={t('banner-content')} page={t('common:menu-ageing')}/>
      <div className={styles.page}>
        <main className={styles.main}>
          <UploadContainer uploadTitle={t('upload-title')} selectTitle={t('select-title')} onUpload={onUpload}
            samples={['Chum_SCL_2001_01.tif', 'Chum_SCL_2001_02.tif', 'Chum_SCL_2001_03.tif']}/>
          <div ref={ageContainerRef} className={styles.container} style={{display: scaleAge? '' : 'none'}}>
            <h2>{`${t('responce-age')} ${scaleAge} ${t('responce-years')}`}</h2>
            <h2>{`${t('responce-species-GR')} ${scaleAge}1`}</h2>
          </div>
          <div className={styles.container} style={{display: scaleAge? '' : 'none'}}>
            <img src={imagePath} ></img>
          </div>
          {/* add container that toggles between visiable and renders text + image of selected */}
        </main>
        {/* <footer className={styles.footer}>
          
        </footer> */}
      </div>
      <LoadingOverlay active={isLoading}/>
      
    </div>
    
    
  );
}
