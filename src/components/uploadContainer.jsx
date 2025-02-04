'use client'

import React, { useState } from 'react';
import { Button } from '@mui/material';
import styles from '../styles/uploadContainer.module.css';
import useTranslation from 'next-translate/useTranslation'; 

function UploadContainer({uploadTitle, selectTitle, samples, onUpload}) {
    const [isSelectOpen, setSelectOpen] = useState(false); 
    const [selectedExample, setSelectedExample] = useState(''); 
    const { t, lang } = useTranslation('common');

    const onChoose = () => {
        setSelectOpen(true);
    };

    const runAnalysis = () => {
        setSelectOpen(false);
        onUpload(selectedExample);
    };

    return(
        <>
            <div className={styles.form}>
                <h3 className={styles.uploadTitle}>{uploadTitle}</h3>
                <div className={styles.inputBox}>
                    <button className={styles.chooseBtn} onClick={onChoose}>{t('upload-choose')}</button>
                    <p>{selectedExample === ''? t('upload-docName') : selectedExample.split(/[/]+/).pop()}</p>
                </div>
            </div>
            <div className={`${styles.form} ${isSelectOpen? '' : styles.hidden}`}>
                <h3 className={styles.uploadTitle}>{selectTitle}</h3>
                <div className={`${styles.exampleDocuments} ${samples.length < 3? styles.lessExamples: ''}`}>
                    {samples && samples.map((sample, index) => (
                        <div key={index} className={selectedExample.split(/[/]+/).pop() === sample? '' : styles.thumbnailBtnWrapper} style={{cursor: selectedExample.split(/[/]+/).pop() === sample? 'not-allowed' : ''}}>
                            <Button className={`${styles.thumbnailBtn} ${samples.length < 3? styles.wideThumnailBtn: ''} ${selectedExample.split(/[/]+/).pop() === sample? styles.thumbnailBtnSelected : ''}`} 
                                disabled={selectedExample.split(/[/]+/).pop() === sample} onClick={() => {setSelectedExample(`/imgs/${sample}`);}}>
                                <img src={`/imgs/${sample.split('.')[0]}.png`} draggable="false" alt="Example Image"/>
                                <div className={lang === 'fr'? samples.length < 3? styles.leftShiftWide : styles.leftShift : ''}><p>{t('upload-sample')}</p></div>
                                <p>{sample}</p>
                            </Button>
                        </div>
                    ))}
                </div>
                <Button id={styles.uploadBtn} onClick={runAnalysis} disabled={selectedExample === ''} variant="text">{t('upload-document')}</Button>
            </div>
        </>
        
    );
}
export default UploadContainer;