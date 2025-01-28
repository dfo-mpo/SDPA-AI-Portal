import React from 'react';
import { Card, CardActionArea, CardContent, Typography, CardMedia } from '@mui/material';
import styles from '../styles/toolCard.module.css';
import Link from 'next/link'

function ToolCard({ title, content, link }) {

    return(
        <Card className={styles.card}>
            <Link href={link} passHref>
                <CardActionArea>
                    
                    {/* <CardMedia
                    component="img"
                    height="140"
                    image="/static/images/cards/contemplative-reptile.jpg"
                    alt="green iguana"
                    /> */}
                    <CardContent>
                        <Typography gutterBottom variant="h5" component="div">{title}</Typography>
                        <Typography component="p">{content}</Typography>
                    </CardContent>
                </CardActionArea>
            </Link>
        </Card>
    );
}
export default ToolCard;