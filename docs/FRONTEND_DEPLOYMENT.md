# Frontend Deployment Guide - Vercel

## Overview
This guide provides step-by-step instructions for deploying the Patient Management System frontend to Vercel.

## Prerequisites
- GitHub account
- Vercel account (free tier available)
- Backend API deployed and accessible

## Deployment Steps

### Method 1: Deploy via Vercel Dashboard (Recommended)

#### 1. Prepare Your Repository

Ensure your code is pushed to GitHub:
```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

#### 2. Import Project to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Select the `frontend` directory as the root directory

#### 3. Configure Build Settings

Vercel will auto-detect Vite configuration. Verify:

- **Framework Preset:** Vite
- **Root Directory:** `frontend`
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

#### 4. Configure Environment Variables

Add the following environment variable:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | Your backend API URL (e.g., `https://your-backend.railway.app/api/v1`) |

#### 5. Deploy

Click "Deploy" and wait for the build to complete (usually 1-2 minutes).

### Method 2: Deploy via Vercel CLI

#### 1. Install Vercel CLI

```bash
npm install -g vercel
```

#### 2. Login to Vercel

```bash
vercel login
```

#### 3. Deploy

```bash
cd frontend
vercel
```

Follow the prompts:
- Set up and deploy? **Yes**
- Which scope? Select your account
- Link to existing project? **No**
- Project name? **patient-management-system**
- Directory? **./  **
- Override settings? **No**

#### 4. Set Environment Variables

```bash
vercel env add VITE_API_URL
# Enter your backend API URL when prompted
```

#### 5. Deploy to Production

```bash
vercel --prod
```

## Post-Deployment Configuration

### 1. Update Backend CORS

Update your backend `.env` file to include your Vercel URL:

```env
CORS_ORIGIN=https://your-app.vercel.app,http://localhost:5173
```

Redeploy your backend after updating CORS settings.

### 2. Test the Deployment

Visit your Vercel URL and test:
- Login functionality
- API connectivity
- All major features
- Mobile responsiveness

### 3. Configure Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Wait for DNS propagation (5-30 minutes)

## Vercel Configuration File

Create `vercel.json` in the frontend directory for advanced configuration:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

## Environment Variables Reference

### Development
```env
VITE_API_URL=http://localhost:3001/api/v1
```

### Production
```env
VITE_API_URL=https://your-backend-url.railway.app/api/v1
```

## Build Optimization

### 1. Bundle Analysis

Check bundle size:
```bash
npm run build
```

The build output will show chunk sizes.

### 2. Optimize Images

- Use WebP format where possible
- Implement lazy loading for images
- Use appropriate image sizes

### 3. Code Splitting

Already configured in `vite.config.ts`:
```typescript
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'react-vendor': ['react', 'react-dom', 'react-router-dom'],
        'ui-vendor': ['lucide-react', 'recharts'],
      },
    },
  },
}
```

## Continuous Deployment

### Automatic Deployments

Vercel automatically deploys:
- **Production:** Pushes to `main` branch
- **Preview:** Pull requests and other branches

### Deployment Triggers

Configure in Vercel Dashboard → Settings → Git:
- Production Branch: `main`
- Deploy Hooks: For external triggers
- Ignored Build Step: Optional build skipping

## Troubleshooting

### Build Failures

**Issue:** Build fails with dependency errors
```bash
# Solution: Clear Vercel cache
vercel --force
```

**Issue:** Environment variables not working
- Ensure variables start with `VITE_`
- Rebuild after adding/changing variables
- Check variable values in Vercel dashboard

### Runtime Issues

**Issue:** API calls failing
- Verify `VITE_API_URL` is correct
- Check backend CORS configuration
- Verify backend is running and accessible

**Issue:** 404 errors on refresh
- Ensure rewrites are configured in `vercel.json`
- Check that SPA routing is properly set up

### Performance Issues

**Issue:** Slow load times
- Check bundle sizes
- Implement code splitting
- Enable caching headers
- Use CDN for static assets

## Monitoring

### Vercel Analytics

Enable in Project Settings → Analytics:
- Page views
- Performance metrics
- User demographics

### Error Tracking

Integrate error tracking (optional):
- Sentry
- LogRocket
- Bugsnag

## Rollback Strategy

### Revert to Previous Deployment

1. Go to Deployments tab
2. Find previous successful deployment
3. Click "..." → "Promote to Production"

### Via CLI

```bash
vercel rollback
```

## Security Best Practices

1. **Environment Variables**
   - Never commit `.env` files
   - Use Vercel's encrypted environment variables
   - Rotate secrets regularly

2. **HTTPS**
   - Vercel provides automatic HTTPS
   - Enforce HTTPS redirects

3. **Headers**
   - Security headers configured in `vercel.json`
   - CORS properly configured on backend

4. **Dependencies**
   - Regularly update dependencies
   - Run security audits: `npm audit`

## Performance Metrics

Target metrics for production:
- **First Contentful Paint:** < 1.8s
- **Time to Interactive:** < 3.9s
- **Lighthouse Score:** > 90

## Cost Optimization

### Vercel Free Tier Limits
- 100 GB bandwidth/month
- Unlimited deployments
- Serverless function executions: 100 GB-hours

### Pro Tier Benefits ($20/month)
- 1 TB bandwidth
- Advanced analytics
- Team collaboration features
- Priority support

## Maintenance

### Regular Tasks
1. Monitor deployment logs
2. Check analytics for errors
3. Review performance metrics
4. Update dependencies monthly
5. Test critical user flows weekly

## Support Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vite Documentation](https://vitejs.dev)
- [React Documentation](https://react.dev)

## Checklist

- [ ] Code pushed to GitHub
- [ ] Project imported to Vercel
- [ ] Environment variables configured
- [ ] Backend CORS updated
- [ ] Deployment successful
- [ ] Login tested
- [ ] API connectivity verified
- [ ] Mobile responsiveness checked
- [ ] Custom domain configured (if needed)
- [ ] Analytics enabled
- [ ] Error tracking set up (optional)

---

Your Patient Management System frontend should now be live on Vercel with automatic deployments for all future updates.
