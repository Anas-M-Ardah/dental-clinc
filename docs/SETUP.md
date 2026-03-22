# Setup Guide

## Prerequisites

### Required Software
| Software | Version | Purpose |
|----------|---------|---------|
| .NET SDK | 8.0+ | Backend runtime |
| Node.js | 18+ | Frontend runtime |
| SQL Server | 2019+ | Database |
| Visual Studio Code | Latest | Code editor |
| Git | Latest | Version control |

### Verify Installations
```bash
dotnet --version
node --version
npm --version
sqlcmd -?
```

---

## Database Setup

### 1. SQL Server Connection
Update `appsettings.json` in `DentalClinic.Api`:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=DentalClinic;Trusted_Connection=true;TrustServerCertificate=true"
  }
}
```

Or use SQL Server Authentication:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=DentalClinic;User Id=sa;Password=YourPassword;TrustServerCertificate=true"
  }
}
```

### 2. Create Database
```bash
cd DentalClinic/src/DentalClinic.Api
dotnet ef database update
```

Or manually:
```bash
dotnet ef migrations add InitialCreate
dotnet ef database update
```

---

## Backend Setup

### 1. Restore Dependencies
```bash
cd DentalClinic
dotnet restore
```

### 2. Build Solution
```bash
dotnet build
```

### 3. Run Backend
```bash
cd src/DentalClinic.Api
dotnet run
```

Backend runs at: `https://localhost:7000`
API Swagger: `https://localhost:7000/swagger`

---

## Frontend Setup

### 1. Install Dependencies
```bash
cd dental-clinic-frontend
npm install
```

### 2. Run Frontend
```bash
npm start
```

Frontend runs at: `http://localhost:4200`

### 3. Build for Production
```bash
npm run build
```

Output: `dist/dental-clinic-frontend/browser`

---

## Development Workflow

### Create New Migration
```bash
cd src/DentalClinic.Api
dotnet ef migrations add MigrationName
dotnet ef database update
```

### Add New Entity
1. Create entity in `Domain/Entities/`
2. Add enum if needed in `Domain/Enums/`
3. Create interface in `Domain/Interfaces/`
4. Implement repository in `Infrastructure/Repositories/`
5. Create DTO in `Application/DTOs/`
6. Create service in `Application/Services/`
7. Create controller in `Api/Controllers/`
8. Add migration

### Add New Feature (Angular)
1. Create model in `core/models/`
2. Create service in `core/services/`
3. Create component in `features/`
4. Add route in `app.routes.ts`

---

## Environment Variables

### Backend (appsettings.Development.json)
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=DentalClinic;Trusted_Connection=true;TrustServerCertificate=true"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information"
    }
  }
}
```

### Frontend (environment.ts)
```typescript
export const environment = {
  production: false,
  apiUrl: 'https://localhost:7000/api'
};
```

---

## Troubleshooting

### SQL Server Connection Issues
- Ensure SQL Server is running
- Check connection string
- Enable TCP/IP in SQL Server Configuration Manager

### Port Already in Use
```bash
# Find process using port
netstat -ano | findstr :7000
taskkill /PID <process_id> /F
```

### Angular Build Errors
```bash
# Clear cache
npm cache clean --force
rm -rf node_modules
npm install
```

### EF Core Issues
```bash
# Remove pending migrations
dotnet ef migrations remove
dotnet ef database drop
dotnet ef migrations add InitialCreate
dotnet ef database update
```

---

## Quick Commands Reference

| Command | Description |
|---------|-------------|
| `dotnet restore` | Restore NuGet packages |
| `dotnet build` | Build solution |
| `dotnet run` | Run API |
| `dotnet ef migrations add` | Add migration |
| `dotnet ef database update` | Apply migrations |
| `npm install` | Install npm packages |
| `npm start` | Run Angular dev server |
| `npm run build` | Build Angular for production |
