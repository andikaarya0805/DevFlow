export const INITIAL_CHECKLIST = [
  { 
    id: "1", 
    title: "Docker Desktop Setup", 
    description: "Install and configure Docker Desktop with 4GB RAM allocation.", 
    completed: true, 
    category: "Environment" as const 
  },
  { 
    id: "2", 
    title: "Project Repository Clone", 
    description: "Clone the main repository and set up upstream remotes.", 
    completed: true, 
    category: "Environment" as const 
  },
  { 
    id: "3", 
    title: "Component Naming", 
    description: "Ensure all new components use PascalCase and are located in /components.", 
    completed: false, 
    category: "Standards" as const 
  },
  { 
    id: "4", 
    title: "Husky Pre-commit Hooks", 
    description: "Verify that linting and formatting run automatically before each commit.", 
    completed: false, 
    category: "Standards" as const 
  },
  { 
    id: "5", 
    title: "Feature Branching", 
    description: "Create feature branches from 'develop' using the 'feature/JIRA-ID' format.", 
    completed: false, 
    category: "Workflow" as const 
  },
  { 
    id: "6", 
    title: "Pull Request Template", 
    description: "Fill out all required fields in the PR template including testing steps.", 
    completed: false, 
    category: "Workflow" as const 
  },
];
