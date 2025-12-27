# Pharmacies API Integration Guide

## Overview
This document describes the API endpoints expected by the Pharmacies component in the Kulobal Health Admin application.

## Base URL
```
https://kulobalhealth-backend-1.onrender.com/api/v1/admin
```

## Authentication
All endpoints require authentication via HTTP-only cookies and JWT token. The token is automatically sent with each request via the `apiClient` interceptor.

---

## Endpoints

### 1. Get All Pharmacies
**Endpoint:** `GET /pharmacies`

**Description:** Retrieve a list of all registered pharmacies.

**Query Parameters (Optional):**
- `page` (number): Page number for pagination
- `limit` (number): Number of items per page
- `search` (string): Search query for pharmacy name, licence number, etc.
- `location` (string): Filter by location
- `status` (string): Filter by subscription status (Active, Expired, Pending)

**Response Structure:**
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "name": "string",
      "location": "string",
      "branches": number,
      "licenceNumber": "string",
      "address": "string",
      "pharmacistName": "string",
      "pharmacistLicenceNumber": "string",
      "email": "string",
      "phone": "string",
      "subscriptionPlan": "string",
      "subscriptionStatus": "string",
      "subscriptionExpiry": "string",
      "createdAt": "string",
      "updatedAt": "string"
    }
  ],
  "pagination": {
    "total": number,
    "page": number,
    "limit": number,
    "pages": number
  }
}
```

**Alternative Response Structures Supported:**
- `{ pharmacies: [...] }`
- `[...]` (array directly)

---

### 2. Get Pharmacy by ID
**Endpoint:** `GET /pharmacies/{id}`

**Description:** Retrieve detailed information about a specific pharmacy.

**Path Parameters:**
- `id` (string, required): Pharmacy ID

**Response Structure:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "name": "string",
    "location": "string",
    "branches": number,
    "licenceNumber": "string",
    "address": "string",
    "pharmacistName": "string",
    "pharmacistLicenceNumber": "string",
    "email": "string",
    "phone": "string",
    "subscriptionPlan": "string",
    "subscriptionStatus": "string",
    "subscriptionExpiry": "string",
    "transactions": [],
    "createdAt": "string",
    "updatedAt": "string"
  }
}
```

**Alternative Response Structures Supported:**
- `{ pharmacy: {...} }`
- `{...}` (object directly)

---

### 3. Create New Pharmacy
**Endpoint:** `POST /pharmacies`

**Description:** Register a new pharmacy in the system.

**Request Body:**
```json
{
  "name": "string (required)",
  "location": "string (required)",
  "licenceNumber": "string (required)",
  "address": "string (required)",
  "pharmacistName": "string (required)",
  "pharmacistLicenceNumber": "string (required)",
  "email": "string (required)",
  "phone": "string (required)",
  "branches": number,
  "subscriptionPlan": "string",
  "subscriptionStatus": "string",
  "subscriptionExpiry": "string"
}
```

**Response Structure:**
```json
{
  "success": true,
  "message": "Pharmacy created successfully",
  "data": {
    "id": "string",
    "name": "string",
    // ... full pharmacy object
  }
}
```

---

### 4. Update Pharmacy
**Endpoint:** `PATCH /pharmacies/{id}`

**Description:** Update pharmacy information.

**Path Parameters:**
- `id` (string, required): Pharmacy ID

**Request Body (all fields optional):**
```json
{
  "name": "string",
  "location": "string",
  "licenceNumber": "string",
  "address": "string",
  "pharmacistName": "string",
  "pharmacistLicenceNumber": "string",
  "email": "string",
  "phone": "string",
  "branches": number,
  "subscriptionPlan": "string",
  "subscriptionStatus": "string",
  "subscriptionExpiry": "string"
}
```

**Response Structure:**
```json
{
  "success": true,
  "message": "Pharmacy updated successfully",
  "data": {
    "id": "string",
    // ... updated pharmacy object
  }
}
```

---

### 5. Delete Pharmacy
**Endpoint:** `DELETE /pharmacies/{id}`

**Description:** Delete a pharmacy from the system.

**Path Parameters:**
- `id` (string, required): Pharmacy ID

