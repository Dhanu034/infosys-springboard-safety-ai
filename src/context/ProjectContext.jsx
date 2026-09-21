import React, { createContext, useContext, useState, useEffect } from 'react';

export const AVAILABLE_PROJECTS = [
  {
    id: "PRJ-101",
    name: "Skyline Mega Tower — Phase 3",
    code: "SMT-P3",
    location: "Downtown Core, District 4",
    contractor: "BuildCorp Engineering Ltd",
    status: "HIGH_MONITORING",
    totalWorkers: 342,
    activeZones: 6,
    startDate: "2025-11-15"
  },
  {
    id: "PRJ-102",
    name: "Metro Central Railway Extension",
    code: "MCR-E",
    location: "North Suburb Sector 9",
    contractor: "Infrastructure Dynamics",
    status: "MODERATE",
    totalWorkers: 185,
    activeZones: 4,
    startDate: "2026-01-10"
  },
  {
    id: "PRJ-103",
    name: "Harbor Bay Bridge & Viaduct",
    code: "HBB-V",
    location: "Coastal Port Zone B",
    contractor: "Apex Civil & Marine",
    status: "NORMAL",
    totalWorkers: 210,
    activeZones: 5,
    startDate: "2025-08-20"
  }
];

const ProjectContext = createContext(null);

export function ProjectProvider({ children }) {
  const [projects] = useState(AVAILABLE_PROJECTS);
  const [selectedProjectId, setSelectedProjectIdState] = useState(() => {
    const saved = localStorage.getItem('buildsure_selected_project_id');
    return saved && AVAILABLE_PROJECTS.some(p => p.id === saved) ? saved : "PRJ-101";
  });
  const [isSimulationMode, setIsSimulationMode] = useState(false);

  const selectedProject = projects.find(p => p.id === selectedProjectId) || projects[0];

  const setSelectedProject = (project) => {
    if (!project) return;
    const pId = typeof project === 'string' ? project : project.id;
    if (pId) {
      setSelectedProjectIdState(pId);
      localStorage.setItem('buildsure_selected_project_id', pId);
    }
  };

  const setSelectedProjectId = (pId) => {
    if (pId) {
      setSelectedProjectIdState(pId);
      localStorage.setItem('buildsure_selected_project_id', pId);
    }
  };

  const toggleSimulationMode = () => {
    setIsSimulationMode(prev => !prev);
  };

  return (
    <ProjectContext.Provider
      value={{
        projects,
        selectedProject,
        selectedProjectId: selectedProject.id,
        selectedProjectName: selectedProject.name,
        selectedProjectCode: selectedProject.code || selectedProject.id,
        projectStatus: selectedProject.status,
        isSimulationMode,
        setIsSimulationMode,
        toggleSimulationMode,
        setSelectedProject,
        setSelectedProjectId
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
}
