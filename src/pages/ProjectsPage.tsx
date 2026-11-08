import { ArrowLeft } from 'lucide-react'; import { useEffect } from 'react'; import { Link, useNavigationType } from 'react-router-dom'; import { Footer } from '../components/Footer'; import { Header } from '../components/Header'; import { ProjectCard } from '../components/ProjectCard'; import { projects } from '../data/projects'
// Dedicated projects page. Mirrors the About page structure and reuses the homepage ProjectCard,
// so screenshots keep exactly the same framing everywhere.
export function ProjectsPage(){
  const navigationType=useNavigationType()
  useEffect(()=>{document.title='Projects — PrayogManch.';document.querySelector('meta[name="description"]')?.setAttribute('content','Digital products, experiments, and applications by Ankith Hegde, exploring technology, design, and real-world problem-solving.')},[])
  // Start at the top when arriving from a link; leave back/forward to the browser's own scroll restoration.
  useEffect(()=>{if(navigationType!=='POP')window.scrollTo(0,0)},[navigationType])
  return <div className="site-shell projects-page"><Header/><main>
    <section className="about-intro projects-intro"><Link className="back-home" to="/"><ArrowLeft/> Back to home</Link><p className="eyebrow">Selected work</p><h1>Projects built with purpose.</h1><p className="about-lede">A collection of digital products, experiments, and applications exploring technology, design, and real-world problem-solving.</p></section>
    <section className="projects section-rule" aria-labelledby="all-projects-heading"><div className="section-heading"><h2 id="all-projects-heading">All projects</h2><p>{String(projects.length).padStart(2,'0')} projects</p></div><div className="project-list">{projects.map(p=><ProjectCard key={p.id} project={p}/>)}</div></section>
  </main><Footer/></div>
}
