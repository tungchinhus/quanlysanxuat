# KCS Check Component - API Integration Update

## Overview

This component has been updated to integrate with the new KCS API endpoints for managing "Bối dây hạ chờ duyệt" (Low voltage winding pending approval) according to the API specification.

## New Features

### 1. API Integration
- **Base URL**: Updated to `https://localhost:7001` (from API spec)
- **New Endpoints**:
  - `GET /api/kcs-check/boi-day-ha-pending` - Get all pending low voltage windings
  - `POST /api/kcs-check/boi-day-ha-pending-search` - Search with pagination

### 2. Dialog Components
- **Approve Dialog**: Shows approval confirmation with quality score and inspector details
- **Reject Dialog**: Form-based rejection with detailed reasons, technical details, and recommendations
- **Data Persistence**: Rejection data is saved to `tbl_kcs_approve` table

### 2. Data Structure
- **New Interfaces**: Added comprehensive interfaces matching API response
- **Backward Compatibility**: Maintained legacy interfaces for existing functionality
- **Data Mapping**: Automatic conversion from API format to display format

### 3. Enhanced Search & Pagination
- **Real-time Search**: Search by drawing name and winding symbol/TBKT
- **Server-side Pagination**: Proper pagination with page size options
- **Search Criteria**: Structured search with optional parameters

### 4. User Experience Improvements
- **Loading States**: Visual feedback during API calls
- **Error Handling**: Comprehensive error handling with user notifications
- **Empty States**: Informative messages when no data is available
- **Pagination Info**: Clear display of current page and total results

## API Response Structure

### BoiDayHaPendingResponse
```typescript
{
  isSuccess: boolean;
  message: string;
  data: BoiDayHaPendingItem[];
  totalCount: number;
  currentUserId: string;
  isKcsUser: boolean;
  userRoles: string[];
}
```

### SearchCriteria
```typescript
{
  searchByDrawingName?: string;
  searchByWindingSymbolOrTBKT?: string;
  pageNumber: number;
  pageSize: number;
}
```

## Component Methods

### Data Loading
- `loadBoiDayHaData()` - Loads pending low voltage windings
- `searchBoiDayHaData()` - Searches with criteria and pagination
- `loadBoiDayCaoData()` - Loads high voltage windings (legacy)
- `loadEpBoiDayData()` - Loads pressed windings (legacy)

### Search & Filtering
- `onSearchBangVeChange()` - Drawing name search
- `onSearchChange()` - Winding symbol/TBKT search
- `filterBoiDayHaData()` - Triggers API search
- `filterBoiDayCaoData()` - Client-side filtering
- `filterEpBoiDayData()` - Client-side filtering

### Actions
- `approveKcs()` - Approves KCS inspection
- `rejectKcs()` - Rejects KCS inspection
- `viewBangVeDetails()` - Views drawing details

### Pagination
- `onPageChange()` - Handles page navigation
- `resetSearch()` - Resets search and pagination

## Status Mapping

### API Status to Display Status
- `1` (đang xử lý) → `pending` (Chờ kiểm tra)
- `2` (hoàn thành, chờ duyệt) → `pending` (Chờ kiểm tra)
- `3` (từ chối) → `rejected` (Từ chối)

## Error Handling

### Network Errors
- Automatic fallback to mock data
- User-friendly error messages
- Console logging for debugging

### API Errors
- Response validation
- Success/failure status checking
- Detailed error messages from API

## Mock Data

### Fallback Strategy
- Used when API is unavailable
- Maintains same data structure
- Provides realistic test data

### Mock Data Structure
- Follows API response format
- Includes all required fields
- Realistic Vietnamese company names and data

## CSS Classes

### New Components
- `.loading-container` - Loading spinner and message
- `.no-data-container` - Empty state display
- `.pagination-container` - Enhanced pagination styling
- `.pagination-info` - Page information display

## Dependencies

### Material Design
- `MatProgressSpinnerModule` - Loading indicators
- `MatPaginatorModule` - Pagination controls
- `MatTableModule` - Data tables
- `MatSnackBarModule` - User notifications

### Angular
- `HttpClientModule` - API communication
- `FormsModule` - Search input handling
- `CommonModule` - Common directives

## Usage Examples

### Basic Data Loading
```typescript
// Load all pending items
this.loadBoiDayHaData();

// Search with criteria
const criteria: SearchCriteria = {
  searchByDrawingName: 'BV001',
  pageNumber: 1,
  pageSize: 10
};
this.searchBoiDayHaData();
```

### Action Handling
```typescript
// Approve KCS
this.approveKcs(element);

// Reject KCS
this.rejectKcs(element);

// View details
this.viewBangVeDetails(element);
```

## Configuration

### Environment
- **Development**: `https://localhost:7001`
- **Production**: Configure in environment files

### Pagination
- **Default Page Size**: 10
- **Page Size Options**: [5, 10, 25, 50]
- **Max Results**: Configurable via API

### Search
- **Real-time**: Triggers on input change
- **Debouncing**: Built-in Angular change detection
- **Reset**: Automatic on tab change

## Testing

### Unit Tests
- Component initialization
- Service method calls
- Data transformation
- Error handling

### Integration Tests
- API endpoint connectivity
- Data flow validation
- User interaction testing

## Future Enhancements

### Planned Features
- Advanced filtering options
- Export functionality
- Bulk operations
- Real-time updates

### API Extensions
- Additional winding types
- Enhanced search capabilities
- Performance optimizations
- Caching strategies

## Troubleshooting

### Common Issues
1. **API Connection**: Check base URL and network
2. **Authentication**: Verify JWT token validity
3. **Data Mapping**: Check console for mapping errors
4. **Pagination**: Verify page size and current page values

### Debug Information
- Console logging for all API calls
- Response data validation
- Error message details
- Network request tracking

## Performance Considerations

### Optimization Strategies
- Lazy loading of tab content
- Efficient data transformation
- Minimal re-renders
- Optimized search queries

### Memory Management
- Proper subscription cleanup
- Efficient data structures
- Minimal object creation
- Garbage collection optimization
