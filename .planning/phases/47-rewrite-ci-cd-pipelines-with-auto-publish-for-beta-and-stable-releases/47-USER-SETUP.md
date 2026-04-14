# Phase 47 User Setup Guide

The following external services require configuration before Phase 47 features will work.

## npm

**Why:** OIDC trusted publishing for npm

### Dashboard Configuration
Follow these steps in the service dashboard:

- [ ] **Configure trusted publisher for localnest-mcp package**
  - Location: `https://www.npmjs.com/package/localnest-mcp/access -> Trusted Publishers -> Add -> org=wmt-mobile, repo=localnest, workflow=release.yml`

This setup is required for the automated release workflow to push packages securely.
