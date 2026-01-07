# GitHub Sync Feature

This document explains how to set up and use the GitHub sync feature in mark-it-down.

## Overview

The GitHub sync feature allows you to synchronize your entire file structure (markdown and text files) with your personal GitHub repositories. This enables you to:

- Backup your work to GitHub
- Version control your markdown files
- Share your work publicly or privately
- Access your files from anywhere via GitHub

## Setup

### 1. Create a GitHub OAuth App

To enable GitHub integration, you need to create a GitHub OAuth App:

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **"OAuth Apps"** in the left sidebar
3. Click **"New OAuth App"**
4. Fill in the application details:
   - **Application name**: `mark-it-down` (or any name you prefer)
   - **Homepage URL**: `http://localhost:3000` (for local development) or your deployment URL
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github` (for local development)
   - For production, use your actual domain (e.g., `https://yourdomain.com/api/auth/callback/github`)
5. Click **"Register application"**
6. You will see your **Client ID** - copy this
7. Click **"Generate a new client secret"** and copy the secret

### 2. Configure Environment Variables

Add the GitHub OAuth credentials to your `.env.local` file:

```bash
# Existing variables
MONGODB_URI=mongodb://localhost:27017/markdown-app
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# Add these for GitHub sync
GITHUB_CLIENT_ID=your_github_client_id_here
GITHUB_CLIENT_SECRET=your_github_client_secret_here
```

**Important**: Never commit your `.env.local` file to version control. It contains sensitive credentials.

### 3. Restart the Development Server

After adding the environment variables, restart your development server:

```bash
npm run dev
```

## Usage

### Connect Your GitHub Account

1. Log in to your mark-it-down account
2. Navigate to the dashboard
3. Look for the **"GitHub Sync"** panel on the right side
4. If not already connected, click **"Connect GitHub"**
5. You'll be redirected to GitHub to authorize the application
6. Grant the requested permissions (read user info and repository access)
7. You'll be redirected back to the dashboard

### Sync Your Files

#### Option 1: Sync to an Existing Repository

1. In the GitHub Sync panel, click the dropdown under **"Select Repository"**
2. Choose one of your existing GitHub repositories
3. Click **"Sync to GitHub"**
4. Wait for the sync to complete
5. You'll see a success message with the number of files synced

#### Option 2: Create a New Repository and Sync

1. In the GitHub Sync panel, click the **"+"** button next to the repository dropdown
2. Enter a repository name (e.g., `my-markdown-files`)
3. Optionally add a description
4. Choose whether to make it private or public
5. Click **"Create Repository"**
6. The new repository will be automatically selected
7. Click **"Sync to GitHub"**
8. Your files will be pushed to the new repository

## How It Works

### File Structure Preservation

The sync feature preserves your folder structure in GitHub:

```
Your mark-it-down structure:
/
├── folder1/
│   ├── file1.md
│   └── file2.md
└── notes.md

Synced to GitHub:
your-repo/
├── folder1/
│   ├── file1.md
│   └── file2.md
└── notes.md
```

### Sync Process

1. **File Collection**: All your files and folders are retrieved from the database
2. **Tree Creation**: Files are organized into a Git tree structure
3. **Commit Creation**: A new commit is created with message "Sync from mark-it-down - [timestamp]"
4. **Push**: The commit is pushed to the selected branch (usually `main` or `master`)

### Permissions Required

The GitHub OAuth app requests the following permissions:

- `read:user` - To get your GitHub username
- `user:email` - To access your email address
- `repo` - To create and push to repositories

## Troubleshooting

### "GitHub authentication required" error

- **Solution**: Make sure you've connected your GitHub account. Click "Connect GitHub" in the sync panel.

### "Failed to fetch repositories" error

- **Cause**: Your GitHub access token may have expired or been revoked
- **Solution**: Disconnect and reconnect your GitHub account

### "Failed to create tree" error

- **Cause**: You might not have write access to the selected repository
- **Solution**: Choose a repository you own or have write access to

### "Failed to update reference" error

- **Cause**: There might be conflicts with the remote repository
- **Solution**: This can happen if the repository has been modified elsewhere. Currently, the sync performs a force push. Consider manually resolving conflicts on GitHub if needed.

## Security Considerations

1. **Access Tokens**: Your GitHub access token is stored securely in the database and is only accessible to your session
2. **Private Repositories**: You can sync to private repositories to keep your content secure
3. **Permissions**: The app only requests the minimum permissions needed for syncing
4. **OAuth Flow**: Uses GitHub's official OAuth flow for authentication

## Best Practices

1. **Regular Syncing**: Sync your files regularly to keep your GitHub repository up-to-date
2. **Meaningful Repository Names**: Use descriptive names for your repositories
3. **Private vs Public**: Use private repositories for personal notes, public for content you want to share
4. **Backup**: GitHub sync acts as a backup, but consider keeping local backups as well
5. **Commit Messages**: All syncs include timestamps in commit messages for tracking

## Limitations

1. **One-way Sync**: Currently, the sync is one-way (mark-it-down → GitHub). Changes made directly on GitHub won't sync back.
2. **Binary Files**: Only text-based files (markdown and text) are synced
3. **File Size**: GitHub has file size limits (100 MB per file, recommend keeping files smaller)
4. **Rate Limits**: GitHub API has rate limits. Avoid syncing too frequently.

## Future Enhancements

Potential future features:

- Bi-directional sync (GitHub → mark-it-down)
- Selective file syncing
- Multiple repository support
- Branch selection
- Sync history and rollback
- Conflict resolution UI
- Automated periodic syncing

## Support

For issues or questions:

1. Check this documentation
2. Review the troubleshooting section
3. Check GitHub API documentation
4. Open an issue on the mark-it-down repository
