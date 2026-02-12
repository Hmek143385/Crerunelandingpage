import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('[v0] Starting GitHub push...\n');

try {
  // Check if git is initialized
  if (!fs.existsSync('.git')) {
    console.error('[v0] ERROR: Not a git repository');
    process.exit(1);
  }

  // Get current branch
  const currentBranch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf-8' }).trim();
  console.log(`[v0] Current branch: ${currentBranch}\n`);

  // Add all changes
  console.log('[v0] Adding all changes...');
  execSync('git add -A', { stdio: 'inherit' });

  // Check if there are changes to commit
  try {
    execSync('git diff-index --quiet HEAD --');
    console.log('[v0] No changes to commit\n');
    process.exit(0);
  } catch {
    // There are changes, continue
  }

  // Show what will be committed
  console.log('[v0] Changes to be committed:');
  execSync('git diff --cached --name-only', { stdio: 'inherit' });

  // Commit changes
  const commitMessage = '[v0] Fix: Direct Supabase DB queries, error handling, and complete documentation';
  console.log(`\n[v0] Committing: ${commitMessage}`);
  execSync(`git commit -m "${commitMessage}"`, { stdio: 'inherit' });

  // Push to GitHub
  console.log(`\n[v0] Pushing to GitHub (${currentBranch})...`);
  execSync(`git push origin ${currentBranch}`, { stdio: 'inherit' });

  console.log('\n✅ SUCCESS! All changes pushed to GitHub');
  console.log(`📍 Branch: ${currentBranch}`);
  console.log('📍 Repository: https://github.com/investassur/Crerunelandingpage');
  
} catch (error) {
  console.error('\n❌ ERROR: Push failed');
  console.error(error.message);
  process.exit(1);
}
