# mark-it-down

A modern markdown hosting and editing platform built with Next.js, shadcn/ui, and MongoDB.

## Features

- **Authentication**: Simple email/password authentication using NextAuth.js
- **GitHub Integration**: Connect your GitHub account and sync your files to repositories
- **File Management**: Create, edit, and delete markdown and text files
- **Folder Organization**: Organize your files in folders and subfolders
- **Markdown Editor**: Built-in markdown editor with live preview
- **Database Storage**: All files and folders are stored in MongoDB
- **GitHub Sync**: Push your entire file structure to your personal GitHub repository

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **UI Components**: shadcn/ui with Tailwind CSS
- **Authentication**: NextAuth.js
- **Database**: MongoDB
- **Markdown Rendering**: react-markdown with remark-gfm

## Getting Started

### Prerequisites

- Node.js 18+ installed
- MongoDB instance running (local or cloud like MongoDB Atlas)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/ParthJain18/mark-it-down.git
cd mark-it-down
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
   - Copy `.env.example` to `.env.local`
   - Update the MongoDB URI with your connection string
   - Change the NEXTAUTH_SECRET to a secure random string
   - (Optional) Add GitHub OAuth credentials for GitHub sync feature

```bash
cp .env.example .env.local
```

#### Setting up GitHub OAuth (Optional)

To enable GitHub sync functionality:

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in the application details:
   - Application name: `mark-it-down` (or your preferred name)
   - Homepage URL: `http://localhost:3000` (or your deployment URL)
   - Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
4. Click "Register application"
5. Copy the Client ID and generate a new Client Secret
6. Add them to your `.env.local`:
   ```
   GITHUB_CLIENT_ID=your_client_id
   GITHUB_CLIENT_SECRET=your_client_secret
   ```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### Register an Account

1. Navigate to the register page
2. Enter your email and password
3. Click "Create Account"

### Login

1. Navigate to the login page
2. Enter your credentials
3. Click "Sign In"

### Create Folders

1. In the dashboard, click the folder icon (+) in the sidebar
2. Enter a folder name
3. Click "Create"

### Create Files

1. Click the file icon (+) in the sidebar
2. Enter a file name
3. Select file type (Markdown or Text)
4. Click "Create"

### Edit Files

1. Click on a file in the sidebar
2. Click "Edit" button
3. Make your changes
4. Click "Save"

### GitHub Sync

1. Connect your GitHub account (if not already connected)
   - Click "Connect GitHub" in the GitHub Sync panel
   - Authorize the application
2. Select an existing repository or create a new one
3. Click "Sync to GitHub"
4. Your entire file structure will be pushed to the selected repository

## Project Structure

```
mark-it-down/
├── app/
│   ├── (auth)/
│   │   ├── login/          # Login page
│   │   └── register/       # Register page
│   ├── (dashboard)/
│   │   └── dashboard/      # Main dashboard
│   ├── api/
│   │   ├── auth/           # NextAuth configuration
│   │   ├── files/          # File CRUD operations
│   │   ├── folders/        # Folder CRUD operations
│   │   └── register/       # User registration
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Home page (redirects to login)
├── components/
│   ├── ui/                 # shadcn/ui components
│   └── auth-provider.tsx   # NextAuth session provider
├── lib/
│   ├── auth.ts            # NextAuth configuration
│   ├── mongodb.ts         # MongoDB connection
│   └── utils.ts           # Utility functions
├── models/
│   └── types.ts           # TypeScript types for models
└── types/
    └── next-auth.d.ts     # NextAuth type extensions
```

## Environment Variables

Required:
- `MONGODB_URI` - MongoDB connection string
- `NEXTAUTH_SECRET` - Random secret for JWT
- `NEXTAUTH_URL` - Application URL

Optional (for GitHub sync):
- `GITHUB_CLIENT_ID` - GitHub OAuth App Client ID
- `GITHUB_CLIENT_SECRET` - GitHub OAuth App Client Secret

## License

MIT
