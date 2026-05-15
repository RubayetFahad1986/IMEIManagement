#!/bin/bash
echo "==================================================="
echo "  Mobile ERP - Single Executable Builder (Mac/Linux)"
echo "==================================================="

echo ""
echo "[1/3] Building Next.js Frontend..."
cd mobile-erp-frontend
npm install
npm run build
if [ $? -ne 0 ]; then
    echo "Frontend build failed!"
    exit 1
fi
cd ..

echo ""
echo "[2/3] Copying Frontend Static Files to .NET API..."
rm -rf MobileERP/MobileERP.API/wwwroot
mkdir -p MobileERP/MobileERP.API/wwwroot
cp -R mobile-erp-frontend/out/* MobileERP/MobileERP.API/wwwroot/

echo ""
echo "[3/3] Compiling .NET Backend into Single Executable..."
cd MobileERP
# For macOS, use osx-x64 or osx-arm64
dotnet publish MobileERP.API/MobileERP.API.csproj -c Release -r osx-arm64 --self-contained true -p:PublishSingleFile=true -p:IncludeNativeLibrariesForSelfExtract=true -o ../dist
if [ $? -ne 0 ]; then
    echo "Backend compilation failed!"
    exit 1
fi
cd ..

echo ""
echo "==================================================="
echo "  SUCCESS! "
echo "  Your self-contained app is ready in the 'dist' folder."
echo "  File: dist/MobileERP.API"
echo "==================================================="
