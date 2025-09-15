# Use the official .NET 8 runtime as base image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80

# Use the official .NET 8 SDK for building
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["student-automation-backend.csproj", "."]
RUN dotnet restore "./student-automation-backend.csproj"
COPY . .
WORKDIR "/src/."
RUN dotnet build "student-automation-backend.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "student-automation-backend.csproj" -c Release -o /app/publish

# Final stage
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "student-automation-backend.dll"]