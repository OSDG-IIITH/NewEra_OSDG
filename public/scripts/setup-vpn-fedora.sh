#!/bin/bash

# IIIT Hyderabad VPN Setup Script for Fedora/RHEL
# Compatible with: Fedora 38+, RHEL 8+/9+, CentOS Stream, AlmaLinux, Rocky Linux
# Author: OSDG Club, IIIT Hyderabad
# Last Updated: October 2025

set -e

# Colors for clean output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
OVPN_CONFIG_PATH="$HOME/Downloads/linux.ovpn"
VPN_PROFILE_NAME="iiith-vpn"

echo -e "${CYAN}==========================================${NC}"
echo -e "${CYAN}  IIIT Hyderabad VPN Setup - Fedora/RHEL${NC}"
echo -e "${CYAN}==========================================${NC}"
echo ""

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
    echo -e "${RED}ERROR: Please do NOT run this script as root${NC}"
    echo -e "${YELLOW}Run without 'sudo' - you'll be prompted for password when needed${NC}"
    exit 1
fi

# Detect package manager
if command -v dnf &> /dev/null; then
    PKG_MGR="dnf"
elif command -v yum &> /dev/null; then
    PKG_MGR="yum"
else
    echo -e "${RED}ERROR: Neither DNF nor YUM package manager found${NC}"
    exit 1
fi

# Function to check internet connectivity
check_internet() {
    if ! ping -c 1 copr.fedorainfracloud.org &> /dev/null; then
        echo -e "${RED}ERROR: No internet connection detected${NC}"
        echo -e "${YELLOW}Please connect to the internet and try again${NC}"
        exit 1
    fi
}

# Check internet connection
echo -e "${YELLOW}[1/6] Checking internet connection...${NC}"
check_internet
echo -e "${GREEN}[OK] Internet connection verified${NC}"
echo ""

# Check if config file exists
echo -e "${YELLOW}[2/6] Checking for VPN configuration file...${NC}"
if [ ! -f "$OVPN_CONFIG_PATH" ]; then
    echo -e "${RED}ERROR: Configuration file not found!${NC}"
    echo -e "${RED}Expected location: $OVPN_CONFIG_PATH${NC}"
    echo ""
    echo -e "${YELLOW}Please:${NC}"
    echo -e "${YELLOW}  1. Download 'linux.ovpn' from the OSDG website${NC}"
    echo -e "${YELLOW}  2. Save it to your Downloads folder${NC}"
    echo -e "${YELLOW}  3. Run this script again${NC}"
    exit 2
fi
echo -e "${GREEN}[OK] Configuration file found${NC}"
echo ""

# Install EPEL repository (required for RHEL/CentOS)
echo -e "${YELLOW}[3/6] Setting up repositories...${NC}"
if [ -f /etc/redhat-release ]; then
    if grep -q "Red Hat\|CentOS\|Rocky\|AlmaLinux" /etc/redhat-release; then
        echo -e "${CYAN}  Installing EPEL repository...${NC}"
        sudo $PKG_MGR install -y epel-release 2>&1 > /dev/null || {
            # For RHEL, we need to enable it differently
            sudo $PKG_MGR install -y https://dl.fedoraproject.org/pub/epel/epel-release-latest-$(rpm -E %rhel).noarch.rpm 2>&1 > /dev/null
        }
    fi
fi
echo -e "${GREEN}[OK] Repositories configured${NC}"
echo ""

# Check if OpenVPN 3 is installed
echo -e "${YELLOW}[4/6] Checking OpenVPN 3 installation...${NC}"
if command -v openvpn3 &> /dev/null; then
    echo -e "${GREEN}[OK] OpenVPN 3 is already installed${NC}"
else
    echo -e "${YELLOW}OpenVPN 3 not found. Installing...${NC}"
    echo ""
    
    # For Fedora, use Copr repository
    if grep -q "Fedora" /etc/redhat-release 2>/dev/null; then
        echo -e "${CYAN}  Enabling Copr repository...${NC}"
        sudo dnf copr enable -y dsommers/openvpn3 2>&1 > /dev/null
        
        echo -e "${CYAN}  Downloading and installing OpenVPN 3...${NC}"
        echo -ne "${CYAN}  [--------------------] Installing packages...${NC}\r"
        sudo dnf install -y openvpn3-client 2>&1 | while read line; do
            echo -ne "${CYAN}  [####################] Installing packages...${NC}\r"
        done
        echo -e "${CYAN}  [####################] Installing packages...${NC}"
    else
        # For RHEL/CentOS/AlmaLinux/Rocky
        echo -e "${CYAN}  Adding repository...${NC}"
        cat <<EOF | sudo tee /etc/yum.repos.d/openvpn3.repo > /dev/null
[openvpn3]
name=OpenVPN 3 - Packages
baseurl=https://swupdate.openvpn.net/community/openvpn3/repos/epel-\$releasever-\$basearch/
enabled=1
gpgcheck=1
gpgkey=https://swupdate.openvpn.net/repos/repo-public.gpg
EOF
        
        echo -e "${CYAN}  Downloading and installing OpenVPN 3...${NC}"
        echo -ne "${CYAN}  [--------------------] Installing packages...${NC}\r"
        sudo $PKG_MGR install -y openvpn3-client 2>&1 | while read line; do
            echo -ne "${CYAN}  [####################] Installing packages...${NC}\r"
        done
        echo -e "${CYAN}  [####################] Installing packages...${NC}"
    fi
    
    # Verify installation
    if ! command -v openvpn3 &> /dev/null; then
        echo -e "${RED}ERROR: OpenVPN 3 installation failed${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}  [OK] Installation complete${NC}"
fi
echo ""

# Import VPN configuration
echo -e "${YELLOW}[5/6] Importing VPN configuration...${NC}"
# Remove existing profile if it exists
openvpn3 config-remove --config "$VPN_PROFILE_NAME" 2>/dev/null || true
# Import new profile
openvpn3 config-import --config "$OVPN_CONFIG_PATH" --name "$VPN_PROFILE_NAME" --persistent > /dev/null 2>&1
echo -e "${GREEN}[OK] Configuration imported${NC}"
echo ""

# Start VPN session
echo -e "${YELLOW}[6/6] Starting VPN connection...${NC}"
echo -e "${CYAN}You will be prompted for your IIIT Hyderabad credentials${NC}"
echo ""

openvpn3 session-start --config "$VPN_PROFILE_NAME"

echo ""
echo -e "${GREEN}==========================================${NC}"
echo -e "${GREEN}  VPN CONNECTED!${NC}"
echo -e "${GREEN}==========================================${NC}"
echo ""
echo -e "${CYAN}USEFUL COMMANDS:${NC}"
echo -e "  Check status:   ${YELLOW}openvpn3 sessions-list${NC}"
echo -e "  Disconnect:     ${YELLOW}openvpn3 session-manage --config $VPN_PROFILE_NAME --disconnect${NC}"
echo -e "  Reconnect:      ${YELLOW}openvpn3 session-start --config $VPN_PROFILE_NAME${NC}"
echo ""
echo -e "${CYAN}Need help? Visit the OSDG website or use WISPR AI!${NC}"
echo ""
