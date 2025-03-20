// /**
//  * Enhanced Video Player Component
//  * 
//  * A responsive video player with better controls and visual styling.
//  * Used across the application for displaying uploaded and processed videos.
//  */

// import React, { useState, useRef, useEffect } from 'react';
// import PropTypes from 'prop-types';
// import { 
//   Box, 
//   Typography, 
//   Paper, 
//   IconButton, 
//   Slider, 
//   Stack,
//   useTheme,
//   useMediaQuery,
//   Tooltip
// } from '@mui/material';
// import { 
//   PlayArrow, 
//   Pause, 
//   VolumeUp, 
//   VolumeOff,
//   Fullscreen,
//   FullscreenExit
// } from '@mui/icons-material';

// /**
//  * Format seconds into MM:SS format
//  * 
//  * @param {number} seconds - Time in seconds
//  * @returns {string} Formatted time string
//  */
// const formatTime = (seconds) => {
//   if (isNaN(seconds)) return '00:00';
//   const minutes = Math.floor(seconds / 60);
//   const remainingSeconds = Math.floor(seconds % 60);
//   return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
// };

// /**
//  * Enhanced video player component
//  * 
//  * @param {Object} props - Component props
//  * @param {string} props.src - Video source URL
//  * @param {string} props.title - Video title
//  * @param {string|number} props.width - Video width
//  * @param {string|number} props.height - Video height
//  * @param {boolean} props.autoPlay - Whether to autoplay the video
//  * @param {Function} props.onEnded - Callback for when video ends
//  * @returns {JSX.Element} The rendered component
//  */
// const EnhancedVideoPlayer = ({ 
//   src, 
//   title, 
//   width = "100%", 
//   height, 
//   autoPlay = false,
//   onEnded
// }) => {
//   const theme = useTheme();
//   const videoRef = useRef(null);
//   const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
//   // State for video controls
//   const [playing, setPlaying] = useState(autoPlay);
//   const [currentTime, setCurrentTime] = useState(0);
//   const [duration, setDuration] = useState(0);
//   const [volume, setVolume] = useState(1);
//   const [muted, setMuted] = useState(false);
//   const [fullscreen, setFullscreen] = useState(false);

//   /**
//    * Get component styles based on theme
//    * 
//    * @returns {Object} Style objects for the component
//    */
//   const getStyles = () => ({
//     container: {
//       width: width,
//       borderRadius: theme.shape.borderRadius,
//       overflow: 'hidden',
//       boxShadow: theme.shadows[2],
//       marginBottom: theme.spacing(4),
//       position: 'relative',
//       backgroundColor: '#000'
//     },
//     title: {
//       padding: theme.spacing(1.5, 2),
//       backgroundColor: theme.palette.primary.main,
//       color: theme.palette.primary.contrastText,
//       borderTopLeftRadius: theme.shape.borderRadius,
//       borderTopRightRadius: theme.shape.borderRadius
//     },
//     videoWrapper: {
//       position: 'relative',
//       paddingTop: '56.25%', // 16:9 aspect ratio
//       backgroundColor: '#000',
//       width: '100%',
//       overflow: 'hidden'
//     },
//     video: {
//       position: 'absolute',
//       top: 0,
//       left: 0,
//       width: '100%',
//       height: '100%',
//       objectFit: 'contain'
//     },
//     controls: {
//       padding: theme.spacing(1, 2),
//       backgroundColor: theme.palette.background.paper,
//       borderBottomLeftRadius: theme.shape.borderRadius,
//       borderBottomRightRadius: theme.shape.borderRadius,
//       display: 'flex',
//       alignItems: 'center',
//       gap: theme.spacing(1)
//     },
//     slider: {
//       flex: 1,
//       marginLeft: theme.spacing(1),
//       marginRight: theme.spacing(1),
//       color: theme.palette.primary.main
//     },
//     timeDisplay: {
//       fontSize: '0.75rem',
//       color: theme.palette.text.secondary,
//       minWidth: '70px',
//       textAlign: 'center'
//     },
//     rightControls: {
//       display: 'flex',
//       alignItems: 'center',
//       gap: theme.spacing(1)
//     },
//     volumeControl: {
//       width: 100,
//       marginLeft: theme.spacing(1),
//       marginRight: theme.spacing(1)
//     },
//     fullscreenWrapper: {
//       position: 'fixed',
//       top: 0,
//       left: 0,
//       right: 0,
//       bottom: 0,
//       backgroundColor: 'black',
//       zIndex: 9999,
//       display: 'flex',
//       flexDirection: 'column',
//       justifyContent: 'center'
//     },
//     fullscreenVideo: {
//       width: '100%',
//       maxHeight: '90vh',
//       objectFit: 'contain'
//     },
//     fullscreenControls: {
//       position: 'absolute',
//       bottom: 0,
//       left: 0,
//       right: 0,
//       backgroundColor: 'rgba(0,0,0,0.7)',
//       padding: theme.spacing(2),
//       display: 'flex',
//       alignItems: 'center',
//       gap: theme.spacing(1)
//     }
//   });

//   // Update current time during playback
//   useEffect(() => {
//     const video = videoRef.current;
    
//     if (!video) return;
    
//     // Set initial values
//     setDuration(video.duration || 0);
    
//     // Add event listeners
//     const handleTimeUpdate = () => setCurrentTime(video.currentTime);
//     const handleDurationChange = () => setDuration(video.duration);
//     const handleEnded = () => {
//       setPlaying(false);
//       if (onEnded) onEnded();
//     };
    
