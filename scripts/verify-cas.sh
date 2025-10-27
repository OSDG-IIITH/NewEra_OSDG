#!/bin/bash

# CAS Authentication Verification Script

echo "============================================"
echo "CAS Authentication Configuration Check"
echo "============================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if files exist
echo -e "${BLUE}Checking configuration files...${NC}"

if [ -f "src/app/api/auth/cas/login/route.ts" ]; then
    echo -e "${GREEN}✓${NC} Login route exists"
    
    # Check if it has the correct CAS URL
    if grep -q "login-test2.iiit.ac.in" "src/app/api/auth/cas/login/route.ts"; then
        echo -e "${GREEN}✓${NC} Using login-test2.iiit.ac.in"
    else
        echo -e "${RED}✗${NC} Not using login-test2.iiit.ac.in"
    fi
else
    echo -e "${RED}✗${NC} Login route missing"
fi

if [ -f "src/app/api/auth/cas/callback/route.ts" ]; then
    echo -e "${GREEN}✓${NC} Callback route exists"
    
    # Check if it has the correct CAS URL
    if grep -q "login-test2.iiit.ac.in" "src/app/api/auth/cas/callback/route.ts"; then
        echo -e "${GREEN}✓${NC} Using login-test2.iiit.ac.in"
    else
        echo -e "${RED}✗${NC} Not using login-test2.iiit.ac.in"
    fi
else
    echo -e "${RED}✗${NC} Callback route missing"
fi

if [ -f "src/contexts/AuthContext.tsx" ]; then
    echo -e "${GREEN}✓${NC} AuthContext exists"
    
    # Check if it has the login function
    if grep -q "window.location.href = loginUrl" "src/contexts/AuthContext.tsx"; then
        echo -e "${GREEN}✓${NC} Uses full page redirect"
    else
        echo -e "${YELLOW}⚠${NC} Login method might need review"
    fi
else
    echo -e "${RED}✗${NC} AuthContext missing"
fi

echo ""
echo -e "${BLUE}Checking Docker configuration...${NC}"

if [ -f "docker-compose.yml" ]; then
    echo -e "${GREEN}✓${NC} docker-compose.yml exists"
    
    if grep -q "CAS_BASE_URL" "docker-compose.yml"; then
        echo -e "${GREEN}✓${NC} CAS_BASE_URL configured"
        echo -e "   $(grep 'CAS_BASE_URL' docker-compose.yml | sed 's/^[[:space:]]*//')"
    else
        echo -e "${YELLOW}⚠${NC} CAS_BASE_URL not set (will use default)"
    fi
else
    echo -e "${RED}✗${NC} docker-compose.yml missing"
fi

if [ -f "docker-compose.prod.yml" ]; then
    echo -e "${GREEN}✓${NC} docker-compose.prod.yml exists"
    
    if grep -q "CAS_BASE_URL" "docker-compose.prod.yml"; then
        echo -e "${GREEN}✓${NC} Production CAS_BASE_URL configured"
        echo -e "   $(grep 'CAS_BASE_URL' docker-compose.prod.yml | sed 's/^[[:space:]]*//')"
    else
        echo -e "${YELLOW}⚠${NC} Production CAS_BASE_URL not set"
    fi
else
    echo -e "${YELLOW}⚠${NC} docker-compose.prod.yml missing"
fi

echo ""
echo -e "${BLUE}Expected CAS Flow:${NC}"
echo ""
echo -e "1. User clicks 'CAS Login'"
echo -e "2. Redirects to: ${GREEN}/api/auth/cas/login${NC}"
echo -e "3. Backend redirects to: ${GREEN}https://login-test2.iiit.ac.in/cas/login${NC}"
echo -e "4. User enters credentials"
echo -e "5. CAS redirects back to: ${GREEN}/api/auth/cas/callback?ticket=ST-xxx${NC}"
echo -e "6. Backend validates ticket"
echo -e "7. Redirects to: ${GREEN}/?casAuth=success&username=...&name=...&email=...${NC}"
echo -e "8. Frontend reads params and logs in user ✅"
echo ""

echo -e "${BLUE}Testing URLs:${NC}"
echo ""
echo -e "Localhost: ${GREEN}http://localhost:3000${NC}"
echo -e "Production: ${GREEN}https://osdg.in${NC}"
echo ""

echo -e "${BLUE}To test:${NC}"
echo -e "1. Development: ${YELLOW}pnpm dev${NC}"
echo -e "2. Docker:      ${YELLOW}docker-compose up -d${NC}"
echo -e "3. Production:  ${YELLOW}docker-compose -f docker-compose.prod.yml up -d${NC}"
echo ""

echo -e "${GREEN}Configuration check complete!${NC}"
echo ""
echo "For detailed testing, see: CAS_TESTING_GUIDE.md"
echo "============================================"
