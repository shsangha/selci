import React, { Component, createRef } from "react"
import {
  Scene,
  OrthographicCamera,
  WebGLRenderer,
  VideoTexture,
  LinearFilter,
  RGBFormat,
  Mesh,
  PlaneBufferGeometry,
  MeshBasicMaterial,
  ShaderMaterial,
  WebGLRenderTarget,
  Vector2,
} from "three"
import styles from "./style.module.scss"
import Footer from '../Footer'
import videoSrc from "../../../public/video/intro.mp4"

const fragmentShader = `uniform vec2 res;
uniform sampler2D bufferTexture;
uniform sampler2D videoTexture;
uniform float time;
void main() {
  vec2 st = gl_FragCoord.xy / res;
  vec2 uv = st;

  vec4 sum = texture2D(bufferTexture, uv);
  vec4 src = texture2D(videoTexture, uv);
  sum.rgb = mix(sum.rbg, src.rgb, 0.02);
  gl_FragColor = sum;
   
 }
`
const vertexShader = `void main() {
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0 );
  gl_Position = projectionMatrix * mvPosition;
}`

export default class AnimatedIndex extends Component {
  videoRef = createRef()
  canvasRef = createRef()
  animationFrameId
  camera;
  renderer;

  componentWillUnmount() {
    // to prevent mem leaks
    cancelAnimationFrame(this.animationFrameId)
    window.removeEventListener('resize', this.handleResize)
  }

  componentDidMount() {


    const scene = new Scene()
    const canvasEl = this.canvasRef.current

    const width = window.innerWidth
    const height = window.innerHeight

     let camera = new OrthographicCamera(
      width / -2,
      width / 2,
      height / 2,
      height / -2,
      1,
      1000
    )
    camera.position.z = 2

    let renderer = new WebGLRenderer({ canvas: canvasEl })
    renderer.setClearColor(0x000,0)
    renderer.autoClear = false
    renderer.setSize(window.innerWidth, window.innerHeight)

    const video = this.videoRef.current
    const videoTexture = new VideoTexture(video)
    videoTexture.minFilter = LinearFilter
    videoTexture.magFilter = LinearFilter
    videoTexture.format = RGBFormat

    const bufferScene = new Scene()
    let textureA = new WebGLRenderTarget(
      window.innerWidth,
      window.innerHeight,
      {
        minFilter: LinearFilter,
        magFilter: LinearFilter,
      }
    )
    let textureB = new WebGLRenderTarget(
      window.innerWidth,
      window.innerHeight,
      { minFilter: LinearFilter, magFilter: LinearFilter }
    )
    const bufferMaterial = new ShaderMaterial({
      uniforms: {
        bufferTexture: { value: textureA.texture },
        res: {
          value: new Vector2(window.innerWidth, window.innerHeight),
        },
        videoTexture: { value: videoTexture },
        time: { value: Math.random() * Math.PI * 2 + Math.PI },
      },
      fragmentShader,
      vertexShader,
    })
    const plane = new PlaneBufferGeometry(window.innerWidth, window.innerHeight)
    const bufferObject = new Mesh(plane, bufferMaterial)
    bufferScene.add(bufferObject)

    const finalMaterial = new MeshBasicMaterial({ map: textureB.texture })
    const quad = new Mesh(plane, finalMaterial)

    scene.add(quad)

 
    const recursiveAnimation = () => {
      this.animationFrameId = requestAnimationFrame(recursiveAnimation)

      renderer.setRenderTarget(textureB)
      renderer.render(bufferScene, camera)

      renderer.setRenderTarget(null)
      renderer.clear()

      var t = textureA
      textureA = textureB
      textureB = t

      quad.material.map = textureB.texture
      bufferMaterial.uniforms.bufferTexture.value = textureA.texture

      bufferMaterial.uniforms.time.value += 0.9
    
      renderer.render(scene, camera)
    }

   this.handleResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();  
    renderer.setSize( window.innerWidth, window.innerHeight );


    }

    window.addEventListener('resize', this.handleResize)