//     video.addEventListener('timeupdate', handleTimeUpdate);
//     video.addEventListener('durationchange', handleDurationChange);
//     video.addEventListener('ended', handleEnded);
    
//     return () => {
//       video.removeEventListener('timeupdate', handleTimeUpdate);
//       video.removeEventListener('durationchange', handleDurationChange);
//       video.removeEventListener('ended', handleEnded);
//     };
//   }, [onEnded]);
  
//   // Handle play/pause
//   useEffect(() => {
//     const video = videoRef.current;
//     if (!video) return;
    
//     if (playing) {
//       video.play().catch(() => setPlaying(false));
//     } else {
//       video.pause();
//     }
//   }, [playing]);
  
//   // Handle volume change
//   useEffect(() => {
//     const video = videoRef.current;
//     if (!video) return;
    
//     video.volume = muted ? 0 : volume;
//   }, [volume, muted]);
  
//   // Toggle play/pause
//   const handlePlayPause = () => setPlaying(!playing);
  
//   // Seek to position
//   const handleSeek = (_, value) => {
//     if (videoRef.current) {
//       videoRef.current.currentTime = value;
//       setCurrentTime(value);
//     }
//   };
  
//   // Volume control
//   const handleVolumeChange = (_, value) => setVolume(value);
//   const toggleMute = () => setMuted(!muted);
  
//   // Toggle fullscreen
//   const toggleFullscreen = () => setFullscreen(!fullscreen);
  
//   const styles = getStyles();
  
//   return (
//     <Paper sx={styles.container}>
//       {/* Title Bar */}
//       <Box sx={styles.title}>
//         <Typography variant="subtitle1" fontWeight="medium">
//           {title}
//         </Typography>
//       </Box>
      
//       {/* Video */}
//       <Box sx={styles.videoWrapper}>
//         <video
//           ref={videoRef}
//           src={src}
//           style={styles.video}
//           onClick={handlePlayPause}
//           onDoubleClick={toggleFullscreen}
//           preload="metadata"
//         />
//       </Box>
      
//       {/* Controls */}
//       <Box sx={styles.controls}>
//         {/* Play/Pause Button */}
//         <IconButton onClick={handlePlayPause} size="small">
//           {playing ? <Pause /> : <PlayArrow />}
//         </IconButton>
        
//         {/* Time Display */}
//         <Typography variant="caption" sx={styles.timeDisplay}>
//           {formatTime(currentTime)} / {formatTime(duration)}
//         </Typography>
        
//         {/* Progress Slider */}
//         <Slider
//           min={0}
//           max={duration || 100}
//           value={currentTime}
//           onChange={handleSeek}
//           sx={styles.slider}
//           size="small"
//         />
        
//         {/* Right Controls */}
//         <Stack direction="row" spacing={1} alignItems="center">
//           {/* Volume Controls (hide on mobile) */}
//           {!isMobile && (
//             <>
//               <IconButton onClick={toggleMute} size="small">
//                 {muted ? <VolumeOff /> : <VolumeUp />}
//               </IconButton>
              
//               <Slider
//                 min={0}
//                 max={1}
//                 step={0.01}
//                 value={muted ? 0 : volume}
//                 onChange={handleVolumeChange}
//                 sx={styles.volumeControl}
//                 size="small"
//               />
//             </>
//           )}
          
//           {/* Fullscreen Button */}
//           <Tooltip title={fullscreen ? "Exit Fullscreen" : "Fullscreen"}>
//             <IconButton onClick={toggleFullscreen} size="small">
//               {fullscreen ? <FullscreenExit /> : <Fullscreen />}
//             </IconButton>
//           </Tooltip>
//         </Stack>
//       </Box>
      
//       {/* Fullscreen Mode */}
//       {fullscreen && (
//         <Box sx={styles.fullscreenWrapper}>
//           <video
//             ref={videoRef}
//             src={src}
//             style={styles.fullscreenVideo}
//             onClick={handlePlayPause}
//             autoPlay={playing}
//           />
          
//           <Box sx={styles.fullscreenControls}>
//             <IconButton onClick={handlePlayPause} color="primary">
//               {playing ? <Pause /> : <PlayArrow />}
//             </IconButton>
            
//             <Typography color="white" sx={styles.timeDisplay}>
//               {formatTime(currentTime)} / {formatTime(duration)}
//             </Typography>
            
//             <Slider
//               min={0}
//               max={duration || 100}
//               value={currentTime}
//               onChange={handleSeek}
//               sx={{ ...styles.slider, color: 'white' }}
//             />
            
//             <IconButton onClick={toggleMute} color="primary">
//               {muted ? <VolumeOff /> : <VolumeUp />}
//             </IconButton>
            
//             <IconButton onClick={toggleFullscreen} color="primary">
//               <FullscreenExit />
//             </IconButton>
//           </Box>
//         </Box>
//       )}
//     </Paper>
//   );
// };

// EnhancedVideoPlayer.propTypes = {
//   /** Video source URL */
//   src: PropTypes.string.isRequired,
  
//   /** Video title to display */
//   title: PropTypes.string.isRequired,
  
//   /** Width of the video player */
//   width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  
//   /** Height of the video player */
//   height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  
//   /** Whether to autoplay the video */
//   autoPlay: PropTypes.bool,
  
//   /** Callback when the video ends */
//   onEnded: PropTypes.func
// };

// export default EnhancedVideoPlayer;