# Build stage
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy csproj files and restore
COPY src/DentalClinic.Domain/DentalClinic.Domain.csproj src/DentalClinic.Domain/
COPY src/DentalClinic.Application/DentalClinic.Application.csproj src/DentalClinic.Application/
COPY src/DentalClinic.Infrastructure/DentalClinic.Infrastructure.csproj src/DentalClinic.Infrastructure/
COPY src/DentalClinic.Api/DentalClinic.Api.csproj src/DentalClinic.Api/
RUN dotnet restore src/DentalClinic.Api/DentalClinic.Api.csproj

# Copy everything and build
COPY src/ src/
RUN dotnet publish src/DentalClinic.Api/DentalClinic.Api.csproj -c Release -o /app/publish --no-restore

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app

# Create uploads directory
RUN mkdir -p /app/uploads/documents /app/logs

COPY --from=build /app/publish .

EXPOSE 7000
ENV ASPNETCORE_URLS=http://+:7000
ENV ASPNETCORE_ENVIRONMENT=Production

ENTRYPOINT ["dotnet", "DentalClinic.Api.dll"]
