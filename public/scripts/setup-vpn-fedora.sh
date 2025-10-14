#!/bin/bash

# IIIT Hyderabad VPN Setup Script for Fedora/RHEL/CentOS
# Compatible with: Fedora 38+, RHEL 8+/9+, CentOS Stream, AlmaLinux, Rocky Linux
# Author: OSDG Club, IIIT Hyderabad
# Last Updated: October 2025

set -e

# Colors for clean output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Configuration
OVPN_CONFIG_PATH="$HOME/Downloads/ubuntu_new.ovpn"
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

# Detect distribution
if [ -f /etc/os-release ]; then
    . /etc/os-release
    DISTRO_ID=$ID
    VERSION_ID_MAJOR=${VERSION_ID%%.*}
else
    echo -e "${RED}ERROR: Cannot detect distribution${NC}"
    exit 1
fi

# Function to check internet connectivity
check_internet() {
    if ! ping -c 1 packages.openvpn.net &> /dev/null; then
        echo -e "${RED}ERROR: No internet connection detected${NC}"
        echo -e "${YELLOW}Please connect to the internet and try again${NC}"
        exit 1
    fi
}

# Check internet connection
echo -e "${YELLOW}[1/6] Checking internet connection...${NC}"
check_internet
echo -e "${GREEN}✓ Internet connection verified${NC}"
echo ""

# Check if config file exists
echo -e "${YELLOW}[2/6] Checking for VPN configuration file...${NC}"
if [ ! -f "$OVPN_CONFIG_PATH" ]; then
    echo -e "${RED}ERROR: Configuration file not found!${NC}"
    echo -e "${RED}Expected location: $OVPN_CONFIG_PATH${NC}"
    echo ""
    echo -e "${YELLOW}Please:${NC}"
    echo -e "${YELLOW}  1. Download 'ubuntu_new.ovpn' from the OSDG website${NC}"
    echo -e "${YELLOW}  2. Save it to your Downloads folder${NC}"
    echo -e "${YELLOW}  3. Run this script again${NC}"
    exit 2
fi
echo -e "${GREEN}✓ Configuration file found${NC}"
echo ""

# Determine package manager
if command -v dnf &> /dev/null; then
    PKG_MANAGER="dnf"
elif command -v yum &> /dev/null; then
    PKG_MANAGER="yum"
else
    echo -e "${RED}ERROR: Neither dnf nor yum found${NC}"
    exit 1
fi

# Install required dependencies
echo -e "${YELLOW}[3/6] Installing dependencies...${NC}"
sudo $PKG_MANAGER install -y -q curl ca-certificates gnupg 2>&1 > /dev/null
echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

# Check if OpenVPN 3 is installed
echo -e "${YELLOW}[4/6] Checking OpenVPN 3 installation...${NC}"
if command -v openvpn3 &> /dev/null; then
    echo -e "${GREEN}✓ OpenVPN 3 is already installed${NC}"
