# LocalHub Deployment Guide

This guide covers deploying the LocalHub ChatGPT app to production.

## Prerequisites

1. **Google Maps API Key**
   - Get an API key from [Google Cloud Console](https://console.cloud.google.com/)
   - Enable the following APIs:
     - Places API
     - Directions API
     - Geocoding API
     - Maps JavaScript API
   - Restrict the API key to your domain in production

2. **Vercel Account**
   - Sign up at [vercel.com](https://vercel.com)
   - Install Vercel CLI: `npm i -g vercel`

3. **GitHub Repository**
   - Push your code to GitHub
   - Ensure `.env.local` is in `.gitignore`

## Deployment Steps

### 1. Configure Environment Variables

In Vercel Dashboard:

1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add the following:
   - `GOOGLE_MAPS_API_KEY`: Your Google Maps API key
   - `NODE_ENV`: `production`

### 2. Deploy to Vercel

#### Option A: Deploy via CLI

```bash
# Login to Vercel
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

#### Option B: Deploy via GitHub Integration

1. Import your repository in Vercel Dashboard
2. Configure build settings:
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
3. Add environment variables
4. Click "Deploy"

### 3. Configure Domain

1. In Vercel Dashboard, go to "Domains"
2. Add your custom domain
3. Update DNS records as instructed
4. Wait for SSL certificate provisioning

### 4. Set Up ChatGPT Integration

1. Update URLs in `public/ai-plugin.json`:
   ```json
   {
     "api": {
       "url": "https://your-domain.com/openapi.yaml"
     },
     "logo_url": "https://your-domain.com/logo.png"
   }
   ```

2. Create an OpenAPI specification (if not already created)

3. Submit your app to ChatGPT:
   - Go to ChatGPT Plugin Store
   - Submit your app for review
   - Provide plugin manifest URL

### 5. Configure CI/CD

The GitHub Actions workflow will automatically:
- Run tests on pull requests
- Deploy preview environments for PRs
- Deploy to production on merge to `main`

Required GitHub Secrets:
- `VERCEL_TOKEN`: Get from Vercel settings
- `VERCEL_ORG_ID`: From Vercel team settings
- `VERCEL_PROJECT_ID`: From Vercel project settings
- `GOOGLE_MAPS_API_KEY`: Your API key (for tests)

### 6. Set Up Monitoring (Optional)

#### Vercel Analytics
- Enable in Vercel Dashboard → Analytics
- Track performance and usage metrics

#### Sentry Error Tracking
```bash
npm install @sentry/nextjs
```

Add to `next.config.js`:
```javascript
const { withSentryConfig } = require('@sentry/nextjs');

module.exports = withSentryConfig(nextConfig, {
  silent: true,
  org: "your-org",
  project: "localhub"
});
```

## Post-Deployment Checklist

- [ ] Verify API endpoints are accessible
- [ ] Test all MCP tools via `/api/mcp`
- [ ] Check map resource loads correctly
- [ ] Verify Google Maps API calls work
- [ ] Test on mobile devices
- [ ] Verify HTTPS is enabled
- [ ] Check CORS headers
- [ ] Test error handling
- [ ] Monitor API rate limits
- [ ] Set up uptime monitoring

## Performance Optimization

### Edge Functions
Vercel automatically deploys API routes as Edge Functions for low latency.

### Caching
The app includes:
- API response caching (5-10 minutes TTL)
- Static asset caching via CDN
- Session state management

### Monitoring
Track these metrics:
- API response times (target: <2s)
- Error rates (target: <0.1%)
- Cache hit rates (target: >60%)
- Google Maps API quota usage

## Troubleshooting

### API Key Issues
```
Error: GOOGLE_MAPS_API_KEY environment variable is not set
```
Solution: Add the environment variable in Vercel Dashboard

### CORS Errors
```
Access to fetch at '...' from origin '...' has been blocked by CORS policy
```
Solution: Check `vercel.json` CORS headers configuration

### Build Failures
```
Module not found: Can't resolve '@/...'
```
Solution: Check `tsconfig.json` path aliases are correct

### Rate Limiting
```
Error: OVER_QUERY_LIMIT
```
Solution: Check Google Maps API quotas and enable billing

## Production URLs

- **Production**: `https://your-domain.com`
- **API Endpoint**: `https://your-domain.com/api/mcp`
- **Plugin Manifest**: `https://your-domain.com/ai-plugin.json`
- **Map Resource**: `https://your-domain.com/resources/map.html`

## Rollback Procedure

If issues occur in production:

```bash
# List recent deployments
vercel list

# Rollback to previous deployment
vercel rollback [deployment-url]
```

Or use Vercel Dashboard → Deployments → Promote to Production

## Support

For issues or questions:
- Check logs: `vercel logs`
- Review Vercel Dashboard analytics
- Contact: support@localhub.app
