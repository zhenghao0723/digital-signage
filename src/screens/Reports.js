import React from 'react'
import ReactTimeout from 'react-timeout'
import VideoCover from 'react-video-cover'

var timeout = [];
 
class LightSwitchExample extends React.Component {
  state = {
    on: false
  }
  toggle = () => {
    console.log('ff')
    this.setState({ on: !this.state.on })
  }
  handleClick = (e) => {
    timeout[0] = this.props.setTimeout(this.toggle, 2000) // call the `toggle` function after 5000ms
  }

  handleClearClick = (e) => {
    clearTimeout(timeout[0])
    timeout[0] = null
  }

  checking = (e) => {
    console.log(timeout[0])
  }

  render () {
    const videoOptions = {
      src: 'http://download.blender.org/peach/bigbuckbunny_movies/BigBuckBunny_320x180.mp4',
      ref: videoRef => {
        this.videoRef = videoRef;
      },
      onClick: () => {
        if (this.videoRef && this.videoRef.paused) {
          this.videoRef.play();
        } else if (this.videoRef) {
          this.videoRef.pause();
        }
      },
      title: 'click to play/pause',
    };

    return (
      <div style={{
        width: '300px',
        height: '300px',
        overflow: 'hidden',
      }}> 
      <video style={{ width: '100%'}}  autoPlay src={'http://download.blender.org/peach/bigbuckbunny_movies/BigBuckBunny_320x180.mp4'} type="video/mp4"></video>
      </div>
    )
  }
}
export default ReactTimeout(LightSwitchExample)