else
    echo -e "${YELLOW}OpenVPN 3 not found. Installing...${NC}"
    echo ""
    
    # Install EPEL for RHEL/CentOS/AlmaLinux/Rocky
    if [[ "$DISTRO_ID" =~ ^(rhel|centos|almalinux|rocky)$ ]]; then
        echo -e "${CYAN}  Installing EPEL repository...${NC}"
        
        if [ "$VERSION_ID_MAJOR" == "8" ]; then
            sudo $PKG_MANAGER install -y https://dl.fedoraproject.org/pub/epel/epel-release-latest-8.noarch.rpm 2>&1 > /dev/null
            # Enable PowerTools/CodeReady Builder
            sudo $PKG_MANAGER config-manager --set-enabled powertools 2>/dev/null || \
            sudo $PKG_MANAGER config-manager --set-enabled crb 2>/dev/null || true
        elif [ "$VERSION_ID_MAJOR" == "9" ]; then
            sudo $PKG_MANAGER install -y https://dl.fedoraproject.org/pub/epel/epel-release-latest-9.noarch.rpm 2>&1 > /dev/null
            sudo $PKG_MANAGER config-manager --set-enabled crb 2>/dev/null || true
        fi
        
        echo -e "${CYAN}  Installing OpenVPN repository...${NC}"
        sudo $PKG_MANAGER install -y https://packages.openvpn.net/packages-repo-1-1.noarch.rpm 2>&1 > /dev/null || true
    fi
    
    # For Fedora, use Copr repository
    if [[ "$DISTRO_ID" == "fedora" ]]; then
        echo -e "${CYAN}  Enabling Copr repository for OpenVPN 3...${NC}"
        sudo $PKG_MANAGER install -y 'dnf-command(copr)' 2>&1 > /dev/null || true
        sudo $PKG_MANAGER copr enable -y dsommers/openvpn3 2>&1 > /dev/null || true
    fi
    
    echo -e "${CYAN}  Installing OpenVPN 3 client...${NC}"
    echo -ne "${CYAN}  [####################] Installing packages...${NC}\r"
    sudo $PKG_MANAGER install -y openvpn3-client 2>&1 > /dev/null
    echo -e "${CYAN}  [####################] Installing packages...${NC}"
    
    # Verify installation
    if ! command -v openvpn3 &> /dev/null; then
        echo -e "${RED}ERROR: OpenVPN 3 installation failed${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}  ✓ Installation complete${NC}"
fi
echo ""

# Import VPN configuration
echo -e "${YELLOW}[5/6] Importing VPN configuration...${NC}"

# Check if profile already exists
if openvpn3 configs-list 2>/dev/null | grep -q "$VPN_PROFILE_NAME"; then
    echo -e "${CYAN}  Existing profile found. Removing...${NC}"
    # Force remove without prompts - use config path instead of name
    CONFIG_PATH=$(openvpn3 configs-list 2>/dev/null | grep -A2 "$VPN_PROFILE_NAME" | grep "Configuration path" | awk '{print $NF}')
    if [ -n "$CONFIG_PATH" ]; then
        openvpn3 config-remove --path "$CONFIG_PATH" --force 2>/dev/null || true
    fi
fi

# Import new profile
openvpn3 config-import --config "$OVPN_CONFIG_PATH" --name "$VPN_PROFILE_NAME" --persistent > /dev/null 2>&1
echo -e "${GREEN}✓ Configuration imported${NC}"
echo ""

# Start VPN session (with proper stdin handling)
echo -e "${YELLOW}[6/6] Starting VPN connection...${NC}"
echo -e "${CYAN}You will be prompted for your IIIT Hyderabad credentials:${NC}"
echo -e "${CYAN}  Username: ${BOLD}your-email@students.iiit.ac.in${NC}"
echo -e "${CYAN}  Password: ${BOLD}your IIIT-H password${NC}"
echo ""

# Redirect stdin from terminal to allow password input
if [ -t 0 ]; then
    # Running in terminal - stdin available
    openvpn3 session-start --config "$VPN_PROFILE_NAME"
else
    # Piped through curl - reopen stdin from terminal
    openvpn3 session-start --config "$VPN_PROFILE_NAME" < /dev/tty
fi

echo ""
echo -e "${GREEN}==========================================${NC}"
echo -e "${GREEN}  ✓ VPN CONNECTED!${NC}"
echo -e "${GREEN}==========================================${NC}"
echo ""
echo -e "${CYAN}USEFUL COMMANDS:${NC}"
echo -e "  Check status:    ${YELLOW}openvpn3 sessions-list${NC}"
echo -e "  Disconnect:      ${YELLOW}openvpn3 session-manage --config $VPN_PROFILE_NAME --disconnect${NC}"
echo -e "  Reconnect:       ${YELLOW}openvpn3 session-start --config $VPN_PROFILE_NAME${NC}"
echo -e "  View logs:       ${YELLOW}openvpn3 log --config $VPN_PROFILE_NAME${NC}"
echo ""
echo -e "${CYAN}Need help? Visit the OSDG website or use WISPR AI!${NC}"
echo ""
