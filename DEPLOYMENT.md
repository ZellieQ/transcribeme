# Speech Recognition Application Deployment Guide

This guide provides instructions for deploying the Speech Recognition application to various production environments.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Local Production Testing](#local-production-testing)
3. [Deployment Options](#deployment-options)
   - [Netlify](#netlify)
   - [Vercel](#vercel)
   - [GitHub Pages](#github-pages)
   - [AWS S3 + CloudFront](#aws-s3--cloudfront)
   - [Firebase Hosting](#firebase-hosting)
4. [Environment Variables](#environment-variables)
5. [Continuous Integration/Continuous Deployment (CI/CD)](#continuous-integrationcontinuous-deployment-cicd)
6. [Post-Deployment Verification](#post-deployment-verification)

## Prerequisites

Before deploying, ensure you have:

- Node.js (v14 or higher) and npm installed
- Git for version control
- A production build of the application (`npm run build`)
- Access to your chosen hosting platform

## Local Production Testing

To test the production build locally:

```bash
# Install serve globally
npm install -g serve

# Serve the production build
serve -s build
```

This will start a local server (typically on port 3000) serving your production-ready application.

## Deployment Options

### Netlify

Netlify offers an easy way to deploy React applications with continuous deployment.

1. Create an account on [Netlify](https://www.netlify.com/)
2. Connect your GitHub/GitLab/Bitbucket repository
3. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `build`
4. Deploy

**Manual Deployment (without Git):**

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy the build folder
netlify deploy --prod --dir=build
```

### Vercel

Vercel is optimized for React applications and offers a seamless deployment experience.

1. Create an account on [Vercel](https://vercel.com/)
2. Install Vercel CLI: `npm install -g vercel`
3. Run `vercel` in your project directory and follow the prompts
4. For production deployment: `vercel --prod`

### GitHub Pages

To deploy to GitHub Pages:

1. Add `homepage` to your `package.json`:
   ```json
   "homepage": "https://yourusername.github.io/repo-name"
   ```

2. Install GitHub Pages package:
   ```bash
   npm install --save-dev gh-pages
   ```

3. Add deployment scripts to `package.json`:
   ```json
   "scripts": {
     "predeploy": "npm run build",
     "deploy": "gh-pages -d build"
   }
   ```

4. Deploy:
   ```bash
   npm run deploy
   ```

### AWS S3 + CloudFront

For a scalable, high-performance hosting solution:

1. Create an S3 bucket configured for static website hosting
2. Build your app: `npm run build`
3. Upload the contents of the `build` folder to your S3 bucket
4. (Optional) Set up CloudFront for CDN capabilities

Using AWS CLI:
```bash
aws s3 sync build/ s3://your-bucket-name --delete
```

### Firebase Hosting

1. Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

3. Initialize Firebase in your project:
   ```bash
   firebase init
   ```
   - Select "Hosting"
   - Choose your Firebase project
   - Specify "build" as your public directory
   - Configure as a single-page app: Yes
   - Set up automatic builds and deploys with GitHub: Optional

4. Deploy:
   ```bash
   firebase deploy
   ```

## Environment Variables

For production deployments, ensure all necessary environment variables are set:

1. Create a `.env.production` file for production-specific variables
2. Ensure sensitive information is properly secured
3. Configure environment variables in your hosting platform's dashboard

## Continuous Integration/Continuous Deployment (CI/CD)

Setting up CI/CD will automate the deployment process:

1. **GitHub Actions**: Create a workflow file in `.github/workflows/deploy.yml`
2. **GitLab CI/CD**: Configure a `.gitlab-ci.yml` file
3. **Jenkins**: Set up a Jenkinsfile for deployment

Example GitHub Actions workflow:
```yaml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Use Node.js
        uses: actions/setup-node@v1
        with:
          node-version: '16.x'
      - run: npm ci
      - run: npm run build
      - name: Deploy to Netlify
        uses: netlify/actions/cli@master
        with:
          args: deploy --dir=build --prod
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

## Post-Deployment Verification

After deployment, verify:

1. The application loads correctly
2. All features work as expected:
   - File upload and transcription
   - Microphone transcription
   - Language selection
   - Waveform visualization
   - Export options
3. Check browser console for any errors
4. Test on multiple devices and browsers

## Important Notes for This Application

1. **Web Speech API Compatibility**: The Web Speech API is not supported in all browsers. Ensure the Whisper fallback works correctly in production.

2. **Silent Audio Processing**: Verify that audio files are processed without playback in the production environment.

3. **Cross-Origin Resource Sharing (CORS)**: If you're using separate APIs, ensure CORS is properly configured.

4. **Performance Optimization**: The waveform visualization may impact performance on low-end devices. Consider adding a toggle to disable it if needed.

5. **Transformers.js Model Loading**: If using Transformers.js for Whisper models, ensure the models are properly cached and loaded in the production environment.

---

For any issues or questions regarding deployment, please refer to the documentation of your chosen hosting platform or open an issue in the project repository.
