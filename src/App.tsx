import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AboutPage } from './pages/AboutPage'
import { HomePage } from './pages/HomePage'
import { ProjectsPage } from './pages/ProjectsPage'
import { InteractiveGrid } from './components/InteractiveGrid'
function App(){return <BrowserRouter><InteractiveGrid/><Routes><Route path="/" element={<HomePage/>}/><Route path="/projects" element={<ProjectsPage/>}/><Route path="/about" element={<AboutPage/>}/></Routes></BrowserRouter>}
export default App
