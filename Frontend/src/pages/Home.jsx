import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Hero from '../components/Hero'
import About from '../components/About'
import Services from '../components/Services'
import Gallery from '../components/Gallery'
import News from '../components/News'
import Contact from '../components/Contact'
import Join from '../components/Join'
import { smoothScrollTo } from '../utils/smoothScroll.js'

const Home = () => {
  const location = useLocation()

  // Handle hash navigation when component mounts or hash changes
  useEffect(() => {
    if (location.hash) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        smoothScrollTo(location.hash, 80)
      }, 100)
    } else {
      // Scroll to top if no hash
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [location.hash])

  return (
    <main>
      <Hero />
      <About />
      <Services />
      <Gallery />
      <News />
      <Join />
      <Contact />
    </main>
  )
}

export default Home

