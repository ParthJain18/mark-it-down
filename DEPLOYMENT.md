# Deployment Guide

This guide covers deploying the Markdown Hosting application to production.

## Prerequisites

- MongoDB database (MongoDB Atlas recommended for production)
- Node.js hosting platform (Vercel, Netlify, Railway, etc.)

## Environment Variables

Ensure these environment variables are set in production:

```
MONGODB_URI=<your-production-mongodb-uri>
NEXTAUTH_SECRET=<a-secure-random-string>
NEXTAUTH_URL=<your-production-url>
```

### Generating NEXTAUTH_SECRET

Generate a secure random string for `NEXTAUTH_SECRET`:

```bash
openssl rand -base64 32
```

## Deployment Options

### Option 1: Vercel (Recommended)

1. **Install Vercel CLI** (optional):
   ```bash
   npm i -g vercel
   ```

2. **Connect your repository to Vercel**:
   - Visit [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel will auto-detect Next.js

3. **Set environment variables in Vercel**:
   - Go to Project Settings > Environment Variables
   - Add `MONGODB_URI`, `NEXTAUTH_SECRET`, and `NEXTAUTH_URL`

4. **Deploy**:
   - Push to your repository
   - Vercel will automatically deploy

### Option 2: Railway

1. **Create a new project** on [Railway](https://railway.app)

2. **Connect your GitHub repository**

3. **Add environment variables**:
   - `MONGODB_URI`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL`

4. **Deploy**:
   - Railway will automatically build and deploy

### Option 3: Self-Hosted (Docker)

1. **Create a Dockerfile**:
   ```dockerfile
   FROM node:18-alpine

   WORKDIR /app

   COPY package*.json ./
   RUN npm ci --only=production

   COPY . .
   RUN npm run build

   EXPOSE 3000

   CMD ["npm", "start"]
   ```

2. **Build and run**:
   ```bash
   docker build -t markdown-hosting .
   docker run -p 3000:3000 \
     -e MONGODB_URI=<uri> \
     -e NEXTAUTH_SECRET=<secret> \
     -e NEXTAUTH_URL=<url> \
     markdown-hosting
   ```

## MongoDB Atlas Setup

1. **Create a cluster** at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

2. **Create a database user**:
   - Database Access > Add New Database User
   - Set username and password
   - Grant read/write permissions

3. **Whitelist IP addresses**:
   - Network Access > Add IP Address
   - For Vercel/Railway: Add `0.0.0.0/0` (allow from anywhere)
   - For specific servers: Add your server's IP

4. **Get connection string**:
   - Clusters > Connect > Connect your application
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `<dbname>` with `markdown-app`

## Post-Deployment Checklist

- [ ] Verify MongoDB connection is working
- [ ] Test user registration
- [ ] Test user login
- [ ] Test file/folder creation
- [ ] Test file editing and saving
- [ ] Check error logging
- [ ] Set up monitoring (optional)
- [ ] Configure custom domain (optional)

## Monitoring and Maintenance

### Vercel

- View logs in Vercel Dashboard
- Set up error tracking with Sentry (optional)

### Self-Hosted

- Use PM2 for process management:
  ```bash
  npm install -g pm2
  pm2 start npm --name "markdown-app" -- start
  pm2 logs markdown-app
  ```

## Security Considerations

1. **Never commit `.env.local`** - it's in `.gitignore`
2. **Use strong NEXTAUTH_SECRET** - at least 32 random characters
3. **Keep dependencies updated**:
   ```bash
   npm audit
   npm update
   ```
4. **Enable HTTPS** - most platforms handle this automatically
5. **Implement rate limiting** (future enhancement)
6. **Regular database backups** through MongoDB Atlas

## Troubleshooting

### Build Errors

- Check Node.js version (should be 18+)
- Clear `.next` directory: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`

### Database Connection Issues

- Verify `MONGODB_URI` is correct
- Check MongoDB Atlas IP whitelist
- Ensure database user has correct permissions

### Authentication Issues

- Verify `NEXTAUTH_URL` matches your domain
- Check `NEXTAUTH_SECRET` is set
- Clear browser cookies and try again

## Scaling Considerations

For high-traffic applications:

1. **Database indexing**: Add indexes on frequently queried fields
   ```javascript
   db.users.createIndex({ email: 1 })
   db.files.createIndex({ userId: 1 })
   db.folders.createIndex({ userId: 1 })
   ```

2. **Caching**: Consider Redis for session storage

3. **CDN**: Use Vercel's Edge Network or Cloudflare

4. **Database sharding**: For very large datasets in MongoDB

## Support

For deployment issues or questions, please open an issue on GitHub.
