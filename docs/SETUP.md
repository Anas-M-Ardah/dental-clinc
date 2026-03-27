# Setup Guide

## Prerequisites

### Required Software
| Software | Version | Purpose |
|----------|---------|---------|
| .NET SDK | 9.0+ | Backend runtime |
| Node.js | 18+ | Frontend runtime |
| SQL Server | 2019+ | Database |
| Git | Latest | Version control |

### Verify Installations
```bash
dotnet --version    # Should be 9.x
node --version      # Should be 18+
npm --version
```

---

## Database Setup

### 1. SQL Server Connection
Update `appsettings.json` in `src/DentalClinic.Api`:
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

### 2. Database Auto-Creation
The database is automatically created on first run via `EnsureCreated()`. No manual migration needed for initial setup.

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

Backend runs at: `http://localhost:7000`
API Swagger: `http://localhost:7000/swagger`

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

## Running Both Together

1. Start the backend first (port 7000)
2. Start the frontend (port 4200)
3. The Angular app calls `http://localhost:7000/api` for all API requests
4. CORS is configured to allow `http://localhost:4200`

---

## Development Workflow

### Add New Entity (Backend)
1. Create entity in `Domain/Entities/`
2. Add enum if needed in `Domain/Enums/`
3. Create repository interface in `Domain/Interfaces/`
4. Implement repository in `Infrastructure/Repositories/`
5. Add `DbSet<>` to `DentalClinicDbContext`
6. Create DTOs in `Application/DTOs/`
7. Create service interface in `Application/Interfaces/`
8. Implement service in `Application/Services/`
9. Create controller in `Api/Controllers/`
10. Register DI in `Program.cs`

### Add New Feature (Frontend)
1. Create model in `core/models/`
2. Add API methods to `core/services/api.service.ts`
3. Add translation keys to `core/services/translation.service.ts` (EN + AR)
4. Create component in `features/` (standalone, inline template)
5. Add route in `app.routes.ts`
6. Add nav link in `layouts/main-layout/main-layout.component.ts`

---

## Key Configuration

### Backend (`src/DentalClinic.Api/Program.cs`)
- Uses minimal hosting model (top-level statements)
- Swagger enabled in Development only
- CORS allows `http://localhost:4200`
- All services/repos registered as Scoped
- Global exception handling middleware

### Frontend (`dental-clinic-frontend/`)
- Angular 19 with standalone components
- Bootstrap 5.3 for base styling
- Custom CSS design system (Inter font, Indigo primary)
- Bilingual EN/AR via TranslationService

---

## Troubleshooting

### SQL Server Connection Issues
- Ensure SQL Server is running
- Check connection string in `appsettings.json`
- Enable TCP/IP in SQL Server Configuration Manager

### Port Already in Use
```bash
# Find process using port
netstat -ano | findstr :7000
taskkill /PID <process_id> /F
```

### Angular Build Errors
```bash
npm cache clean --force
rm -rf node_modules
npm install
```

### EF Core Issues
```bash
dotnet ef database drop
dotnet ef migrations add InitialCreate
dotnet ef database update
```

---

## Quick Commands Reference

| Command | Description |
|---------|-------------|
| `dotnet restore` | Restore NuGet packages |
| `dotnet build` | Build .NET solution |
| `dotnet run` | Run API server |
| `dotnet ef migrations add` | Add EF migration |
| `dotnet ef database update` | Apply migrations |
| `npm install` | Install npm packages |
| `npm start` | Run Angular dev server |
| `npm run build` | Build Angular for production |
| `npx ng build` | Angular build (alternative) |
