# mark-it-down

A modern markdown hosting and editing platform built with Next.js, shadcn/ui, and MongoDB.

## Features

- **Authentication**: Simple email/password authentication using NextAuth.js
- **File Management**: Create, edit, and delete markdown and text files
- **Folder Organization**: Organize your files in folders and subfolders
- **Markdown Editor**: Built-in markdown editor with live preview
- **Database Storage**: All files and folders are stored in MongoDB

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

```bash
cp .env.example .env.local
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

- `MONGODB_URI`: MongoDB connection string
- `NEXTAUTH_SECRET`: Secret key for NextAuth.js
- `NEXTAUTH_URL`: Base URL for authentication callbacks

## License

MIT
