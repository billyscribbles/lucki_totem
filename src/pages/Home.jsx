import SEO from '../lib/seo.jsx'
import Hero from '../components/Hero.jsx'
import FeaturedCollection from '../components/FeaturedCollection.jsx'
import RarityLineup from '../components/RarityLineup.jsx'
import ProtectYourHand from '../components/ProtectYourHand.jsx'

export default function Home() {
  return (
    <main>
      <SEO />
      <Hero />
      <FeaturedCollection />
      <RarityLineup />
      <ProtectYourHand />
    </main>
  )
}
