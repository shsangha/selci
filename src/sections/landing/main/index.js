import React, { Component } from "react"
import styles from "./style.module.scss"
import Carousel from "@brainhubeu/react-carousel"

import still1 from "../../../../static/img/bg.jpg"
import still2 from "../../../../static/img/bg.jpg"
import still3 from "../../../../static/img/bg.jpg"

const getSlidesPerPage = () => {
  return window.matchMedia("(orientation: landscape)").matches ? 3 : 1
}

class Main extends Component {
  state = {
    slidesPerPage: getSlidesPerPage(),
  }

  setSlides = () => {
    this.setState({
      slidesPerPage: getSlidesPerPage(),
    })
  }

  componentDidMount() {
    window.addEventListener("resize", this.setSlides)
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.setSlides)
  }

  render() {
    const { slidesPerPage } = this.state

    return (
      <div className={styles.main}>
        <Carousel
          slidesPerPage={slidesPerPage}
          centered
          clickToChange
          infinite
          offset={0}
          className={styles.carousel}
          slides={[
            <img className={styles.img} src={still1} />,
            <img className={styles.img} src={still2} />,
            <img className={styles.img} src={still3} />,
          ]}
        />
      </div>
    )
  }
}

export default Main
