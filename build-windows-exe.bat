@echo off
echo ===================================================
echo   Mobile ERP - Single Executable Builder (Windows)
echo ===================================================

echo.
echo [1/3] Building Next.js Frontend...
cd mobile-erp-frontend
call npm install
call npm run build
if %errorlevel% neq 0 (
    echo Frontend build failed!
    exit /b %errorlevel%
)
cd ..

echo.
echo [2/3] Copying Frontend Static Files to .NET API...
rmdir /s /q "MobileERP\MobileERP.API\wwwroot" 2>nul
mkdir "MobileERP\MobileERP.API\wwwroot"
xcopy /E /I /Y "mobile-erp-frontend\out\*" "MobileERP\MobileERP.API\wwwroot\"

echo.
echo [3/3] Compiling .NET Backend into Single Executable...
cd MobileERP
call dotnet publish MobileERP.API/MobileERP.API.csproj -c Release -r win-x64 --self-contained true -p:PublishSingleFile=true -p:IncludeNativeLibrariesForSelfExtract=true -o ../dist
if %errorlevel% neq 0 (
    echo Backend compilation failed!
    exit /b %errorlevel%
)
cd ..

echo.
echo ===================================================
echo   SUCCESS! 
echo   Your self-contained app is ready in the "dist" folder.
echo   File: dist\MobileERP.API.exe
echo ===================================================
pause
