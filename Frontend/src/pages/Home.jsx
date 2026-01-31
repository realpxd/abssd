import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Hero from '../components/Hero'
import About from '../components/About'
import Services from '../components/Services'
import DonationHighlight from '../components/DonationHighlight'
import Gallery from '../components/Gallery'
import News from '../components/News'
import Contact from '../components/Contact'
import Join from '../components/Join'
import MembershipModal from '../components/MembershipModal'
import SEO from '../components/SEO'
import { smoothScrollTo } from '../utils/smoothScroll.js'
import MajorMembers from './MajorMembers.jsx'

const Home = () => {
  const location = useLocation()
  const { user } = useAuth()

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
      <SEO 
        title="Home"
        description="अखिल भारतीय स्वच्छता सेवा दल - स्वच्छता अभियान, जल सेवा, एकादशी सेवा में भाग लें। Khatu, Rajasthan में स्थित राष्ट्रीय समाजिक संगठन। दान करें और स्वयंसेवक बनें।"
        canonical="/"
        ogImage="https://abssd.in/images/logo.png"
      />
      <MembershipModal isLoggedIn={!!user} />
      <Hero />
      <About />
      <Services />
      <DonationHighlight />
      <Gallery />
      <News />
      <MajorMembers lowHeight />
      <Join />
      <Contact />
    </main>
  )
}

export default Home

