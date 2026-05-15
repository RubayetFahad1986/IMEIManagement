# Use the official .NET SDK image to build the app
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy projects and restore dependencies
COPY ["MobileERP.API/MobileERP.API.csproj", "MobileERP.API/"]
COPY ["MobileERP.Application/MobileERP.Application.csproj", "MobileERP.Application/"]
COPY ["MobileERP.Domain/MobileERP.Domain.csproj", "MobileERP.Domain/"]
COPY ["MobileERP.Infrastructure/MobileERP.Infrastructure.csproj", "MobileERP.Infrastructure/"]
COPY ["MobileERP.Shared/MobileERP.Shared.csproj", "MobileERP.Shared/"]

RUN dotnet restore "MobileERP.API/MobileERP.API.csproj"

# Copy the rest of the source code
COPY . .
WORKDIR "/src/MobileERP.API"
RUN dotnet build "MobileERP.API.csproj" -c Release -o /app/build

# Publish the application
RUN dotnet publish "MobileERP.API.csproj" -c Release -o /app/publish

# Use the runtime image for production
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "MobileERP.API.dll"]
