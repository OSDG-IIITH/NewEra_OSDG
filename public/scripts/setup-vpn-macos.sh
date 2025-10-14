#!/bin/bash

# IIIT Hyderabad VPN Setup Script for macOS (Tunnelblick)
# Compatible with: macOS 10.15+ (Catalina and later), Intel & Apple Silicon
# Author: OSDG Club, IIIT Hyderabad
# Last Updated: October 2025

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
OVPN_CONFIG_PATH="$HOME/Downloads/generic.ovpn"
TUNNELBLICK_APP="/Applications/Tunnelblick.app"
TUNNELBLICK_CONFIGS="$HOME/Library/Application Support/Tunnelblick/Configurations"
CONFIG_NAME="IIITH-VPN"

echo -e "${CYAN}=========================================${NC}"
echo -e "${CYAN}  IIIT Hyderabad VPN Setup - macOS${NC}"
echo -e "${CYAN}=========================================${NC}"
echo ""

# Function to check internet connectivity
check_internet() {
    if ! ping -c 1 google.com &> /dev/null; then
        echo -e "${RED}ERROR: No internet connection detected${NC}"
        echo -e "${YELLOW}Please connect to the internet and try again${NC}"
        exit 1
    fi
}

# Check internet connection
echo -e "${YELLOW}[1/5] Checking internet connection...${NC}"
check_internet
echo -e "${GREEN}✓ Internet connection verified${NC}"
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
echo -e "${GREEN}✓ Configuration file found${NC}"
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
    echo -e "${CYAN}  Installing Tunnelblick via Homebrew...${NC}"
    brew install --cask tunnelblick
}

# Install via direct download
install_via_download() {
    TUNNELBLICK_DMG_URL="https://tunnelblick.net/release/Latest_Tunnelblick_Stable.dmg"
    TEMP_DMG="$HOME/Downloads/tunnelblick-temp.dmg"
    
    echo -e "${CYAN}  Downloading Tunnelblick...${NC}"
    curl -L -o "$TEMP_DMG" "$TUNNELBLICK_DMG_URL"
    
    echo -e "${CYAN}  Mounting installer...${NC}"
    MOUNT_POINT=$(hdiutil attach "$TEMP_DMG" -nobrowse 2>/dev/null | grep Volumes | sed 's/.*\/Volumes/\/Volumes/' | head -1 | xargs)
    
    echo -e "${CYAN}  Installing Tunnelblick...${NC}"
    # Find the .app in the mounted volume
    APP_PATH=$(find "$MOUNT_POINT" -maxdepth 2 -name "Tunnelblick.app" | head -1)
    
    if [ -n "$APP_PATH" ]; then
        cp -R "$APP_PATH" /Applications/
    else
        echo -e "${RED}ERROR: Could not find Tunnelblick.app in DMG${NC}"
        hdiutil detach "$MOUNT_POINT" -quiet 2>/dev/null
        exit 1
    fi
    
    echo -e "${CYAN}  Cleaning up...${NC}"
    hdiutil detach "$MOUNT_POINT" -quiet 2>/dev/null
    rm "$TEMP_DMG"
}

# Check if Tunnelblick is installed
echo -e "${YELLOW}[3/5] Checking Tunnelblick installation...${NC}"
if [ -d "$TUNNELBLICK_APP" ]; then
    echo -e "${GREEN}✓ Tunnelblick is already installed${NC}"
else
    echo -e "${YELLOW}Tunnelblick not found. Installing...${NC}"
    echo ""
    
    if check_homebrew; then
        # Homebrew exists, use it
        install_via_homebrew
    else
        # Ask user preference
        echo -e "${CYAN}Homebrew not found. Choose installation method:${NC}"
        echo -e "${NC}  1) Install Homebrew first, then install Tunnelblick (recommended)${NC}"
        echo -e "${NC}  2) Direct download from Tunnelblick.net (no Homebrew needed)${NC}"
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
    if [ ! -d "$TUNNELBLICK_APP" ]; then
        echo -e "${RED}ERROR: Tunnelblick installation failed${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}  ✓ Tunnelblick installed successfully${NC}"
fi
echo ""

# Launch Tunnelblick for first-time setup if needed
echo -e "${YELLOW}[4/5] Configuring Tunnelblick...${NC}"
if [ ! -d "$HOME/Library/Application Support/Tunnelblick" ]; then
    echo -e "${CYAN}Launching Tunnelblick for first-time setup...${NC}"
    echo -e "${CYAN}Please allow any system extensions if prompted.${NC}"
    echo ""
    open -a Tunnelblick
    
    echo -e "${YELLOW}Waiting for Tunnelblick to complete initial setup...${NC}"
    echo -e "${YELLOW}Press ENTER after Tunnelblick appears in menu bar...${NC}"
    read -r
    
    # Give it time to create directories
    sleep 3
else
    echo -e "${GREEN}✓ Tunnelblick already configured${NC}"
fi
echo ""

# Import VPN configuration
echo -e "${YELLOW}[5/5] Importing VPN configuration...${NC}"

# Create config directory structure
mkdir -p "$TUNNELBLICK_CONFIGS/${CONFIG_NAME}.tblk"

# Copy the ovpn file
cp "$OVPN_CONFIG_PATH" "$TUNNELBLICK_CONFIGS/${CONFIG_NAME}.tblk/${CONFIG_NAME}.ovpn"

# Set proper permissions
chmod 600 "$TUNNELBLICK_CONFIGS/${CONFIG_NAME}.tblk/${CONFIG_NAME}.ovpn"
chmod 700 "$TUNNELBLICK_CONFIGS/${CONFIG_NAME}.tblk"

echo -e "${GREEN}✓ VPN configuration imported successfully${NC}"
echo ""

# Tell Tunnelblick to reload configurations
osascript -e 'tell application "Tunnelblick" to quit' 2>/dev/null || killall Tunnelblick 2>/dev/null || true
sleep 2
open -a Tunnelblick

echo ""
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}  ✓ VPN SETUP COMPLETE!${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""
echo -e "${CYAN}NEXT STEPS:${NC}"
echo -e "${NC}  1. Tunnelblick will open automatically${NC}"
echo -e "${NC}  2. Click the Tunnelblick icon in your menu bar${NC}"
echo -e "${NC}  3. Select 'Connect ${CONFIG_NAME}'${NC}"
echo -e "${NC}  4. Enter your IIIT Hyderabad credentials:${NC}"
echo -e "${YELLOW}     Username: your-iiith-email@students.iiit.ac.in${NC}"
echo -e "${YELLOW}     Password: your IIIT-H password${NC}"
echo ""
echo -e "${CYAN}USEFUL COMMANDS:${NC}"
echo -e "${NC}  Open Tunnelblick:       ${YELLOW}open -a Tunnelblick${NC}"
echo -e "${NC}  Config location:        ${YELLOW}~/Library/Application Support/Tunnelblick/Configurations/${NC}"
echo -e "${NC}  View logs:              ${YELLOW}Check Tunnelblick menu > VPN Details > Log${NC}"
echo ""
echo -e "${CYAN}Need help? Visit the OSDG website or use our AI chatbot!${NC}"
echo ""

# Wait a moment before finishing
sleep 2
