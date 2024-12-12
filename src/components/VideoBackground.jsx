import backgroundVideo from './vid/background.mp4'
import './styles/video-background.css'

function VideoBackground() {
  return (
    <div className="video-container">
      <video autoPlay muted loop className="background-video">
        <source src={backgroundVideo} type="video/mp4" />
      </video>
    </div>
  )
}

export default VideoBackground 