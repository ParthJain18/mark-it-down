# Testing Guide

## Prerequisites for Testing

Before testing the application, ensure you have:

1. **Node.js** (v18 or higher) installed
2. **MongoDB** running locally or access to MongoDB Atlas
3. Environment variables configured in `.env.local`

## Setting up MongoDB

### Option 1: Local MongoDB

1. Install MongoDB Community Edition
2. Start MongoDB service:
   ```bash
   mongod --dbpath /path/to/data
   ```
3. The default connection string is: `mongodb://localhost:27017/markdown-app`

### Option 2: MongoDB Atlas (Cloud)

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Get your connection string and update `.env.local`:
   ```
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/markdown-app
   ```

## Running the Application

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your MongoDB connection string
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Manual Testing Checklist

### Authentication Tests

- [ ] **Register a new account**
  - Navigate to `/register`
  - Enter email and password
  - Verify account creation
  - Check redirect to login page

- [ ] **Login with credentials**
  - Navigate to `/login`
  - Enter registered email and password
  - Verify successful login
  - Check redirect to dashboard

- [ ] **Invalid login attempt**
  - Try logging in with wrong password
  - Verify error message is displayed

- [ ] **Logout**
  - Click logout button in dashboard
  - Verify redirect to login page

### Folder Management Tests

- [ ] **Create a folder**
  - Click the folder+ icon
  - Enter folder name
  - Verify folder appears in sidebar

- [ ] **Navigate into folder**
  - Click on a folder
  - Verify folder contents are shown
  - Verify "Back" button appears

- [ ] **Create nested folder**
  - Navigate into a folder
  - Create a new folder
  - Verify it's created in the correct parent

- [ ] **Delete a folder**
  - Click delete icon on a folder
  - Confirm deletion
  - Verify folder is removed

### File Management Tests

- [ ] **Create a markdown file**
  - Click the file+ icon
  - Enter file name
  - Select "Markdown" type
  - Verify file appears in sidebar

- [ ] **Create a text file**
  - Click the file+ icon
  - Enter file name
  - Select "Text" type
  - Verify file appears in sidebar

- [ ] **Edit a file**
  - Click on a file
  - Click "Edit" button
  - Add some content
  - Click "Save"
  - Verify content is saved

- [ ] **View markdown preview**
  - Create/edit a markdown file
  - Add markdown syntax (headers, lists, etc.)
  - Save the file
  - Verify markdown is rendered correctly

- [ ] **Delete a file**
  - Click delete icon on a file
  - Confirm deletion
  - Verify file is removed

### Data Persistence Tests

- [ ] **Data persists after logout**
  - Create folders and files
  - Logout
  - Login again
  - Verify all folders and files are still there

- [ ] **Data persists after browser refresh**
  - Create folders and files
  - Refresh the page
  - Verify all folders and files are still there

## Testing with Different Browsers

Test the application on:
- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari (if on macOS)

## Known Limitations

- File content is stored in MongoDB (text field)
- No file size limits currently implemented
- No multi-user collaboration features
- No file sharing between users
- Authentication uses JWT sessions (expires on browser close or after timeout)

## Performance Testing

For performance testing with larger datasets:

1. Create multiple folders (10+)
2. Create multiple files in each folder (10+ per folder)
3. Add substantial content to files (1000+ lines)
4. Verify the UI remains responsive
5. Check MongoDB query performance

## Reporting Issues

If you encounter any issues:

1. Check browser console for errors
2. Check server logs in terminal
3. Verify MongoDB connection
4. Check `.env.local` configuration
5. Report issues with detailed steps to reproduce