**Response Structure:**
```json
{
  "success": true,
  "message": "Pharmacy deleted successfully"
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "Pharmacy not found. It may have already been deleted."
}
```

---

### 6. Update Pharmacy Subscription
**Endpoint:** `PATCH /pharmacies/{id}/subscription`

**Description:** Update pharmacy subscription details.

**Path Parameters:**
- `id` (string, required): Pharmacy ID

**Request Body:**
```json
{
  "subscriptionPlan": "string (required)",
  "subscriptionStatus": "string (required)",
  "subscriptionExpiry": "string (required)"
}
```

**Response Structure:**
```json
{
  "success": true,
  "message": "Subscription updated successfully",
  "data": {
    "id": "string",
    "subscriptionPlan": "string",
    "subscriptionStatus": "string",
    "subscriptionExpiry": "string"
  }
}
```

---

### 7. Get Pharmacy Branches
**Endpoint:** `GET /pharmacies/{id}/branches`

**Description:** Retrieve all branches for a specific pharmacy.

**Path Parameters:**
- `id` (string, required): Pharmacy ID

**Response Structure:**
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "name": "string",
      "address": "string",
      "phone": "string",
      "managerName": "string",
      "isActive": boolean
    }
  ]
}
```

---

### 8. Search Pharmacies
**Endpoint:** `GET /pharmacies/search`

**Description:** Search for pharmacies by name, licence number, or other criteria.

**Query Parameters:**
- `q` (string, required): Search query
- `location` (string, optional): Filter by location
- `status` (string, optional): Filter by subscription status

**Response Structure:**
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "name": "string",
      // ... full pharmacy objects
    }
  ]
}
```

---

## Error Handling

### Common HTTP Status Codes
- `200` - Success
- `201` - Created (for POST requests)
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (pharmacy doesn't exist)
- `500` - Internal Server Error

### Error Response Structure
```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "fieldName",
      "message": "Field-specific error message"
    }
  ]
}
```

---

## Frontend Integration

### Service File Location
`src/utils/pharmaciesService.js`

### Component Files Using Service
- `src/pages/Pharmacies.js` - Main pharmacies list page
- `src/pages/PharmacyDetail.js` - Individual pharmacy details page

### Key Features Implemented
1. ✅ Fetch all pharmacies with error handling
2. ✅ Search and filter pharmacies by location
3. ✅ View pharmacy details
4. ✅ Delete pharmacy with confirmation modal
5. ✅ Pagination support
6. ✅ Loading states with preloader
7. ✅ Error messages displayed to user
8. ✅ Authentication handling (401 errors)
9. ✅ Detailed console logging for debugging

### ID Field Normalization
The frontend automatically normalizes different ID field names:
- `id`
- `_id` (MongoDB)
- `pharmacyId`
- `ID`

This ensures compatibility with different backend implementations.

---

## Testing Checklist

### Backend Developer Tasks
- [ ] Implement `GET /pharmacies` endpoint
- [ ] Implement `GET /pharmacies/{id}` endpoint
- [ ] Implement `POST /pharmacies` endpoint
- [ ] Implement `PATCH /pharmacies/{id}` endpoint
- [ ] Implement `DELETE /pharmacies/{id}` endpoint
- [ ] Implement `PATCH /pharmacies/{id}/subscription` endpoint
- [ ] Implement `GET /pharmacies/{id}/branches` endpoint
- [ ] Implement `GET /pharmacies/search` endpoint
- [ ] Configure CORS to allow credentials
- [ ] Test authentication with HTTP-only cookies

### Frontend Testing
- [ ] Test fetching pharmacies list
- [ ] Test search functionality
- [ ] Test location filter
- [ ] Test pagination
- [ ] Test viewing pharmacy details
- [ ] Test delete pharmacy with confirmation
- [ ] Test error handling for 404
- [ ] Test error handling for 401
- [ ] Verify loading states display correctly
- [ ] Verify success/error messages display correctly

---

## Notes
- All timestamps should be in ISO 8601 format
- Phone numbers should include country code
- Email addresses must be valid format
- Subscription status values: "Active", "Expired", "Pending"
- The frontend handles both nested (`response.data.data`) and flat (`response.data`) response structures
