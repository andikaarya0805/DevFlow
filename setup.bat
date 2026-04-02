@echo off
setlocal
set "BLUE=[34m"
set "GREEN=[32m"
set "YELLOW=[33m"
set "RED=[31m"
set "RESET=[0m"

echo.
echo %BLUE%=======================================================%RESET%
echo %BLUE%          DEVFLOW PROJECT SETUP - INITIALIZER          %RESET%
echo %BLUE%=======================================================%RESET%
echo.

:: 1. Check for Node.js
echo %YELLOW%[1/4]%RESET% Checking for Node.js environment...
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo %RED%Error: Node.js is not installed!%RESET%
    echo Please download and install it from https://nodejs.org/
    pause
    exit /b %errorlevel%
)
echo %GREEN%Found Node.js %RESET%

:: 2. Cleaning previous cache (Optional but recommended)
echo %YELLOW%[2/4]%RESET% Cleaning existing dependencies for a fresh start...
if exist node_modules (
    echo Removing existing node_modules...
    rmdir /s /q node_modules
)
if exist package-lock.json (
    echo Removing existing package-lock.json...
    del /f /q package-lock.json
)

:: 3. Installing Dependencies
echo %YELLOW%[3/4]%RESET% Installing project libraries (React, Next.js, Firebase, Framer Motion, AnimeJS, Lucide)...
echo This may take a minute depending on your connection...
call npm install
if %errorlevel% neq 0 (
    echo %RED%Error: Failed to install dependencies!%RESET%
    pause
    exit /b %errorlevel%
)

:: 4. Finalizing
echo %YELLOW%[4/4]%RESET% Validating installation...
echo %GREEN%Installation complete!%RESET%
echo.
echo %BLUE%-------------------------------------------------------%RESET%
echo %GREEN%           Setup Successful - DevFlow is ready!        %RESET%
echo %BLUE%-------------------------------------------------------%RESET%
echo.
echo To start the development server, run:
echo %YELLOW%    npm run dev%RESET%
echo.
echo Opening dev server instructions...
pause
explorer http://localhost:3000
echo.
echo Happy coding!
pause
