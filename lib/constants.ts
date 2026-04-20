export const INITIAL_CHECKLIST = [
  { 
    id: "1", 
    title: "Project Repository Clone", 
    description: "Clone the main repository and set up upstream remotes.", 
    completed: true, 
    category: "Environment" as const 
  },
  { 
    id: "2", 
    title: "Environment Configuration", 
    description: "Create .env.local from .env.example and populate required API keys.", 
    completed: false, 
    category: "Environment" as const 
  },
  { 
    id: "3", 
    title: "Database Sync", 
    description: "Run migrations (e.g. npx prisma db push) to sync your local schema.", 
    completed: false, 
    category: "Environment" as const 
  },
  { 
    id: "4", 
    title: "Docker Desktop Setup", 
    description: "Install and configure Docker Desktop with 4GB RAM allocation.", 
    completed: false, 
    category: "Environment" as const 
  },
  { 
    id: "5", 
    title: "Component Naming", 
    description: "Ensure all new components use PascalCase and are located in /components.", 
    completed: false, 
    category: "Standards" as const 
  },
  { 
    id: "6", 
    title: "Husky Pre-commit Hooks", 
    description: "Verify that linting and formatting run automatically before each commit.", 
    completed: false, 
    category: "Standards" as const 
  },
  { 
    id: "7", 
    title: "Linting & Test Suite", 
    description: "Pass all core unit tests and linting checks in CI/CD pipeline.", 
    completed: false, 
    category: "Standards" as const,
    validationType: "status",
    validationCriteria: "main" 
  },
  { 
    id: "8", 
    title: "Feature Branching", 
    description: "Create feature branches from 'develop' using the 'feature/.*' format.", 
    completed: false, 
    category: "Workflow" as const,
    validationType: "branch",
    validationCriteria: "feature/.*"
  },
  { 
    id: "9", 
    title: "Pull Request Template", 
    description: "Fill out all required fields in the PR template including testing steps.", 
    completed: false, 
    category: "Workflow" as const,
    validationType: "pr",
    validationCriteria: ".*"
  },
  { 
    id: "10", 
    title: "Team Sync & Docs", 
    description: "Read architecture docs and join the project Slack/Discord channel.", 
    completed: false, 
    category: "Workflow" as const 
  },
];
