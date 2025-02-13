'use client'

import React, { useState, useEffect } from 'react';
import { Breadcrumbs } from '@mui/material';
import styles from '../styles/banner.module.css';
import Link from 'next/link'
import useTranslation from 'next-translate/useTranslation'; 

function Banner({ title, content, page, isMainBanner = false, images = ['salmon.png'], bulletPoints = [] }) {
    const [bannerImg, setBannerImg] = useState(images[Math.floor(Math.random() * images.length)]);
    const { t } = useTranslation('common');

    const breadcrumbs = [
        <Link key="1" href={t('link-home')}>
            {t('menu-home')}
        </Link>,
        <p className={styles.primaryFont} key="1">
            {page}
        </p>
    ];

    return(
        isMainBanner? 
        <>
            <div className={styles.mainBanner}>
                <div className={styles.mainBannerContent}>
                    <div className={styles.info}>
                        <h1>{title}</h1>
                        <p>{content}<Link href={t('link-help')}>{t('link-help-content')}</Link></p>
                    </div>
                    {images.length >= 1 && <img src={`/imgs/${bannerImg}`} alt="Salmon" className={styles.mainBannerImage} />}
                </div>
            </div>
            <div className={`${styles.colourDivider} ${styles.grayDivider}`}/> 
            <div className={`${styles.colourDivider} ${styles.blueDivider}`}/> 
        </>
        :
        <>
            <div className={`${styles.banner} ${images.length >= 1? styles.bannerWithImg : styles.bannerWithoutImg}`}>
                <div className={styles.bannerContent}>
                    <div className={styles.info} style={{width: images.length >= 1? '' : '100%'}}>
                        <h1>{title}</h1>
                        <p>{content}</p>
                        {bulletPoints.length >= 1 &&
                        <ul className={styles.bulletPoints}>
                            {bulletPoints.map((bullet, index) => (
                                <li key={index}>
                                    {bullet}
                                </li>
                            ))}
                        </ul>
                        }

                    </div>
                    {images.length >= 1 && <img src={`/imgs/${bannerImg}`} alt="Salmon" className={styles.bannerImage} />}
                </div>
            </div>
            <div className={styles.breadcrumbContainer}>
                <Breadcrumbs separator={<img src='/icons/navigateNext.svg' alt=">" />} aria-label="breadcrumb">
                    {breadcrumbs}
                </Breadcrumbs>
            </div>
            <div className={styles.coloredDivider} />
        </>
    );
}
export default Banner;