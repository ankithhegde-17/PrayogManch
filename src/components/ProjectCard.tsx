import { ArrowUpRight, Clock3, Github } from 'lucide-react'
import type { Project } from '../data/projects'

export function ProjectCard({project}:{project:Project}){
  const live=project.status==='live'&&project.websiteUrl
  return <article className={`project-card project-${project.id}`}>
    <div className="project-image"><img src={project.image} alt={project.imageAlt} loading="lazy"/></div>
    <div className="project-details"><p className="project-number">Project {project.number}</p><h3>{project.name}</h3><p className="project-description">{project.description}</p><div className="tags">{project.tags.map(t=><span key={t}>{t}</span>)}</div></div>
    <div className="project-actions">
      {project.githubUrl&&<a className="github-button" href={project.githubUrl} target="_blank" rel="noopener noreferrer" title={`View ${project.name} source code on GitHub`} aria-label={`View ${project.name} source code on GitHub`}><Github/><span>GitHub</span></a>}
      {live?<a className="visit-button" href={project.websiteUrl} target="_blank" rel="noopener noreferrer" title={`Visit ${project.name} website`} aria-label={`Visit ${project.name} website`}><span>Live website</span><ArrowUpRight/></a>:<span className="visit-button disabled" title="Website coming soon" aria-label="Website coming soon"><Clock3/></span>}
    </div>
    <div className="mobile-action">{live&&<a href={project.websiteUrl} target="_blank" rel="noopener noreferrer">Visit website <ArrowUpRight/></a>}{project.githubUrl&&<a href={project.githubUrl} target="_blank" rel="noopener noreferrer">View source <Github/></a>}</div>
  </article>
}
