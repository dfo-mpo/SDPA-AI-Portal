import styles from "./page.module.css";
import Header from "@/components/header";
import ToolCard from "@/components/toolCard";
import Banner from "@/components/banner";
import useTranslation from 'next-translate/useTranslation'; 

export default function Home() {
  const { t } = useTranslation('home');

  return (
    <div>
      <Header/>
      <Banner title={t('banner-title')} content={t('banner-content')} isMainBanner={true}/>
      <div className={styles.page}>
        <main className={styles.main}>
          <div className={styles.row}>
            <ToolCard title={t('scale-title')} content={t('scale-content')} link={t('common:link-scale')}/>
            <ToolCard title={t('fence-title')} content={t('fence-content')} link={t('common:link-fence')}/>
          </div>
        </main>
        {/* <footer className={styles.footer}>
          
        </footer> */}
      </div>
    </div>
    
  );
}
