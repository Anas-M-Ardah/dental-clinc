# Naming Conventions

## General Principles

1. **Consistency**: Use consistent naming across backend and frontend
2. **Clarity**: Names should be descriptive and self-explanatory
3. **Brevity**: Keep names as short as reasonable
4. **Standards**: Follow language-specific conventions

---

## C# (.NET 9) Conventions

### Files
| Type | Convention | Example |
|------|------------|---------|
| Class | PascalCase | `PatientService.cs` |
| Interface | PascalCase with I prefix | `IPatientRepository.cs` |
| Enum | PascalCase | `AppointmentStatus.cs` |
| Entity | PascalCase | `TreatmentRecord.cs` |

### Classes & Types
| Type | Convention | Example |
|------|------------|---------|
| Class | PascalCase | `TreatmentRecordService` |
| Interface | PascalCase + I | `ITreatmentRecordService` |
| Enum | PascalCase | `Gender` |
| Enum Value | PascalCase | `AppointmentStatus.Pending` |

### Properties & Methods
| Type | Convention | Example |
|------|------------|---------|
| Public Property | PascalCase | `FirstName` |
| Private Field | _camelCase | `_patientRepository` |
| Method | PascalCase + Async | `GetPatientByIdAsync` |
| Parameter | camelCase | `patientId` |

### Namespaces
```csharp
namespace DentalClinic.Domain.Entities
namespace DentalClinic.Application.DTOs
namespace DentalClinic.Application.Services
namespace DentalClinic.Infrastructure.Repositories
namespace DentalClinic.Api.Controllers
namespace DentalClinic.Api.Middleware
```

---

## TypeScript / Angular 19 Conventions

### Files
| Type | Convention | Example |
|------|------------|---------|
| Component | kebab-case | `treatment-records.component.ts` |
| Service | kebab-case | `api.service.ts` |
| Model | kebab-case | `treatment-record.model.ts` |
| Pipe | kebab-case | `translate.pipe.ts` |

### Classes & Interfaces
| Type | Convention | Example |
|------|------------|---------|
| Component | PascalCase | `TreatmentRecordsComponent` |
| Service | PascalCase | `ApiService` |
| Interface | PascalCase | `TreatmentRecord` |
| DTO Interface | PascalCase + Dto | `CreateTreatmentRecordDto` |

### Variables & Methods
| Type | Convention | Example |
|------|------------|---------|
| Variable | camelCase | `painLevel` |
| Method | camelCase | `loadPatients()` |
| Property | camelCase | `selectedInvoice` |
| Subject | camelCase + $ | `destroy$`, `searchSubject` |

### Angular Specific
| Type | Convention | Example |
|------|------------|---------|
| Component Selector | kebab-case | `app-treatment-records` |
| Route Path | kebab-case | `treatment-records` |
| Translation Key | dot-separated | `treatmentRecords.title` |

---

## Database Conventions

### Tables
| Type | Convention | Example |
|------|------------|---------|
| Table Name | PascalCase Plural | `TreatmentRecords` |
| Column Name | PascalCase | `ChiefComplaint` |
| Primary Key | `Id` | `Id` |
| Foreign Key | PascalCase + Id | `PatientId` |

---

## API Conventions

### Endpoints
| Type | Convention | Example |
|------|------------|---------|
| Resource | Plural, kebab-case | `/api/treatment-records` |
| Sub-resource | Nested path | `/api/treatment-records/patient/{patientId}` |
| Action | kebab-case verb | `/api/invoices/{id}/pay` |

### Request/Response
| Type | Convention | Example |
|------|------------|---------|
| Read DTO | PascalCase + Dto | `TreatmentRecordDto` |
| Create DTO | Create + PascalCase + Dto | `CreateTreatmentRecordDto` |
| Update DTO | Update + PascalCase + Dto | `UpdateTreatmentRecordDto` |

---

## Translation Key Conventions

Keys follow a hierarchical dot-separated pattern:
```
<feature>.<label>

Examples:
common.save
common.cancel
patients.title
patients.addPatient
appointments.selectDoctor
treatmentRecords.chiefComplaint
billing.markAsPaid
nav.dashboard
```

---

## Git Conventions

### Branches
| Type | Convention | Example |
|------|------------|---------|
| Feature | `<name>/description` | `hassan.k/general-updates` |
| Feature | `feature/description` | `feature/add-treatment-records` |
| Bugfix | `bugfix/description` | `bugfix/fix-appointment-time` |

### Commits
```
<type>(<scope>): <description>

Types: feat, fix, docs, style, refactor, test, chore
```

Examples:
```
feat(treatment-records): add professional dental form
fix(appointments): resolve time slot overlap
docs(api): update endpoint documentation
```

---

## Code Organization (Angular Standalone Components)

```typescript
// 1. Imports
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

// 2. Component decorator with inline template & styles
@Component({
  selector: 'app-feature-name',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  template: `...`,
  styles: [`...`]
})

// 3. Class
export class FeatureNameComponent implements OnInit, OnDestroy {
  // 4. Public properties
  items: Item[] = [];
  loading = false;

  // 5. Private properties
  private destroy$ = new Subject<void>();

  // 6. Constructor (DI)
  constructor(private api: ApiService) {}

  // 7. Lifecycle hooks
  ngOnInit() { ... }
  ngOnDestroy() { ... }

  // 8. Public methods
  // 9. Private methods
}
```
