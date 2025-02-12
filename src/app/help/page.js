import React from 'react';
import path from 'path';  
import styles from "./page.module.css";
import Header from "@/components/header";
import Banner from "@/components/banner";
import useTranslation from 'next-translate/useTranslation'; 

export default function Help() {
  const { t } = useTranslation('help');

  // may create a scroll to top component
//   useEffect(() => {
//     window.scrollBy({
//       top: videoContainerRef.current.getBoundingClientRect().top - window.pageYOffset,
//       left: 0,
//       behavior: 'smooth',
//     });
//   }, [])

  return (
    <div>
      <Header/>
      <Banner title={t('banner-title')} content={t('banner-content')} page={t('common:menu-help')} 
        images={[]} bulletPoints={[t('banner-bullet1'), t('banner-bullet2'), t('banner-bullet3'), t('banner-bullet4')]}/>
      <div className={styles.page}>
        <main className={styles.main}>
          <h1>{t('home-title')}</h1>
          <h2>{t('home-ageing-header')}</h2>
          <div className={styles.container}>
            <p>{t('home-ageing-content')}</p>
          </div>
          <h2>{t('home-fence-header')}</h2>
          <div className={styles.container}>
            <p>{t('home-fence-content')}</p>
          </div>
        </main>
      </div>
    </div>
  );
}
