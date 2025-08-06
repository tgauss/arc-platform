#!/bin/bash

echo "🚀 Deploying ARC Platform to Vercel"
echo "=================================="

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${YELLOW}📦 Installing dependencies...${NC}"
npm install

echo -e "${YELLOW}🏗️ Building Next.js app...${NC}"
cd apps/web && npm run build && cd ../..

echo -e "${YELLOW}✅ Build successful! Ready to deploy.${NC}"

echo -e "${BLUE}Run: vercel --prod${NC}"
echo -e "${BLUE}Or link to existing project: vercel link${NC}"