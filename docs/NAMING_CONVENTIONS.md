# Naming Conventions

## General Principles

1. **Consistency**: Use consistent naming across backend and frontend
2. **Clarity**: Names should be descriptive and self-explanatory
3. **Brevity**: Keep names as short as reasonable
4. **Standards**: Follow language-specific conventions

---

## C# (.NET) Conventions

### Files
| Type | Convention | Example |
|------|------------|---------|
| Class | PascalCase | `PatientService.cs` |
| Interface | PascalCase with I prefix | `IPatientRepository.cs` |
| Enum | PascalCase | `AppointmentStatus.cs` |
| Entity | PascalCase | `Patient.cs` |

### Classes & Types
| Type | Convention | Example |
|------|------------|---------|
| Class | PascalCase | `PatientService` |
| Interface | PascalCase + I | `IPatientService` |
| Abstract | PascalCase + Base | `BaseEntity` |
| Enum | PascalCase | `Gender` |
| Enum Value | PascalCase | `AppointmentStatus.Pending` |

### Properties & Methods
| Type | Convention | Example |
|------|------------|---------|
| Public Property | PascalCase | `FirstName` |
| Private Field | _camelCase | `_patientRepository` |
| Method | PascalCase | `GetPatientById` |
| Parameter | camelCase | `patientId` |
| Constant | PascalCase | `DefaultPageSize` |

### Namespaces
```csharp
namespace DentalClinic.Domain.Entities
namespace DentalClinic.Application.DTOs
namespace DentalClinic.Infrastructure.Repositories
```

---

## TypeScript / Angular Conventions

### Files
| Type | Convention | Example |
|------|------------|---------|
| Component | kebab-case | `patient-list.component.ts` |
| Service | kebab-case | `patient.service.ts` |
| Model/Interface | PascalCase | `Patient.model.ts` |
| Pipe | kebab-case | `status-badge.pipe.ts` |

### Classes & Interfaces
| Type | Convention | Example |
|------|------------|---------|
| Class | PascalCase | `PatientListComponent` |
| Interface | PascalCase | `Patient` |
| Type | PascalCase | `AppointmentStatus` |
| Enum | PascalCase | `Gender` |

### Variables & Methods
| Type | Convention | Example |
|------|------------|---------|
| Variable | camelCase | `patientList` |
| Method | camelCase | `getPatients()` |
| Property | camelCase | `firstName` |
| Constant | PascalCase | `API_URL` |

### Angular Specific
| Type | Convention | Example |
|------|------------|---------|
| Component Selector | kebab-case | `app-patient-list` |
| Input/Output | camelCase | `@Input() patientId` |
| Route Path | kebab-case | `patients/:id` |

---

## Database Conventions

### Tables
| Type | Convention | Example |
|------|------------|---------|
| Table | PascalCase | `Patients` |
| Column | PascalCase | `First Primary Key | PascalName` |
|Case | `Id` |
| Foreign Key | PascalCase | `PatientId` |

---

## API Conventions

### Endpoints
| Type | Convention | Example |
|------|------------|---------|
| Resource | Plural, kebab-case | `/api/patients` |
| Action | kebab-case | `/appointments/{id}/cancel` |

### Request/Response
| Type | Convention | Example |
|------|------------|---------|
| DTO | PascalCase | `PatientDto` |
| Request Body | PascalCase | `CreatePatientRequest` |
| Response | PascalCase | `PatientResponse` |

---

## Git Conventions

### Branches
| Type | Convention | Example |
|------|------------|---------|
| Feature | feature/description | `feature/add-patient-search` |
| Bugfix | bugfix/description | `bugfix/fix-appointment-time` |
| Hotfix | hotfix/description | `hotfix/security-patch` |

### Commits
```
<type>(<scope>): <description>

Types: feat, fix, docs, style, refactor, test, chore
```

Examples:
```
feat(patient): add search functionality
fix(appointment): resolve time zone issue
docs(api): update endpoint documentation
```

---

## Code Organization

### File Order (C#)
```csharp
// 1. Using statements
using System;

// 2. Namespace
namespace DentalClinic.Application.Services;

// 3. Class declaration
public class PatientService
{
    // 4. Private fields
    private readonly IPatientRepository _repository;
    
    // 5. Constructor
    public PatientService(IPatientRepository repository)
    {
        _repository = repository;
    }
    
    // 6. Public methods
    // 7. Private methods
}
```

### File Order (Angular)
```typescript
// 1. Imports
import { Component } from '@angular/core';

// 2. Component decorator
@Component({ ... })

// 3. Class declaration
export class PatientListComponent {
  // 4. Properties
  // 5. Constructor
  // 6. Methods
}
```

---

## Abbreviations

### Use Full Words
| Avoid | Use |
|-----|-----|
| `btn` | `button` |
| `lbl` | `label` |
| `txt` | `text` |
| `msg` | `message` |
| `num` | `number` |

### Common Abbreviations (OK)
| Abbreviation | Full |
|--------------|------|
| `id` | identifier |
| `config` | configuration |
| `init` | initialize |
| `temp` | temporary |
| `utils` | utilities |

---

## Example: Complete Naming Chain

**Backend Entity:**
```csharp
// DentalClinic.Domain/Entities/Patient.cs
public class Patient
{
    public int Id { get; set; }
    public string FirstName { get; set; }
    public DateTime DateOfBirth { get; set; }
}
```

**Backend Repository:**
```csharp
// DentalClinic.Domain/Interfaces/IPatientRepository.cs
public interface IPatientRepository
{
    Task<Patient?> GetByIdAsync(int id);
    Task<IEnumerable<Patient>> GetAllAsync();
}
```

**Backend DTO:**
```csharp
// DentalClinic.Application/DTOs/PatientDto.cs
public class PatientDto
{
    public int Id { get; set; }
    public string FirstName { get; set; }
}
```

**Backend Service:**
```csharp
// DentalClinic.Application/Services/PatientService.cs
public class PatientService : IPatientService
{
    private readonly IPatientRepository _repository;
    
    public async Task<PatientDto> GetPatientByIdAsync(int id) { ... }
}
```

**Frontend Model:**
```typescript
// dental-clinic-frontend/src/app/core/models/patient.model.ts
export interface Patient {
  id: number;
  firstName: string;
}
```

**Frontend Service:**
```typescript
// dental-clinic-frontend/src/app/core/services/patient.service.ts
@Injectable({ providedIn: 'root' })
export class PatientService {
  getPatientById(id: number): Observable<Patient> { ... }
}
```

**Frontend Component:**
```typescript
// dental-clinic-frontend/src/app/features/patients/patient-list/patient-list.component.ts
@Component({
  selector: 'app-patient-list',
  templateUrl: './patient-list.component.html'
})
export class PatientListComponent { }
```
