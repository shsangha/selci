/* eslint-disable complexity */
import React, { Component, createRef } from "react"
import styles from "./style.module.scss"
import { TweenLite } from "gsap"
import paper from "paper"
import SimplexNoise from "simplex-noise"

const lerp = (a, b, n) => {
  return (1 - n) * a + n * b
}

const map = (value, in_min, in_max, out_min, out_max) => {
  return ((value - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min
}

let cursorSpeed = 1
let prevX = 0
let prevY = 0
let overLink = false
let cursorVisble = false
let clientX = -10
let clientY = -10
const strokeColor = "rgba(255, 0, 0, 0.5)"

class Cursor extends Component {
  cursorRef = createRef()
  canvasRef = createRef()

  initCursor() {
    const innerCursor = this.cursorRef.current

    const unveilCursor = e => {
      this.group.position = new paper.Point(e.clientX, e.clientY)
      setTimeout(() => {
        cursorSpeed = 0.2
      }, 100)
      cursorVisble = true
    }

    document.addEventListener("mousemove", unveilCursor)

    document.addEventListener("mousemove", e => {
      clientX = e.clientX
      clientY = e.clientY
    })

    const render = () => {
      TweenLite.set(innerCursor, {
        x: clientX,
        y: clientY,
      })
      if (cursorVisble) {
        document.removeEventListener("mousemove", unveilCursor)
      }
      requestAnimationFrame(render)
    }
    requestAnimationFrame(render)
  }

  initCanvas() {
    const canvas = this.canvasRef.current
    const shapeBounds = {
      width: 60,
      height: 60,
    }
    paper.setup(canvas)

    const noiseScale = 150 // speed
    const noiseRange = 6 // range of distortion
    let isNoisy = false

    const polygon = new paper.Path.RegularPolygon({
      center: [0, 0],
      sides: 8,
      radius: 15,
      strokeWidth: 1,
      strokeColor,
    })

    this.group = new paper.Group([polygon])
    this.group.applyMatrix = true

    const noiseObjects = polygon.segments.map(() => new SimplexNoise())
    let bigCoordinates = []

    paper.view.onFrame = event => {
      if (!overLink) {
        // move circle around normally
        prevX = lerp(prevX, clientX, cursorSpeed)
        prevY = lerp(prevY, clientY, cursorSpeed)
        this.group.position = new paper.Point(prevX, prevY)
      } else if (overLink) {
        // fixed position on a nav item
        prevX = lerp(prevX, this.stuckX, cursorSpeed)
        prevY = lerp(prevY, this.stuckY, cursorSpeed)
        this.group.position = new paper.Point(prevX, prevY)
      }

      if (overLink && polygon.bounds.width < shapeBounds.width) {
        // scale up the shape
        polygon.scale(1.08)
      } else if (!overLink && polygon.bounds.width > 30) {
        // remove noise
        if (isNoisy) {
          polygon.segments.forEach((segment, i) => {
            segment.point.set(bigCoordinates[i][0], bigCoordinates[i][1])
          })
          isNoisy = false
          bigCoordinates = []
        }

        // scale down the shape
        const scaleDown = 0.92
        polygon.scale(scaleDown)
      }

      // while stuck and when big, do perlin noise
      if (overLink && polygon.bounds.width >= shapeBounds.width) {
        isNoisy = true

        // first get coordinates of large circle
        if (bigCoordinates.length === 0) {
          polygon.segments.forEach((segment, i) => {
            bigCoordinates[i] = [segment.point.x, segment.point.y]
          })
        }

        // calculate noise value for each point at that frame
        polygon.segments.forEach((segment, i) => {
          const noiseX = noiseObjects[i].noise2D(event.count / noiseScale, 0)
          const noiseY = noiseObjects[i].noise2D(event.count / noiseScale, 1)

          const distortionX = map(noiseX, -1, 1, -noiseRange, noiseRange)
          const distortionY = map(noiseY, -1, 1, -noiseRange, noiseRange)

          const newX = bigCoordinates[i][0] + distortionX
          const newY = bigCoordinates[i][1] + distortionY

          segment.point.set(newX, newY)
        })
      }

      // hover state for main nav items
      if (this.fillOuterCursor && polygon.fillColor !== strokeColor) {
        polygon.fillColor = strokeColor
        polygon.strokeColor = "transparent"
      } else if (!this.fillOuterCursor && polygon.fillColor !== "transparent") {
        polygon.strokeColor = "rgba(255, 0, 0, 0.5)"
        polygon.fillColor = "transparent"
      }
    }
  }

  initHovers() {
    const innerCursor = this.cursorRef.current

    const handleMouseEnter = e => {
      const navItem = e.currentTarget
      const navItemBox = navItem.getBoundingClientRect()
      this.stuckX = Math.round(navItemBox.left + navItemBox.width / 2)
      this.stuckY = Math.round(navItemBox.top + navItemBox.height / 2)
      overLink = true
    }

    const handleMouseLeave = () => {
      overLink = false
    }

    const linkItems = document.querySelectorAll(".browser-window__link")
    linkItems.forEach(item => {
      item.addEventListener("mouseenter", handleMouseEnter)
      item.addEventListener("mouseleave", handleMouseLeave)
    })

    const mainNavItemMouseEnter = () => {
      cursorSpeed = 0.8
      this.fillOuterCursor = true
      TweenLite.to(innerCursor, 0.2, { opacity: 0 })
    }
    const mainNavItemMouseLeave = () => {
      cursorSpeed = 0.2
      this.fillOuterCursor = false
      TweenLite.to(innerCursor, 0.2, { opacity: 1 })
    }

    const mainNavItems = document.querySelectorAll(".content--fixed a")
    mainNavItems.forEach(item => {
      item.addEventListener("mouseenter", mainNavItemMouseEnter)
      item.addEventListener("mouseleave", mainNavItemMouseLeave)
    })
  }

  componentDidMount() {
    this.initCursor()
    this.initCanvas()
    this.initHovers()
  }
  componentWillUnmount() {}

  render() {
    return (
      <>
        <div
          ref={this.cursorRef}
          className={`${styles.cursor} ${styles.cursor_inner}`}
        />
        <canvas
          ref={this.canvasRef}
          resize="true"
          className={` ${styles.cursor} ${styles.cursor_outer}`}
        />
      </>
    )
  }
}

export default Cursor
