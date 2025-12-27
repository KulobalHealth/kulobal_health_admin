# Vercel Deployment Instructions for React Project

## 1. Prerequisites
- Ensure you have a Vercel account: https://vercel.com/signup
- Install Vercel CLI (optional, for local deploy):
  ```sh
  npm install -g vercel
  ```

## 2. Project Build Setup
- Your React app should have a build script in `package.json`:
  ```json
  "scripts": {
    "build": "react-scripts build"
  }
  ```
- The production build output will be in the `build/` directory.

## 3. Add `vercel.json`
- The provided `vercel.json` configures Vercel for static React hosting and SPA routing.

## 4. Deploy to Vercel
### Option 1: Using Vercel Dashboard
1. Push your code to GitHub, GitLab, or Bitbucket.
2. Go to https://vercel.com/new and import your repository.
3. Set the build command to `npm run build` and output directory to `build` if prompted.
4. Click "Deploy".

### Option 2: Using Vercel CLI
1. In your project root, run:
   ```sh
   vercel
   ```
2. Follow the prompts (set build command to `npm run build`, output directory to `build`).

## 5. Environment Variables (Optional)
- Set any required environment variables in the Vercel dashboard under Project Settings > Environment Variables.

## 6. Custom Domain (Optional)
- Add a custom domain in the Vercel dashboard if desired.

---

**Your React app is now ready for Vercel!**
