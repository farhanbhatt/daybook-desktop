# Netlify Deployment Guide for Update System

## Quick Deployment Steps

### 1. Login to Netlify
- Go to [netlify.com](https://netlify.com)
- Login to your account

### 2. Deploy Your Site
**Option A: Drag & Drop (Easiest)**
1. Create a folder with these files:
   - `update.json`
   - `netlify.toml`
   - `index.html` (optional)
2. Drag the folder to Netlify's deploy area
3. Your site will be deployed instantly

**Option B: Git Integration**
1. Push your code to GitHub
2. In Netlify dashboard, click "New site from Git"
3. Connect your GitHub repository
4. Set build settings:
   - Build command: `echo 'Static files ready'`
   - Publish directory: `.` (root)
5. Deploy

### 3. Get Your Site URL
- After deployment, Netlify will give you a URL like: `https://amazing-site-name.netlify.app`
- You can customize this URL in site settings

### 4. Update Your App Code
Replace the URL in your `electron-main.js`:
```javascript
const updateUrl = 'https://your-site-name.netlify.app/update.json';
```

### 5. Test the Update System
- Visit: `https://your-site-name.netlify.app/update.json`
- You should see your version info

## Updating Versions
When you release a new version:
1. Update the `update.json` file with new version number and download URL
2. Redeploy to Netlify (automatic if using Git)
3. Your app users will get update notifications

## File Structure
```
your-project/
├── update.json          # Version information
├── netlify.toml         # Netlify configuration
├── index.html           # Optional landing page
└── electron-main.js     # Your app (with update URL)
```

## Security Notes
- The update.json file is publicly accessible
- Don't include sensitive information
- Use HTTPS URLs for downloads
