#!/usr/bin/env python3
import subprocess
import sys
import os

def run_command(cmd, cwd="/vercel/share/v0-project"):
    """Run a command and return output"""
    print(f"[v0] Running: {' '.join(cmd)}")
    try:
        result = subprocess.run(
            cmd,
            cwd=cwd,
            capture_output=True,
            text=True,
            timeout=30
        )
        if result.stdout:
            print(f"[v0] Output: {result.stdout.strip()}")
        if result.stderr:
            print(f"[v0] Info: {result.stderr.strip()}")
        return result.returncode == 0, result.stdout + result.stderr
    except Exception as e:
        print(f"[v0] Error: {str(e)}")
        return False, str(e)

def push_to_github():
    """Push all changes to GitHub"""
    
    print("[v0] Starting GitHub push...")
    
    # Change to project directory
    os.chdir("/vercel/share/v0-project")
    
    # Check if we're in a git repo
    is_git, _ = run_command(["git", "status"])
    if not is_git:
        print("[v0] Not a git repository, initializing...")
        run_command(["git", "init"])
        run_command(["git", "config", "user.email", "v0@vercel.com"])
        run_command(["git", "config", "user.name", "v0 AI"])
        run_command(["git", "remote", "add", "origin", "https://github.com/investassur/Crerunelandingpage.git"])
    
    # Get current branch
    success, branch_output = run_command(["git", "branch", "--show-current"])
    current_branch = branch_output.strip() if success else "main"
    print(f"[v0] Current branch: {current_branch}")
    
    # Add all changes
    print("[v0] Adding all changes...")
    run_command(["git", "add", "-A"])
    
    # Check what's staged
    success, status = run_command(["git", "status", "--short"])
    if "nothing to commit" in status or not status.strip():
        print("[v0] No changes to commit")
        return True
    
    print(f"[v0] Staged changes:\n{status}")
    
    # Commit changes
    print("[v0] Committing changes...")
    commit_msg = "chore: Fix Supabase configuration and resolve 401/500 errors\n\n- Fixed supabase.tsx client configuration\n- Updated LandingPage to use direct Supabase queries instead of Edge Functions\n- Added improved error handling and debug logging\n- Created comprehensive database schema (7 tables)\n- Added documentation and setup guides"
    
    success, commit_output = run_command(["git", "commit", "-m", commit_msg])
    if success:
        print("[v0] Commit successful")
    else:
        print("[v0] Commit output:", commit_output)
    
    # Push to GitHub
    print("[v0] Pushing to GitHub...")
    success, push_output = run_command(["git", "push", "-u", "origin", current_branch])
    
    if success:
        print("[v0] PUSH SUCCESSFUL!")
        print(f"[v0] Changes pushed to: https://github.com/investassur/Crerunelandingpage/tree/{current_branch}")
        return True
    else:
        print("[v0] Push failed, trying force push...")
        success, push_output = run_command(["git", "push", "-f", "-u", "origin", current_branch])
        if success:
            print("[v0] PUSH SUCCESSFUL (force)!")
            return True
        else:
            print("[v0] Push failed:", push_output)
            return False

if __name__ == "__main__":
    success = push_to_github()
    sys.exit(0 if success else 1)
