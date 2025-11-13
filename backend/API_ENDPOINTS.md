# Fuel EU Maritime Compliance API Endpoints

## Overview

All 6 missing API endpoints have been implemented, along with supporting infrastructure (repositories, use cases, domain models).

## Implemented Endpoints

### 1. **GET /routes/comparison**
Compares all routes against the baseline route.

**Query Parameters:**
- `target` (optional): Target GHG intensity in gCO₂e/MJ (default: 89.3368)

**Response:**
```json
{
  "baseline": {
    "routeId": "R001",
    "vesselType": "Container",
    "fuelType": "HFO",
    "year": 2024,
    "ghgIntensity": 91.0,
    ...
  },
  "comparisons": [
    {
      "routeId": "R002",
      "vesselType": "BulkCarrier",
      "fuelType": "LNG",
      "year": 2024,
      "ghgIntensity": 88.0,
      "percentDifference": -3.3,
      "compliant": true
    }
  ]
}
```

**Status Codes:**
- `200`: Success
- `404`: Baseline not found
- `500`: Server error

---

### 2. **GET /compliance/cb**
Gets Carbon Balance for a specific ship/year.

**Query Parameters:**
- `year` (required): Year
- `shipId` (required): Ship/Route ID

**Response:**
```json
{
  "cbBefore": 1000000,
  "applied": 200000,
  "cbAfter": 800000
}
```

**Status Codes:**
- `200`: Success
- `400`: Missing or invalid parameters
- `500`: Server error

---

### 3. **POST /banking/bank**
Banks positive CB (surplus).

**Request Body:**
```json
{
  "shipId": "R001",
  "year": 2024,
  "amount": 100000
}
```

**Response:**
```json
{
  "message": "CB banked successfully",
  "bankEntry": {
    "id": 1,
    "shipId": "R001",
    "year": 2024,
    "amountGco2eq": 100000,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Status Codes:**
- `200`: Success
- `400`: Invalid request or cannot bank (CB not positive)
- `500`: Server error

**Validation:**
- Amount must be positive
- CB must be positive (surplus) to bank
- Amount cannot exceed available CB

---

### 4. **POST /banking/apply**
Applies banked surplus to reduce deficit.

**Request Body:**
```json
{
  "shipId": "R002",
  "year": 2024,
  "amount": 50000
}
```

**Response:**
```json
{
  "message": "Banked CB applied successfully"
}
```

**Status Codes:**
- `200`: Success
- `400`: Invalid request, no banked CB available, or ship doesn't have deficit
- `500`: Server error

**Validation:**
- Amount must be positive
- Ship must have banked CB available
- Ship must have a deficit to apply to

---

### 5. **GET /compliance/adjusted-cb**
Gets adjusted CB for all ships in a year (CB after banking).

**Query Parameters:**
- `year` (required): Year

**Response:**
```json
[
  {
    "shipId": "R001",
    "adjustedCB": 1000000
  },
  {
    "shipId": "R002",
    "adjustedCB": -500000
  }
]
```

**Status Codes:**
- `200`: Success
- `400`: Missing or invalid year parameter
- `500`: Server error

---

### 6. **POST /pools**
Creates a pool with validation.

**Request Body:**
```json
{
  "year": 2024,
  "memberShipIds": ["R001", "R002", "R003"]
}
```

**Response:**
```json
{
  "message": "Pool created successfully",
  "pool": {
    "id": 1,
    "year": 2024,
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "members": [
    {
      "id": 1,
      "poolId": 1,
      "shipId": "R001",
      "cbBefore": 1000000,
      "cbAfter": 500000
    }
  ]
}
```

**Status Codes:**
- `200`: Success
- `400`: Invalid request or pool validation failed
- `500`: Server error

**Validation Rules:**
- Pool must have at least one member
- Sum of adjusted CB must be >= 0
- Deficit ships cannot exit worse
- Surplus ships cannot exit negative

---

## Bonus Endpoint

### **POST /compliance/calculate**
Calculates and saves CB for all routes in a given year.

**Query Parameters:**
- `year` (required): Year
- `target` (optional): Target GHG intensity (default: 89.3368)

**Response:**
```json
{
  "message": "CB calculated for 5 routes",
  "compliances": [
    {
      "id": 1,
      "shipId": "R001",
      "year": 2024,
      "cbGco2eq": -349183200
    }
  ]
}
```

**Status Codes:**
- `200`: Success
- `400`: Missing or invalid parameters
- `500`: Server error

---

## Architecture

### Domain Layer (`src/core/domain/`)
- `Compliance.ts`: Domain models (Compliance, BankEntry, Pool, PoolMember, RouteComparison, CarbonBalance, AdjustedCB)
- `CBCalculator.ts`: Domain service for CB calculations
- `Route.ts`: Route domain model

### Application Layer (`src/core/application/`)
- `CompareRoutesUseCase.ts`: Compares routes against baseline
- `ComplianceUseCase.ts`: Calculates and manages compliance
- `BankingUseCase.ts`: Handles banking operations
- `PoolingUseCase.ts`: Manages pool creation with validation

### Infrastructure Layer (`src/adapters/outbound/postgres/`)
- `complianceRepo.ts`: Compliance repository
- `bankingRepo.ts`: Banking repository
- `poolingRepo.ts`: Pooling repository
- `routesRepo.ts`: Routes repository (existing)

### API Layer (`src/adapters/inbound/http/`)
- `comparisonController.ts`: Comparison endpoint
- `complianceController.ts`: Compliance endpoints
- `bankingController.ts`: Banking endpoints
- `poolingController.ts`: Pooling endpoint
- `routesController.ts`: Routes endpoints (existing)

---

## Database Schema

All tables are defined in `migrations/002_compliance_banking_pooling.sql`:

- `ship_compliance`: Stores CB calculations per ship/year
- `bank_entries`: Stores banked CB amounts
- `pools`: Stores pool records
- `pool_members`: Stores pool members with before/after CB values

---

## Usage Flow

1. **Calculate Compliance**: `POST /compliance/calculate?year=2024`
   - Calculates CB for all routes in the year

2. **View Comparisons**: `GET /routes/comparison?target=89.3368`
   - Compares routes against baseline

3. **Bank Surplus**: `POST /banking/bank`
   - Banks positive CB for later use

4. **Apply Banked CB**: `POST /banking/apply`
   - Applies banked CB to reduce deficit

5. **View Adjusted CB**: `GET /compliance/adjusted-cb?year=2024`
   - Gets CB after banking adjustments

6. **Create Pool**: `POST /pools`
   - Creates a pool with validation

---

## Testing

All endpoints are ready for integration testing. The existing test structure can be extended to cover these new endpoints.

---

## Notes

- All endpoints follow the existing error handling pattern
- TypeScript strict mode is enabled
- All repositories use transactions for data consistency
- Pool validation ensures Fuel EU Article 21 compliance rules

