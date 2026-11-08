import { projects } from '../data/projects'; import { ProjectCard } from './ProjectCard'
export function Projects(){return <section id="projects" className="projects section-rule"><div className="section-heading"><h2>01 — Featured projects</h2><p>View all projects ↗</p></div><div className="project-list">{projects.map(p=><ProjectCard key={p.id} project={p}/>)}</div></section>}
