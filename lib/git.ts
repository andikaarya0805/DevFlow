import axios from "axios";

export type GitProvider = 'github' | 'gitlab';

export interface GitValidationResult {
  success: boolean;
  message: string;
}

export const verifyGitTask = async (
  provider: GitProvider,
  repoUrl: string,
  token: string | undefined,
  validationType: 'branch' | 'pr' | 'status',
  criteria: string
): Promise<GitValidationResult> => {
  try {
    if (provider === 'github') {
      return await verifyGithub(repoUrl, token, validationType, criteria);
    } else {
      // Basic GitLab placeholder for now
      return { success: false, message: "GitLab integration pending implementation." };
    }
  } catch (error: any) {
    console.error("Git verification error:", error);
    return { 
      success: false, 
      message: error.response?.data?.message || error.message || "Failed to connect to Git provider." 
    };
  }
};

const verifyGithub = async (
  repoUrl: string,
  token: string | undefined,
  validationType: 'branch' | 'pr' | 'status',
  criteria: string
): Promise<GitValidationResult> => {
  // Extract owner and repo from URL: https://github.com/owner/repo
  const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
  if (!match) return { success: false, message: "Invalid GitHub repository URL." };
  
  const [_, owner, repo] = match;
  const baseUrl = `https://api.github.com/repos/${owner}/${repo.replace(/\.git$/, '')}`;
  
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3+json',
  };
  if (token) {
    headers['Authorization'] = `token ${token}`;
  }

  if (validationType === 'branch') {
    // Check if branch exists or matches criteria (regex)
    const { data: branches } = await axios.get(`${baseUrl}/branches`, { headers });
    const exists = branches.some((b: any) => {
        const regex = new RegExp(criteria);
        return regex.test(b.name);
    });
    
    if (exists) {
      return { success: true, message: `Branch matching "${criteria}" found.` };
    } else {
      return { success: false, message: `No branch found matching "${criteria}".` };
    }
  } 
  
  if (validationType === 'status') {
    // Check if GitHub Actions (Check Runs) passed for a branch or ref
    const ref = criteria || 'main'; // default to main if not specified
    const { data: checkRuns } = await axios.get(`${baseUrl}/commits/${ref}/check-runs`, { headers });
    
    if (checkRuns.total_count === 0) {
      return { success: false, message: `No CI/CD check runs found for ref "${ref}".` };
    }

    const allPassed = checkRuns.check_runs.every((run: any) => 
      run.status === 'completed' && run.conclusion === 'success'
    );

    if (allPassed) {
      return { success: true, message: `All ${checkRuns.total_count} CI/CD checks passed for "${ref}".` };
    } else {
      const failedCount = checkRuns.check_runs.filter((r: any) => r.conclusion !== 'success').length;
      return { success: false, message: `${failedCount}/${checkRuns.total_count} CI/CD checks failed or pending for "${ref}".` };
    }
  }

  if (validationType === 'pr') {
    const { data: prs } = await axios.get(`${baseUrl}/pulls?state=all`, { headers });
    const exists = prs.some((pr: any) => {
        const regex = new RegExp(criteria);
        return regex.test(pr.title) || regex.test(pr.head.ref);
    });

    if (exists) {
      return { success: true, message: `Pull Request matching "${criteria}" found.` };
    } else {
      return { success: false, message: `No Pull Request found matching "${criteria}".` };
    }
  }

  return { success: false, message: "Unknown validation type." };
};
