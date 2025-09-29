
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Inicio from './pages/Inicio'
import Productos from './pages/Productos'
import DetalleProducto from './components/DetalleProducto'
import PlanCanje from './pages/PlanCanje'
import Contacto from './pages/Contacto'
import QuienesSomos from './pages/QuienesSomos'
import PoliticaYgarantia from './pages/PoliticaYgarantia'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'

export default function App() {
  return (

      <div style={{ display:'flex', flexDirection:'column', minHeight:'100vh' }}>
        <Navbar />
        <div style={{ flex:1 }}>
          <Routes>
            <Route path="/" element={<Inicio />} />
            <Route path="/productos" element={<Productos />} />
            <Route path="/productos/:id" element={<DetalleProducto />} />
            <Route path="/contacto" element={<Contacto />} />
            <Route path="/plan-canje" element={<PlanCanje />} />
            <Route path="/quienes-somos" element={<QuienesSomos />} />
            <Route path="/politicaygarantia" element={<PoliticaYgarantia />} />
          </Routes>
        </div>
        <div style={{ marginTop:'auto' }}>
          <Footer />
        </div>
      </div>

  )
}
