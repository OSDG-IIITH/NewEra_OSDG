#!/bin/bash

# IIIT Hyderabad VPN Setup Script for macOS
# Compatible with: macOS 10.15+ (Catalina and later), Intel & Apple Silicon
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
OVPN_CONFIG_PATH="$HOME/Downloads/macos.ovpn"
OPENVPN_APP="/Applications/OpenVPN Connect.app"
OPENVPN_CLI="$OPENVPN_APP/Contents/MacOS/OpenVPN Connect"
OPENVPN_DMG_URL="https://openvpn.net/downloads/openvpn-connect-v3-macos.dmg"
TEMP_DMG="$HOME/Downloads/openvpn-connect-temp.dmg"

echo -e "${CYAN}==========================================${NC}"
echo -e "${CYAN}  IIIT Hyderabad VPN Setup - macOS${NC}"
echo -e "${CYAN}==========================================${NC}"
echo ""

# Function to check internet connectivity
check_internet() {
    if ! ping -c 1 openvpn.net &> /dev/null; then
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
    echo -e "${YELLOW}  1. Download 'macos.ovpn' from the OSDG website${NC}"
    echo -e "${YELLOW}  2. Save it to your Downloads folder${NC}"
    echo -e "${YELLOW}  3. Run this script again${NC}"
    exit 2
fi
echo -e "${GREEN}[OK] Configuration file found${NC}"
echo ""

# Check if Homebrew is installed
check_homebrew() {
    if command -v brew &> /dev/null; then
        return 0
    else
        return 1
    fi
}

# Install Homebrew
install_homebrew() {
    echo -e "${CYAN}  Installing Homebrew...${NC}"
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    
    # Configure PATH for Apple Silicon
    if [[ $(uname -m) == 'arm64' ]]; then
        echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
        eval "$(/opt/homebrew/bin/brew shellenv)"
    fi
}

# Install via Homebrew
install_via_homebrew() {
    echo -e "${CYAN}  Installing via Homebrew...${NC}"
    brew install --cask openvpn-connect 2>&1 > /dev/null
}

# Install via direct download
install_via_download() {
    echo -e "${CYAN}  Downloading installer...${NC}"
    # Download with progress bar
    curl -L --progress-bar -o "$TEMP_DMG" "$OPENVPN_DMG_URL" 2>&1 | while IFS= read -r line; do
        if [[ $line =~ ([0-9]+\.[0-9]+)% ]]; then
            percent="${BASH_REMATCH[1]%%.*}"
            # Create progress bar [####------]
            bar_length=20
            filled_length=$((percent * bar_length / 100))
            bar=$(printf '%*s' "$filled_length" | tr ' ' '#')
            bar=$(printf '%-*s' "$bar_length" "$bar" | tr ' ' '-')
            echo -ne "\r  [$bar] ${percent}%"
        fi
    done
    echo ""
    
    echo -e "${CYAN}  Installing...${NC}"
    MOUNT_POINT=$(hdiutil attach "$TEMP_DMG" -nobrowse 2>/dev/null | grep Volumes | awk '{print $3}')
    
    cp -R "$MOUNT_POINT/OpenVPN Connect.app" /Applications/ 2>/dev/null
    
    hdiutil detach "$MOUNT_POINT" -quiet 2>/dev/null
    rm "$TEMP_DMG"
}

# Check if OpenVPN Connect is installed
echo -e "${YELLOW}[3/5] Checking OpenVPN Connect installation...${NC}"
if [ -d "$OPENVPN_APP" ]; then
    echo -e "${GREEN}[OK] OpenVPN Connect is already installed${NC}"
else
    echo -e "${YELLOW}OpenVPN Connect not found. Installing...${NC}"
    echo ""
    
    if check_homebrew; then
        # Homebrew exists, use it
        install_via_homebrew
    else
        # Ask user preference
        echo -e "${CYAN}Choose installation method:${NC}"
        echo -e "  1) Install Homebrew + OpenVPN (recommended)"
        echo -e "  2) Direct download (no Homebrew needed)"
        echo ""
        read -p "Enter choice (1 or 2): " choice
        
        case $choice in
            1)
                install_homebrew
                install_via_homebrew
                ;;
            2)
                install_via_download
                ;;
            *)
                echo -e "${YELLOW}Invalid choice. Using direct download...${NC}"
                install_via_download
                ;;
        esac
    fi
    
    # Verify installation
    if [ ! -d "$OPENVPN_APP" ]; then
        echo -e "${RED}ERROR: OpenVPN Connect installation failed${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}  [OK] Installation complete${NC}"
fi
echo ""

# Verify CLI executable
if [ ! -f "$OPENVPN_CLI" ]; then
    echo -e "${RED}ERROR: OpenVPN Connect CLI not found${NC}"
    echo -e "${YELLOW}Please install manually from: https://openvpn.net/client-connect-vpn-for-mac-os/${NC}"
    exit 1
fi

# Check if this is the first time launching OpenVPN Connect
FIRST_LAUNCH=false
if [ ! -d "$HOME/Library/Application Support/OpenVPN Connect" ]; then
    FIRST_LAUNCH=true
fi

# Accept GDPR consent
echo -e "${YELLOW}[4/5] Configuring OpenVPN Connect...${NC}"

if [ "$FIRST_LAUNCH" = true ]; then
    echo -e "${CYAN}OpenVPN Connect will now open for the first time.${NC}"
    echo -e "${CYAN}Please click the 'Agree' button to accept the terms.${NC}"
    echo -e "${YELLOW}Press ENTER after you've clicked Agree...${NC}"
    
    open -a "OpenVPN Connect" 2>/dev/null
    read -r
    
    # Close OpenVPN Connect
    sleep 2
    osascript -e 'quit app "OpenVPN Connect"' 2>/dev/null || killall "OpenVPN Connect" 2>/dev/null
    sleep 1
    
    echo -e "${GREEN}[OK] GDPR terms accepted${NC}"
else
    "$OPENVPN_CLI" --accept-gdpr 2>&1 > /dev/null || echo -e "${YELLOW}[SKIP] GDPR already accepted${NC}"
    echo -e "${GREEN}[OK] Configuration accepted${NC}"
fi
echo ""

# Import VPN profile using CLI
echo -e "${YELLOW}[5/5] Importing VPN configuration...${NC}"
"$OPENVPN_CLI" --import-profile="$OVPN_CONFIG_PATH" 2>&1 > /dev/null
sleep 2
echo -e "${GREEN}[OK] VPN profile imported${NC}"
echo ""

# Configure auto-connect
echo -e "${CYAN}Configuring auto-connect...${NC}"
"$OPENVPN_CLI" --set-setting=launch-options --value=connect-latest 2>&1 > /dev/null || true

echo ""
echo -e "${GREEN}==========================================${NC}"
echo -e "${GREEN}  SETUP COMPLETE!${NC}"
echo -e "${GREEN}==========================================${NC}"
echo ""
echo -e "${CYAN}NEXT STEPS:${NC}"
echo -e "  1. OpenVPN Connect will open automatically"
echo -e "  2. Click on the IIITH-VPN profile to connect"
echo -e "  3. Enter your IIIT Hyderabad credentials:"
echo -e "     Username: ${YELLOW}your-email@students.iiit.ac.in${NC}"
echo -e "     Password: ${YELLOW}your IIIT-H password${NC}"
echo ""
echo -e "${CYAN}Need help? Visit the OSDG website or use WISPR AI!${NC}"
echo ""

# Open OpenVPN Connect GUI
open -a "OpenVPN Connect" 2>/dev/null || echo -e "${YELLOW}Please open OpenVPN Connect from Applications${NC}"
