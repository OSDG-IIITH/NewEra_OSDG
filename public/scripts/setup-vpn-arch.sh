#!/bin/bash

# IIIT Hyderabad VPN Setup Script for Arch Linux
# Compatible with: Arch Linux, Manjaro, EndeavourOS
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
CONFIG_NAME="iiith-vpn"

echo -e "${CYAN}==========================================${NC}"
echo -e "${CYAN}  IIIT Hyderabad VPN Setup - Arch Linux${NC}"
echo -e "${CYAN}==========================================${NC}"
echo ""

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
    echo -e "${RED}ERROR: Please do NOT run this script as root${NC}"
    echo -e "${YELLOW}Run without 'sudo' - you'll be prompted for password when needed${NC}"
    exit 1
fi

# Function to check internet connectivity
check_internet() {
    if ! ping -c 1 archlinux.org &> /dev/null; then
        echo -e "${RED}ERROR: No internet connection detected${NC}"
        echo -e "${YELLOW}Please connect to the internet and try again${NC}"
        exit 1
    fi
}

# Check internet connection
echo -e "${YELLOW}[1/5] Checking internet connection...${NC}"
check_internet
echo -e "${GREEN}[OK] Internet connection verified${NC}"
echo ""

# Check if config file exists
echo -e "${YELLOW}[2/5] Checking for VPN configuration file...${NC}"
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

# Check if OpenVPN is installed
echo -e "${YELLOW}[3/5] Checking OpenVPN installation...${NC}"
if command -v openvpn &> /dev/null; then
    echo -e "${GREEN}[OK] OpenVPN is already installed${NC}"
else
    echo -e "${YELLOW}OpenVPN not found. Installing...${NC}"
    echo ""
    
    echo -e "${CYAN}  Updating package database...${NC}"
    sudo pacman -Sy 2>&1 > /dev/null
    
    echo -e "${CYAN}  Downloading and installing OpenVPN...${NC}"
    echo -ne "${CYAN}  [--------------------] Installing packages...${NC}\r"
    sudo pacman -S --noconfirm openvpn openresolv 2>&1 | while read line; do
        echo -ne "${CYAN}  [####################] Installing packages...${NC}\r"
    done
    echo -e "${CYAN}  [####################] Installing packages...${NC}"
    
    # Verify installation
    if ! command -v openvpn &> /dev/null; then
        echo -e "${RED}ERROR: OpenVPN installation failed${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}  [OK] Installation complete${NC}"
fi
echo ""

# Copy configuration to system directory
echo -e "${YELLOW}[4/5] Installing VPN configuration...${NC}"
sudo mkdir -p /etc/openvpn/client
sudo cp "$OVPN_CONFIG_PATH" "/etc/openvpn/client/${CONFIG_NAME}.conf"
sudo chmod 600 "/etc/openvpn/client/${CONFIG_NAME}.conf"
echo -e "${GREEN}[OK] Configuration installed${NC}"
echo ""

# Start VPN connection
echo -e "${YELLOW}[5/5] Starting VPN connection...${NC}"
echo -e "${CYAN}You will be prompted for your IIIT Hyderabad credentials${NC}"
echo ""

# Start OpenVPN with systemd
sudo systemctl start openvpn-client@${CONFIG_NAME}

# Wait a bit for connection
sleep 3

# Check status
if sudo systemctl is-active --quiet openvpn-client@${CONFIG_NAME}; then
    echo ""
    echo -e "${GREEN}==========================================${NC}"
    echo -e "${GREEN}  VPN CONNECTED!${NC}"
    echo -e "${GREEN}==========================================${NC}"
    echo ""
    echo -e "${CYAN}USEFUL COMMANDS:${NC}"
    echo -e "  Check status:  ${YELLOW}sudo systemctl status openvpn-client@${CONFIG_NAME}${NC}"
    echo -e "  Stop VPN:      ${YELLOW}sudo systemctl stop openvpn-client@${CONFIG_NAME}${NC}"
    echo -e "  Start VPN:     ${YELLOW}sudo systemctl start openvpn-client@${CONFIG_NAME}${NC}"
    echo -e "  Enable boot:   ${YELLOW}sudo systemctl enable openvpn-client@${CONFIG_NAME}${NC}"
    echo ""
    echo -e "${CYAN}Need help? Visit the OSDG website or use WISPR AI!${NC}"
    echo ""
else
    echo -e "${RED}ERROR: VPN connection failed${NC}"
    echo -e "${YELLOW}Check logs: sudo journalctl -u openvpn-client@${CONFIG_NAME}${NC}"
    exit 1
fi