    recursiveAnimation()
  }

 
  render() {
    return (
      <div className={styles.wrapper}>
        <video
          className={styles.visuallyHidden}
          ref={this.videoRef} 
          autoPlay
          loop
          muted
          id="video1"
        >
          <source src={videoSrc} type="video/mp4" />
          Your browser does not support HTML5 video.
        </video>
        <canvas className={styles.canvas} ref={this.canvasRef}>
          Please enable javascript to view animation
        </canvas>
        <svg id="Layer_1" role='presentation' className={styles.svg} data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" width="298.54" height="99.38" viewBox="0 0 298.54 99.38">
  <g>
    <path d="M71.29,40.64c2.07,2.31,4,4.51,6,6.66a3.23,3.23,0,0,1,.8,2.44c0,3.06,0,6.12,0,9.18,0,.9,0,1.8,0,3.07l13-3c.07-3.69.14-7.44.21-11.35,1.15.75,2.12,1.76,3.13,1.91s2.11-.51,3.37-.87c.11,1,.29,1.93.3,2.87,0,3.89.1,7.79.07,11.68,0,5.21-2.36,9.1-5,9.5s-5.48,1.46-8.23,2.15c-3.16.8-6.32,1.5-9.48,2.26-1.32.32-2.64.69-4.09,1.07Z" transform="translate(-0.73 0.11)" fill="#2a094e" stroke="#6f52a2" stroke-miterlimit="10" stroke-width="0.54"/>
    <path d="M78,34.21V45.3c-2.63-1.65-4.67-4.31-6.43-7.73a3.6,3.6,0,0,1-.31-1.49c0-5,0-10,0-15.23l18.9-4.14c-1,3.57-1.6,6.82-3,9.4-1.15,2.08-2,4.72-3.63,5.79A11.41,11.41,0,0,1,81.62,33C80.48,33.49,79.31,33.79,78,34.21Z" transform="translate(-0.73 0.11)" fill="#2a094e" stroke="#6f52a2" stroke-miterlimit="10" stroke-width="0.54"/>
    <path d="M86.18,31.79c.66-1.68,1.09-2.77,1.52-3.88.92-2.43,1.84-4.87,2.77-7.3l.15-.48c1.2-3.6,2.57-4.79,4.61-3.59,1.32.77,2.82,3.07,2.85,7.19,0,5.18,0,10.36,0,15.55v6.63c-2.07.81-4,2-6.07,0A3.64,3.64,0,0,1,91.12,43c0-3.87,0-7.75,0-12Z" transform="translate(-0.73 0.11)" fill="#2a094e" stroke="#6f52a2" stroke-miterlimit="10" stroke-width="0.54"/>
  </g>
  <g>
    <path d="M231.92,91.54v-3q0-14.58,0-29.18c0-2,0-4.07.06-6.1a9.44,9.44,0,0,1,.5-2.82,23.34,23.34,0,0,1,1.87-3.67c1.34-2.14,2.73-4.16,4.26-6.45,0,1.67.07,3.28,0,4.89q-.13,16.8-.3,33.61a5.46,5.46,0,0,1-.28,2.06C236.12,84.39,234.1,87.8,231.92,91.54Z" transform="translate(-0.73 0.11)" fill="#2a094e" stroke="#6f52a2" stroke-miterlimit="10" stroke-width="0.54"/>
    <path d="M231.9,48.23V22.09l6.8,1.54c0,1.61,0,3,0,4.33,0,1.84-.1,3.71,0,5.54.15,2.5-.44,4-1.63,5a2,2,0,0,0-.91,2.46c.06.26-.33.87-.55,1.23C234.46,44.13,233.28,46,231.9,48.23Z" transform="translate(-0.73 0.11)" fill="#2a094e" stroke="#6f52a2" stroke-miterlimit="10" stroke-width="0.54"/>
  </g>
  <g>
    <path d="M192.07,82.6c-.1-.83-.16-1.08-.16-1.34q0-19,.05-38.06c0-2.18.06-2.11,1.52-2.79a2.41,2.41,0,0,0,.83-1.45c.87-3.81,2.66-6.29,4.19-9.9.08,1.18.16,1.83.16,2.48q-.09,18.47-.19,36.95a5.74,5.74,0,0,1-.56,2.75C196,74.88,194.14,78.57,192.07,82.6Z" transform="translate(-0.73 0.11)" fill="#2a094e" stroke="#6f52a2" stroke-miterlimit="10" stroke-width="0.54"/>
    <path d="M192,36.61V14.32h6.69c0,3.4.05,6.71,0,10a5.94,5.94,0,0,1-.74,2.36c-1.84,3.45-3.73,6.82-5.61,10.23Z" transform="translate(-0.73 0.11)" fill="#2a094e" stroke="#6f52a2" stroke-miterlimit="10" stroke-width="0.54"/>
  </g>
  <g>
    <path d="M178.65,43.71c-2.22-1.35-4.36-2-6-4.74a6.85,6.85,0,0,1-1.05-4c.08-3.13,0-6.28,0-9.7l-3.46-.36L171.84,15a19.22,19.22,0,0,1,1,2.22c.84,3,2.06,3.87,3.76,2.64.59-.43,1.16-.95,1.67-1.38-.89-1-1.74-2.3-2.73-2.85s-2-.22-3.33-.3c.74-1.44,1.22-2.51,1.8-3.39a1.07,1.07,0,0,1,1-.4c1.7.08,3.39.23,5.09.35a40.17,40.17,0,0,1,9.82,1.34c-.58,1.17-1,2.12-1.52,3.06-1.45,2.87-3,5.67-4.35,8.65-.6,1.29-1.25,1.69-2.13,1.6a31.18,31.18,0,0,0-3.23,0Z" transform="translate(-0.73 0.11)" fill="#2a094e" stroke="#6f52a2" stroke-miterlimit="10" stroke-width="0.54"/>
    <path d="M172.3,10.9c-1.45,3.62-2.82,6.92-4.11,10.31-1,2.55-2.14,4.13-4,3.67a10.22,10.22,0,0,0-2.42,0V10.48C165.31,10,168.75,11.17,172.3,10.9Z" transform="translate(-0.73 0.11)" fill="#2a094e" stroke="#6f52a2" stroke-miterlimit="10" stroke-width="0.54"/>
    <path d="M178.5,68.13h-6.94c-.19-2.69-.22-5,1.06-7.06,2-3.17,3.81-6.62,5.76-10A151.83,151.83,0,0,1,178.5,68.13Z" transform="translate(-0.73 0.11)" fill="#2a094e" stroke="#6f52a2" stroke-miterlimit="10" stroke-width="0.54"/>
    <path d="M171.67,40.85c1.08,1,2.06,1.95,3.09,2.73a21.1,21.1,0,0,0,2.2,1.16c1.41.85,1.63,2.17.6,3.94-1.88,3.24-3.82,6.38-5.89,9.82Z" transform="translate(-0.73 0.11)" fill="#2a094e" stroke="#6f52a2" stroke-miterlimit="10" stroke-width="0.54"/>
  </g>
  <g>
    <path d="M208,52.76c-.26-.38-1.26-.33-1-2.37,0-.11-.79-.84-1.2-.79-1.66.24-2.57-2-3.67-3.5a4.1,4.1,0,0,1-.28-1.78q0-14.31,0-28.63a6.85,6.85,0,0,1,.15-.83l12.8,2.77c-1,4.09-1.71,8.15-3.2,11.58-.69,1.6-1.3,2.84-2.53,2-.12-.08-.29.09-.55.19v6.12l21.56,4.11c-.58,1.2-1,2.11-1.43,3-1.38,2.75-2.8,5.43-4.15,8.23-.64,1.32-1.35,1.8-2.31,1.61-2.5-.48-5-.84-7.52-1.28-1.53-.27-3.06-.68-4.59-.88A7.13,7.13,0,0,0,208,52.76Z" transform="translate(-0.73 0.11)" fill="#2a094e" stroke="#6f52a2" stroke-miterlimit="10" stroke-width="0.54"/>
    <path d="M208.56,73l-6.37-.78c-.34-2.16-.46-17.38-.2-23.33,1.1,1.12,2.16,2.17,3.2,3.27a37.58,37.58,0,0,1,2.61,3,3.56,3.56,0,0,1,.72,1.88C208.58,62.12,208.56,67.29,208.56,73Z" transform="translate(-0.73 0.11)" fill="#2a094e" stroke="#6f52a2" stroke-miterlimit="10" stroke-width="0.54"/>
    <path d="M230.2,21.16C228,25,226,28.63,223.88,32.21c-.79,1.38-.81,1.35-2.82.92-1.16-4.37-1.29-9.31-1.92-14C220.24,18.55,228,20,230.2,21.16Z" transform="translate(-0.73 0.11)" fill="#2a094e" stroke="#6f52a2" stroke-miterlimit="10" stroke-width="0.54"/>
    <path d="M219.44,32.84l-7-1.09c1.16-4.76,2.23-9.18,3.3-13.57h2.39c.28,2.8.6,5.48.78,8.19a11.67,11.67,0,0,1-.44,2.54c-.14.82-.33,1.62.46,1.68S219.43,31.67,219.44,32.84Z" transform="translate(-0.73 0.11)" fill="#2a094e" stroke="#6f52a2" stroke-miterlimit="10" stroke-width="0.54"/>
  </g>
  <g>
    <path d="M128,11.7V25.44a13.94,13.94,0,0,1-2.11.49c-3.19.28-6.38.45-9.56.77-4.31.43-8.62,1-12.94,1.46a19.77,19.77,0,0,1-2.06,0c0-4.59-.16-9,.06-13.44C103.39,13.87,126.66,11.22,128,11.7Z" transform="translate(-0.73 0.11)" fill="#2a094e" stroke="#6f52a2" stroke-miterlimit="10" stroke-width="0.54"/>
    <path d="M105,34.72c1.25-.17,2.32-.33,3.39-.46,3.17-.38,6.35-.68,9.52-1.16.88-.13,1.42.37,1.94,1.6A61.58,61.58,0,0,1,123.69,47a12.67,12.67,0,0,1-2.13.64c-3.63.42-7.27.76-10.9,1.19-.9.1-1.56-.27-2.07-1.74A75.46,75.46,0,0,1,105,34.72Z" transform="translate(-0.73 0.11)" fill="#2a094e" stroke="#6f52a2" stroke-miterlimit="10" stroke-width="0.54"/>
    <path d="M128,67.7l-5.76.7c-1.34-4.45-1.29-9.34-2-14.32l7.81-.63Z" transform="translate(-0.73 0.11)" fill="#2a094e" stroke="#6f52a2" stroke-miterlimit="10" stroke-width="0.54"/>
    <path d="M113.63,66.39c-.33-1.52-.33-1.52.4-2a20.63,20.63,0,0,1-2.2-8.94c2.23-1.17,4.58-.1,6.84-1.09a5.26,5.26,0,0,1,.65,4.21,2.63,2.63,0,0,0,0,1.31c1.09,2.59.73,6,1.76,8.78l-7.35,1-.47-2.28c.43-.24.81-.69,1.15-.58.9.28,1.53-.11,2.14-1.42.79-1.72.88-1.79.44-4.55A15.38,15.38,0,0,0,113.63,66.39Z" transform="translate(-0.73 0.11)" fill="#2a094e" stroke="#6f52a2" stroke-miterlimit="10" stroke-width="0.54"/>
    <path d="M120.74,32.75a9.82,9.82,0,0,1,1-.24l6.25-.74V46.9h-2.79l-3.49-10.62.73-.7-1.82-2.33Z" transform="translate(-0.73 0.11)" fill="#2a094e" stroke="#6f52a2" stroke-miterlimit="10" stroke-width="0.54"/>
    <path d="M106.64,70.66c-.25-5.06.1-10-1.31-14.71l5.21-.63a54,54,0,0,1,.8,5.43c.15,3,.84,5.94-.16,9.21Z" transform="translate(-0.73 0.11)" fill="#2a094e" stroke="#6f52a2" stroke-miterlimit="10" stroke-width="0.54"/>
    <path d="M103.79,35.05c1.24,4.56,2.43,8.93,3.68,13.48-2,1.16-4,.63-6.11,1.07,0-4.88-.13-9.6.17-14.55Z" transform="translate(-0.73 0.11)" fill="#2a094e" stroke="#6f52a2" stroke-miterlimit="10" stroke-width="0.54"/>
    <path d="M101.43,56.6a7,7,0,0,0,1-.31c2.22-1.09,2.91,1.3,2.69,5.21a4.91,4.91,0,0,0,.21,2.79,6.31,6.31,0,0,1,.18,2.09c0,1.38,0,2.76,0,4.52l-4.09.32Z" transform="translate(-0.73 0.11)" fill="#2a094e" stroke="#6f52a2" stroke-miterlimit="10" stroke-width="0.54"/>
  </g>
  <g>
    <path d="M138.33,67.59h-6.66c0-.79-.1-1.49-.11-2.2,0-4.44,0-8.89,0-13.33,0-1.39,0-2.79-.07-4.16-.15-2.33-.46-4.68,1.18-6.36l-.93-.73a6.69,6.69,0,0,1,1-3.23c1-1.87,2-3.79,3.08-5.45a25.54,25.54,0,0,0,3.65-11c.09-.72.23-1.41.4-2.46a9.52,9.52,0,0,1,.94,1.32c2.2,4.4,4.38,8.83,6.57,13.25a4.76,4.76,0,0,1,.47,2.72c-.43,5.39-.76,10.81-1.16,16.73-2.8-5.73-5.47-11.22-8.36-17.13-.46,5.86.13,11.06.05,16.26S138.33,62.17,138.33,67.59Z" transform="translate(-0.73 0.11)" fill="#2a094e" stroke="#6f52a2" stroke-miterlimit="10" stroke-width="0.54"/>
    <path d="M148.19,51.56l1.09-.28c-1.06-4.71-.73-9.34-.53-14l.33-.25,2.19,4.15a29.86,29.86,0,0,0,.2-5.27c0-1.66,0-3.32,0-5.14.84,0,1.42.88,1.88,1.71a46.41,46.41,0,0,0,4.47,6.1,3.72,3.72,0,0,1,.7,2.53q-.08,17.07-.1,34.14c0,.34,0,.68-.09,1.41a14.31,14.31,0,0,1-.78-1.24c-2.52-5.13-5-10.37-7.57-15.37C148.73,57.64,148.56,54.74,148.19,51.56Z" transform="translate(-0.73 0.11)" fill="#2a094e" stroke="#6f52a2" stroke-miterlimit="10" stroke-width="0.54"/>
    <path d="M158.33,35.58c-.25-.13-.47-.14-.61-.34-1.9-2.51-3.79-5-5.66-7.6a3,3,0,0,1-.57-1.5c0-5.34,0-10.69,0-16.18h6.86Z" transform="translate(-0.73 0.11)" fill="#2a094e" stroke="#6f52a2" stroke-miterlimit="10" stroke-width="0.54"/>
    <path d="M131.45,36.91c-.09-4.08-.52-7.46.75-10.69.94-2.41,1.57-5.19,2.38-7.77.65-2.07,1.35-4.09,2-6,.3.13.42.13.49.22,1.44,1.9,1.52,4.2,1.1,7.26a32.26,32.26,0,0,1-4,12.26C133.34,33.58,132.52,35,131.45,36.91Z" transform="translate(-0.73 0.11)" fill="#2a094e" stroke="#6f52a2" stroke-miterlimit="10" stroke-width="0.54"/>
    <path d="M135.86,10.18c-1.48,4.66-2.89,9.1-4.31,13.54l-.19-.1V1c1.3,2.55,2.45,4.74,3.56,7C135.29,8.71,135.6,9.56,135.86,10.18Z" transform="translate(-0.73 0.11)" fill="#2a094e" stroke="#6f52a2" stroke-miterlimit="10" stroke-width="0.54"/>
  </g>
  <g>
    <path d="M57.89,26.05c0,1,.08,1.52.08,2q0,18.21,0,36.43a12.2,12.2,0,0,1-.66,4.19c-1.32,3.72-2.81,7.1-5.13,9-1.34,1.09-1.65,1-2.7-.93q-4.11-7.53-8.23-15.09a13.45,13.45,0,0,0-1.25-2,3.06,3.06,0,0,1-.48-2.84c.74-3.63,2.74-6,4.9-5.82a5.51,5.51,0,0,0,1.12-.14l-.24-1.44.19-.29L51,58.4a14.85,14.85,0,0,0,.24-1.65c0-4-.07-8-.05-12a9.1,9.1,0,0,1,.34-2.61c.53-1.69,1.15-3.3,1.77-4.88,1.19-3,2.4-6,3.61-9C57.14,27.64,57.44,27.05,57.89,26.05Z" transform="translate(-0.73 0.11)" fill="#2a094e" stroke="#6f52a2" stroke-miterlimit="10" stroke-width="0.54"/>
    <path d="M37.86,87.35,31.1,89.91c0-.83-.11-1.53-.11-2.23Q31,68.09,31,48.5a5.23,5.23,0,0,0,0-.56c-.52-3.54.54-5.57,2.12-7,1.37-1.27,2.75-2.5,4.15-3.63.57-.46,1.2-.51,1.72.42,1.69,3,3.4,5.92,5.22,9.09l-3,2.86L41.1,48a3.51,3.51,0,0,0-.4.67c-.76,2.38-1.42,4.9-2.31,7.1a8.94,8.94,0,0,0-.53,3.55v28Z" transform="translate(-0.73 0.11)" fill="#2a094e" stroke="#6f52a2" stroke-miterlimit="10" stroke-width="0.54"/>
    <path d="M58.07,91.23,52.3,80.73a8.47,8.47,0,0,0,1.08-1.09c.79-1,1.57-2.07,2.31-3.21s1.41-2.34,2.19-3.65l-.09-1.48.28,0Z" transform="translate(-0.73 0.11)" fill="#2a094e" stroke="#6f52a2" stroke-miterlimit="10" stroke-width="0.54"/>
    <path d="M30.9,40.81V23.57c2.47,3.57,4.39,7.82,6.7,11.71A15.72,15.72,0,0,0,34,37,27.53,27.53,0,0,0,30.9,40.81Z" transform="translate(-0.73 0.11)" fill="#2a094e" stroke="#6f52a2" stroke-miterlimit="10" stroke-width="0.54"/>
    <path d="M50.81,38.71v-10c0-1,0-1.93.69-2.14,1.7-.54,3.41-1,5.47-1.63L51.14,38.85Z" transform="translate(-0.73 0.11)" fill="#2a094e" stroke="#6f52a2" stroke-miterlimit="10" stroke-width="0.54"/>
  </g>
  <g>
    <path d="M241.88,39.16V25.26l7.5,2.34-.91,1.71c1,1.14,1.63,2.22,2.92.72.86-1,2.31-.87,3.43-.52a57.19,57.19,0,0,1,7.49,3.13c.6.29,1.1,1.27,1.75,2.06.16-.5.31-1,.59-1.84l4.45,1.8V48.33a8.2,8.2,0,0,1-1.69-.23q-12-4.08-23.9-8.24C243,39.69,242.51,39.44,241.88,39.16Z" transform="translate(-0.73 0.11)" fill="#2a094e" stroke="#6f52a2" stroke-miterlimit="10" stroke-width="0.54"/>
    <path d="M265.47,53.37V63.52c1,.52.61,2.48,1,4.42-8.32-2.73-16.42-5.46-24.6-8.16V45.57Z" transform="translate(-0.73 0.11)" fill="#2a094e" stroke="#6f52a2" stroke-miterlimit="10" stroke-width="0.54"/>
    <path d="M247.59,82.78c-.11-4.9-.23-9.68-.35-14.77l21.64,7.06c0,4.9.16,9.77-.28,15a7.46,7.46,0,0,1-1.75-.2q-9.45-3.31-18.91-6.71C247.85,83.11,247.76,83,247.59,82.78Z" transform="translate(-0.73 0.11)" fill="#2a094e" stroke="#6f52a2" stroke-miterlimit="10" stroke-width="0.54"/>
    <path d="M241.89,67.42c2.6-.5,3.83,1,4.2,5.17.28,3.25.29,6.57.44,10.09L242,81C241.7,76.5,241.85,72,241.89,67.42Z" transform="translate(-0.73 0.11)" fill="#2a094e" stroke="#6f52a2" stroke-miterlimit="10" stroke-width="0.54"/>
    <path d="M268.91,68.34c-.67.29-1.1.12-1.32-1.2a94.13,94.13,0,0,1-1.11-13.42l2.43.68Z" transform="translate(-0.73 0.11)" fill="#2a094e" stroke="#6f52a2" stroke-miterlimit="10" stroke-width="0.54"/>
  </g>
  <g>
    <path d="M7.78,46.87,8,83.62l5.27-1.8c1.26-.43,2.52-.85,3.77-1.33.73-.28,1.26,0,1.73,1.13a20.47,20.47,0,0,0,1.84,3.72A8.6,8.6,0,0,0,23,87.87c1,.64,1.67,1.65,2,3.87a10.1,10.1,0,0,1-2.23,1.47c-3.73,1.21-7.49,2.28-11.23,3.41-1.11.34-2.23.71-3.33,1.12-.69.26-1.17-.14-1.6-1.12C4.9,92.69,3.14,88.83,1.45,84.87A7,7,0,0,1,1,82.33C1,75.39,1,68.44,1,61.5V54.69C3.33,52.49,5,48.5,7.78,46.87Z" transform="translate(-0.73 0.11)" fill="#2a094e" stroke="#6f52a2" stroke-miterlimit="10" stroke-width="0.54"/>
    <path d="M19.5,79.77,21.09,79V74.82q0-8.05,0-16.11c0-1,0-1.92.61-2.26,2-1.06,3.35-3.86,4.93-6.07.35-.49.72-.93,1.35-1.74,0,7.25,0,14,0,20.68,0,3.52,0,7,0,10.56,0,4.25-2.08,7-4.39,5.92C21.94,85,21,83.69,19.5,79.77Z" transform="translate(-0.73 0.11)" fill="#2a094e" stroke="#6f52a2" stroke-miterlimit="10" stroke-width="0.54"/>
    <path d="M21,36.66,27.94,34c0,3.79.11,7.28-.05,10.72A3,3,0,0,1,26,47.6a11.73,11.73,0,0,1-1.29.31l.49,1.91L21,54.29Z" transform="translate(-0.73 0.11)" fill="#2a094e" stroke="#6f52a2" stroke-miterlimit="10" stroke-width="0.54"/>
    <path d="M1.18,49.12c-.17-5-.17-5,2.15-5.83,1.44-.54,2.89-1,4.43-1.59v2.6c-1.07.74-2.17,1.46-3.25,2.25S2.38,48.2,1.18,49.12Z" transform="translate(-0.73 0.11)" fill="#2a094e" stroke="#6f52a2" stroke-miterlimit="10" stroke-width="0.54"/>
    <path d="M1.2,88.69l4.59,9.73C2.45,100.43.33,95.4,1.2,88.69Z" transform="translate(-0.73 0.11)" fill="#2a094e" stroke="#6f52a2" stroke-miterlimit="10" stroke-width="0.54"/>
  </g>
  <g>
    <path d="M295.94,89.36l.85.35c.39,3.33-.31,4.63-2.05,5.8-.38.26-.85.33-1.14.77-1.17,1.77-2.4,1.53-3.78,1-4.22-1.63-8.46-3.06-12.69-4.57a2.52,2.52,0,0,1-.45-.28,27.22,27.22,0,0,1,2-8.33,1.17,1.17,0,0,1,.48-.65c1-.44,1.42-1.57,1.08-3.79,4.12.83,7.91,2.88,12,4.08V68.08c3.74-2.87,6-7.86,6.27-15.48l.32.15a11.86,11.86,0,0,1,.22,1.57c0,7.22.06,14.45-.06,21.67a28.15,28.15,0,0,1-1,5.79C297.36,84.31,296.64,86.74,295.94,89.36Z" transform="translate(-0.73 0.11)" fill="#2a094e" stroke="#6f52a2" stroke-miterlimit="10" stroke-width="0.54"/>
    <path d="M272.19,35.58c3.52-.6,6.18,2.6,6.92,8.17a26.53,26.53,0,0,1,.06,9,19.69,19.69,0,0,0-.07,3.86q.06,10.56.12,21.12c0,2.52-.21,2.9-1.65,3.88a3.38,3.38,0,0,0-.58,1.69c-.14.87-.06,1.86-.23,2.72-.37,2-.83,4-1.34,6.27l-3.23-1.13Z" transform="translate(-0.73 0.11)" fill="#2a094e" stroke="#6f52a2" stroke-miterlimit="10" stroke-width="0.54"/>
    <path d="M295.86,61.11l-2.21.74.59,1.2-1.89,2.23c-.45-3,0-6-.34-9.17l-11-4.23c-.31-2.77-.62-5.62-1-9.07,1.1,2,2,3.53,2.89,5.17.61-3.3.39-4.71-.9-6.53a2.5,2.5,0,0,1-.39-.82c-.41-1.61-1.11-2.26-2.08-2.39-.52-.07-1-.66-1.5-1l.09-.57c1.72.57,3.43,1.18,5.15,1.71,3.45,1.07,6.89,2.09,10.33,3.14,1.93.59,3.56,1.94,4.26,5.53a10.37,10.37,0,0,1,.19,2.17A54.35,54.35,0,0,1,295.86,61.11Z" transform="translate(-0.73 0.11)" fill="#2a094e" stroke="#6f52a2" stroke-miterlimit="10" stroke-width="0.54"/>
    <path d="M293.76,97.91c.53-.16,1.07-.3,1.6-.47,1.39-.45,2.2-1.8,2.46-4.29.16-1.54.19-3.12.3-4.67a13.88,13.88,0,0,1,.55-3.35c0,2.57.06,5.14,0,7.7-.15,4.75-1.56,6.73-4.19,6l-.72-.21Z" transform="translate(-0.73 0.11)" fill="#2a094e" stroke="#6f52a2" stroke-miterlimit="10" stroke-width="0.54"/>
  </g>
  <path d="M24.58,88.39l2.62-1.58C26.66,89.9,26.4,90.06,24.58,88.39Z" transform="translate(-0.73 0.11)" fill="#2a094e" stroke="#6f52a2" stroke-miterlimit="10" stroke-width="0.54"/>
  <g>
    <path d="M61.43,90.17c-.11-.83-.17-1.08-.17-1.34q0-19,.05-38.07c0-2.17.06-2.11,1.52-2.79a2.4,2.4,0,0,0,.84-1.44c.86-3.81,2.65-6.29,4.18-9.9.08,1.17.17,1.82.16,2.47q-.08,18.48-.18,36.95a5.81,5.81,0,0,1-.57,2.75C65.36,82.45,63.49,86.14,61.43,90.17Z" transform="translate(-0.73 0.11)" fill="#2a094e" stroke="#6f52a2" stroke-miterlimit="10" stroke-width="0.54"/>
    <path d="M61.32,44.18V21.89H68c0,3.4,0,6.71,0,10a5.78,5.78,0,0,1-.73,2.36c-1.85,3.44-3.74,6.82-5.61,10.22Z" transform="translate(-0.73 0.11)" fill="#2a094e" stroke="#6f52a2" stroke-miterlimit="10" stroke-width="0.54"/>
  </g>
</svg>
      <div className={styles.footer}>
      </div>
      </div>
    )
  }
}
