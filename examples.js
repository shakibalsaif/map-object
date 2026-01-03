/**
 * mapObejct - Comprehensive Usage Examples
 *
 * This file demonstrates all features and patterns of the mapObejct library
 * through practical, real-world examples.
 *
 * FIELD SYNTAX OVERVIEW:
 * =====================
 *
 * Basic Patterns:
 * - "field"                    → Extract field as-is
 * - "field1,field2"            → Extract multiple fields (comma-separated)
 * - "source:target"            → Read from source, write to target (rename)
 * - "nested.path"              → Navigate nested objects
 * - "array.0"                  → Access array by index
 * - "array.-1"                 → Access last array element (negative index)
 * - "array.[property]"         → Map over array, extract property from each item
 * - "*"                        → Select entire object
 *
 * Advanced Patterns:
 * - "prefix."                  → Mapper: read all from prefix
 * - ":prefix."                 → Mapper: write all to prefix
 * - "read:write."              → Mapper: read from 'read', write to 'write'
 * - "field1::field2"           → Alternative multi-field syntax (clearer than comma)
 * - ":nested::a,b,c"           → Read from nested, extract a, b, c
 * - "[property.nested]"        → Deep property extraction from array items
 * - "[]"                       → Push to array (in writeValue context)
 *
 * Separator Usage:
 * - "," (comma)                → Separates multiple field selections
 * - "::" (double colon)        → Same as comma, but recommended for clarity
 * - ":" (single colon)         → Separates source from target (rename operation)
 * - "." (dot)                  → Navigates object hierarchy
 */

const mapObejct = require("./mapObejct");

// ============================================================================
// EXAMPLE 1: Basic Field Extraction
// ============================================================================
console.log("=".repeat(80));
console.log("EXAMPLE 1: Basic Field Extraction");
console.log("=".repeat(80));

const user1 = {
  id: "usr_001",
  username: "alice",
  email: "alice@example.com",
  password: "hashed_password_123",
  role: "admin",
  internalToken: "secret_token_xyz",
  createdAt: "2024-01-15",
};

// Extract only safe fields for API response
const safeUser = mapObejct(user1, "id", "username", "email", "role", "createdAt");

console.log("Input:", user1);
console.log("Output:", safeUser);
console.log("Note: password and internalToken excluded from response\n");

// ============================================================================
// EXAMPLE 2: Field Renaming with Colon Syntax
// ============================================================================
console.log("=".repeat(80));
console.log("EXAMPLE 2: Field Renaming");
console.log("=".repeat(80));

const product = {
  id: "prod_123",
  title: "Wireless Headphones",
  price: 99.99,
  stock_quantity: 150,
  internal_cost: 45.0,
};

// Rename fields for external API
const apiProduct = mapObejct(
  product,
  "id:productId", // id → productId
  "title:name", // title → name
  "price", // keep same name
  "stock_quantity:inStock" // stock_quantity → inStock
);

console.log("Input:", product);
console.log("Output:", apiProduct);
console.log("Note: internal_cost excluded, fields renamed\n");

// ============================================================================
// EXAMPLE 3: Nested Object Navigation
// ============================================================================
console.log("=".repeat(80));
console.log("EXAMPLE 3: Nested Object Navigation");
console.log("=".repeat(80));

const employee = {
  id: "emp_456",
  profile: {
    personal: {
      firstName: "Bob",
      lastName: "Smith",
      dateOfBirth: "1990-05-15",
    },
    contact: {
      email: "bob.smith@company.com",
      phone: "+1-555-0123",
    },
  },
  department: {
    name: "Engineering",
    location: "Building A",
  },
};

// Extract nested fields with dot notation
const employeeSummary = mapObejct(
  employee,
  "id",
  "profile.personal.firstName:firstName",
  "profile.personal.lastName:lastName",
  "profile.contact.email:email",
  "department.name:department"
);

console.log("Input:", JSON.stringify(employee, null, 2));
console.log("Output:", employeeSummary);
console.log("Note: Deep nested paths flattened to simple structure\n");

// ============================================================================
// EXAMPLE 4: Array Access with Indices
// ============================================================================
console.log("=".repeat(80));
console.log("EXAMPLE 4: Array Access with Indices");
console.log("=".repeat(80));

const userPhotos = {
  userId: "usr_789",
  photos: [
    { url: "photo1.jpg", uploadedAt: "2024-01-01" },
    { url: "photo2.jpg", uploadedAt: "2024-01-05" },
    { url: "photo3.jpg", uploadedAt: "2024-01-10" },
  ],
};

// Get first and last photo
const photoSelection = mapObejct(
  userPhotos,
  "userId",
  "photos.0.url:firstPhoto", // First element (index 0)
  "photos.-1.url:latestPhoto" // Last element (negative index)
);

console.log("Input:", JSON.stringify(userPhotos, null, 2));
console.log("Output:", photoSelection);
console.log("Note: Negative indices count from end of array\n");

// ============================================================================
// EXAMPLE 5: Array Mapping with [property] Syntax
// ============================================================================
console.log("=".repeat(80));
console.log("EXAMPLE 5: Array Mapping - Extract Property from All Items");
console.log("=".repeat(80));

const team = {
  teamName: "Development Team",
  members: [
    { id: 1, name: "Alice", role: "Lead" },
    { id: 2, name: "Bob", role: "Developer" },
    { id: 3, name: "Charlie", role: "Designer" },
  ],
};

// Extract all member names
const memberNames = mapObejct(
  team,
  "teamName",
  "members.[name]:memberNames" // Maps over array, extracts 'name' from each
);

console.log("Input:", JSON.stringify(team, null, 2));
console.log("Output:", JSON.stringify(memberNames, null, 2));
console.log("Note: [property] extracts that property from every array item\n");

// ============================================================================
// EXAMPLE 6: Comma-Separated Multi-Field Selection
// ============================================================================
console.log("=".repeat(80));
console.log("EXAMPLE 6: Multi-Field Selection with Comma");
console.log("=".repeat(80));

const registration = {
  firstName: "Diana",
  lastName: "Evans",
  email: "diana@example.com",
  phone: "555-0199",
  password: "secure_pass",
  passwordConfirm: "secure_pass",
  terms: true,
  newsletter: false,
};

// Select multiple fields at once using comma
const signupData = mapObejct(
  registration,
  "firstName,lastName,email", // 3 fields in one string
  "password,passwordConfirm", // 2 more fields
  "terms"
);

console.log("Input:", registration);
console.log("Output:", signupData);
console.log("Note: Comma separates multiple field selections\n");

// ============================================================================
// EXAMPLE 7: Double Colon (::) Multi-Field Syntax
// ============================================================================
console.log("=".repeat(80));
console.log("EXAMPLE 7: Multi-Field Selection with :: (Recommended)");
console.log("=".repeat(80));

const profile = {
  username: "eric_f",
  email: "eric@example.com",
  phone: "555-0177",
  bio: "Software engineer",
  website: "https://eric.dev",
};

// Using :: for clarity (same as comma, but more explicit)
const contactInfo = mapObejct(
  profile,
  "email::phone::website" // :: is clearer than comma
);

console.log("Input:", profile);
console.log("Output:", contactInfo);
console.log("Note: :: is recommended over comma for better readability\n");

// ============================================================================
// EXAMPLE 8: Mapper Syntax - Read from Prefix
// ============================================================================
console.log("=".repeat(80));
console.log("EXAMPLE 8: Mapper - Read All from Nested Object");
console.log("=".repeat(80));

const userProfile = {
  id: "usr_999",
  personalInfo: {
    name: "Frank Garcia",
    age: 35,
    gender: "M",
  },
  accountStatus: "active",
};

// "personalInfo." reads all from personalInfo
const extracted = mapObejct(
  userProfile,
  "id",
  "personalInfo.", // Mapper: read from personalInfo
  "name", // Will read personalInfo.name
  "age", // Will read personalInfo.age
  "accountStatus"
);

console.log("Input:", JSON.stringify(userProfile, null, 2));
console.log("Output:", extracted);
console.log('Note: "personalInfo." sets context for following fields\n');

// ============================================================================
// EXAMPLE 9: Mapper Syntax - Write to Prefix
// ============================================================================
console.log("=".repeat(80));
console.log("EXAMPLE 9: Mapper - Write All to Nested Path");
console.log("=".repeat(80));

const flatData = {
  userId: "usr_111",
  street: "123 Main St",
  city: "Springfield",
  state: "IL",
  zipcode: "62701",
};

// ":address." writes following fields to address object
const structuredData = mapObejct(
  flatData,
  "userId",
  ":address.", // Mapper: write to address
  "street", // Writes to address.street
  "city", // Writes to address.city
  "state", // Writes to address.state
  "zipcode" // Writes to address.zipcode
);

console.log("Input:", flatData);
console.log("Output:", JSON.stringify(structuredData, null, 2));
console.log('Note: ":prefix." nests following fields under prefix\n');

// ============================================================================
// EXAMPLE 10: Mapper with Read and Write Paths
// ============================================================================
console.log("=".repeat(80));
console.log("EXAMPLE 10: Mapper - Read from X, Write to Y");
console.log("=".repeat(80));

const documentData = {
  metadata: {
    author: "Helen Ito",
    createdDate: "2024-01-20",
    version: "1.0",
  },
};

// "metadata:docInfo." reads from metadata, writes to docInfo
const reformatted = mapObejct(
  documentData,
  "metadata:docInfo.", // Read from metadata, write to docInfo
  "author", // metadata.author → docInfo.author
  "createdDate:created", // metadata.createdDate → docInfo.created
  "version" // metadata.version → docInfo.version
);

console.log("Input:", JSON.stringify(documentData, null, 2));
console.log("Output:", JSON.stringify(reformatted, null, 2));
console.log('Note: "source:target." reads from source, writes to target\n');

// ============================================================================
// EXAMPLE 11: Nested Extraction with :: Syntax
// ============================================================================
console.log("=".repeat(80));
console.log("EXAMPLE 11: Extract Multiple Fields from Nested Object");
console.log("=".repeat(80));

const orderData = {
  orderId: "ord_555",
  customer: {
    name: "Isabel Johnson",
    email: "isabel@example.com",
    phone: "555-0144",
    address: "456 Oak Lane",
  },
  total: 299.99,
};

// ":customer::name,email" extracts multiple fields from customer
const orderSummary = mapObejct(
  orderData,
  "orderId",
  ":customer::name,email", // Extract name and email from customer
  "total"
);

console.log("Input:", JSON.stringify(orderData, null, 2));
console.log("Output:", JSON.stringify(orderSummary, null, 2));
console.log('Note: ":nested::field1,field2" extracts multiple fields\n');

// ============================================================================
// EXAMPLE 12: Wildcard (*) Usage
// ============================================================================
console.log("=".repeat(80));
console.log("EXAMPLE 12: Wildcard - Select Entire Object");
console.log("=".repeat(80));

const settings = {
  theme: "dark",
  language: "en",
  notifications: true,
  privacy: "public",
};

// "*" returns entire object
const allSettings = mapObejct(settings, "*");

console.log("Input:", settings);
console.log("Output:", allSettings);
console.log('Note: "*" selects everything\n');

// ============================================================================
// EXAMPLE 13: Complex Real-World - User Signup
// ============================================================================
console.log("=".repeat(80));
console.log("EXAMPLE 13: Real-World - User Signup Form Processing");
console.log("=".repeat(80));

const signupForm = {
  firstName: "Jack",
  lastName: "Kumar",
  email: "jack.kumar@example.com",
  phone: "555-0166",
  password: "secure123",
  passwordConfirm: "secure123",
  agreeToTerms: true,
  subscribeNewsletter: false,
  referralCode: "REF123",
  internalSessionId: "sess_xyz", // Should not be stored
  csrfToken: "token_abc", // Should not be stored
};

const signupUser = mapObejct(
  signupForm,
  "firstName,lastName",
  "email,phone",
  "password,passwordConfirm",
  "agreeToTerms:terms",
  "subscribeNewsletter:newsletter",
  "referralCode"
);

console.log("Input:", signupForm);
console.log("Output:", signupUser);
console.log("Note: Excluded internal fields, renamed some fields\n");

// ============================================================================
// EXAMPLE 14: Complex Real-World - User Profile Creation
// ============================================================================
console.log("=".repeat(80));
console.log("EXAMPLE 14: Real-World - Complete User Profile");
console.log("=".repeat(80));

const profileForm = {
  name: "Laura Martinez",
  email: "laura@example.com",
  phone: "555-0188",
  dob: "1992-08-22",
  gender: "F",
  father: "Miguel Martinez",
  mother: "Sofia Martinez",
  pincode: "90210",
  addressLine1: "789 Sunset Blvd",
  addressLine2: "Apt 12B",
  city: "Los Angeles",
  state: "CA",
  latitude: 34.0522,
  longitude: -118.2437,
  aadhaarNumber: "1234-5678-9012",
  aadhaarUrl: "https://cdn.example.com/aadhaar.pdf",
  panNumber: "ABCDE1234F",
  panUrl: "https://cdn.example.com/pan.pdf",
  photoUrl: "https://cdn.example.com/photo.jpg",
  centreName: "Downtown Center",
  centreAddress: "321 Main St",
  password: "newpass456",
  passwordConfirm: "newpass456",
};

const createUser = mapObejct(
  profileForm,
  "photoUrl:photo.url",
  "email,phone",
  "name,dob,gender,father,mother",
  "pincode",
  ":address::addressLine1:line1,addressLine2:line2,city,state",
  "latitude:address.geo.lat",
  "longitude:address.geo.lng",
  ":documents.aadhaar::aadhaarNumber:number,aadhaarUrl:url",
  ":documents.pan::panNumber:number,panUrl:url",
  "centreName,centreAddress",
  "password,passwordConfirm"
);

console.log("Input (keys only):", Object.keys(profileForm));
console.log("Output:", JSON.stringify(createUser, null, 2));
console.log("Note: Restructured flat form into nested document structure\n");

// ============================================================================
// EXAMPLE 15: Complex Real-World - API Response Formatting
// ============================================================================
console.log("=".repeat(80));
console.log("EXAMPLE 15: Real-World - Format User for API Response");
console.log("=".repeat(80));

const dbUser = {
  _id: "mongo_id_123",
  uid: "usr_777",
  userId: "USR777",
  email: "mike@example.com",
  phone: "555-0155",
  photos: [
    { url: "https://cdn.example.com/photo1.jpg", uploadedAt: "2024-01-01" },
    { url: "https://cdn.example.com/photo2.jpg", uploadedAt: "2024-01-15" },
  ],
  name: "Mike Nelson",
  gender: "M",
  address: {
    text: "456 Park Ave",
    geo: {
      location: { lat: 40.7589, lng: -73.9851 },
    },
  },
  centreName: "Midtown Center",
  centreAddress: "789 Center Plaza",
  lastUpdatedAt: "2024-01-15T10:30:00Z",
  lastLoggedinAt: "2024-01-20T08:15:00Z",
  createdAt: "2023-06-15T09:00:00Z",
  status: "active",
  updatedAt: "2024-01-15T10:30:00Z",
  ekycRequested: true,
  passwordHash: "hashed_password", // Exclude from API
  internalNotes: "VIP customer", // Exclude from API
};

const apiResponse = mapObejct(
  dbUser,
  "uid:id",
  "userId,email,phone",
  "photos.-1.url:photo", // Latest photo only
  "name,gender",
  "address.text:address",
  "address.geo.location:location",
  "centreName,centreAddress",
  "lastUpdatedAt,lastLoggedinAt,createdAt",
  "status",
  "updatedAt,ekycRequested"
);

console.log("Input (keys only):", Object.keys(dbUser));
console.log("Output:", JSON.stringify(apiResponse, null, 2));
console.log("Note: Transformed DB schema to clean API response\n");

// ============================================================================
// EXAMPLE 16: Complex Real-World - Document Processing
// ============================================================================
console.log("=".repeat(80));
console.log("EXAMPLE 16: Real-World - Government Document Application");
console.log("=".repeat(80));

const applicationForm = {
  aadhaarNumber: "9876-5432-1098",
  existingPanNumber: "FGHIJ5678K",
  applicantName: "Nina Patel",
  dateOfBirth: "1988-11-30",
  gender: "F",
  fatherName: "Raj Patel",
  motherName: "Priya Patel",
  phoneNumber: "555-0133",
  emailAddress: "nina.patel@example.com",
  addressLine1: "101 Gandhi Road",
  addressLine2: "Floor 3",
  postOffice: "Central PO",
  subdivision: "North Division",
  district: "Metro District",
  state: "Maharashtra",
  pincode: "400001",
  geoLat: 19.076,
  geoLng: 72.8777,
};

const documentApplication = mapObejct(
  applicationForm,
  "aadhaarNumber,existingPanNumber:existpanNumber",
  ":personalInfo::applicantName:name,dateOfBirth:dob,gender,fatherName:father,motherName:mother",
  ":contactInfo::phoneNumber:phone,emailAddress:email",
  ":addressInfo::addressLine1:line1,addressLine2:line2,postOffice:postoffice,subdivision,district,state,pincode",
  "geoLat:addressInfo.geo.location.lat",
  "geoLng:addressInfo.geo.location.lng"
);

console.log("Input (keys only):", Object.keys(applicationForm));
console.log("Output:", JSON.stringify(documentApplication, null, 2));
console.log("Note: Grouped form fields into logical sections\n");

// ============================================================================
// EXAMPLE 17: Array of Objects - Deep Nested Mapping
// ============================================================================
console.log("=".repeat(80));
console.log("EXAMPLE 17: Deep Nested Property Extraction from Arrays");
console.log("=".repeat(80));

const company = {
  name: "Tech Corp",
  employees: [
    {
      id: 1,
      profile: { name: "Oscar Reed", position: "CTO" },
      contact: { email: "oscar@techcorp.com" },
    },
    {
      id: 2,
      profile: { name: "Paula Singh", position: "CEO" },
      contact: { email: "paula@techcorp.com" },
    },
    {
      id: 3,
      profile: { name: "Quinn Taylor", position: "CFO" },
      contact: { email: "quinn@techcorp.com" },
    },
  ],
};

// Extract nested property from all array items
const leadership = mapObejct(
  company,
  "name:companyName",
  "employees.[profile.name]:leaders",
  "employees.[contact.email]:emails"
);

console.log("Input:", JSON.stringify(company, null, 2));
console.log("Output:", JSON.stringify(leadership, null, 2));
console.log("Note: [nested.property] extracts deep paths from each array item\n");

// ============================================================================
// EXAMPLE 18: Combining Multiple Patterns
// ============================================================================
console.log("=".repeat(80));
console.log("EXAMPLE 18: Advanced - Combining All Patterns");
console.log("=".repeat(80));

const complexData = {
  applicationId: "app_999",
  user: {
    profile: {
      firstName: "Rachel",
      lastName: "Underwood",
      dateOfBirth: "1995-04-12",
    },
    contact: {
      emails: ["rachel@example.com", "rachel.u@work.com"],
      phones: ["555-0111", "555-0222"],
    },
  },
  documents: [
    { type: "passport", number: "P123456", verified: true },
    { type: "license", number: "DL789012", verified: false },
  ],
  metadata: {
    submittedAt: "2024-01-20T14:30:00Z",
    status: "pending",
  },
};

const processedApp = mapObejct(
  complexData,
  "applicationId:id",
  ":applicant.::user.profile.firstName:firstName,user.profile.lastName:lastName",
  "user.contact.emails.0:applicant.email",
  "user.contact.phones.0:applicant.phone",
  "documents.[number]:documentNumbers",
  "documents.0.verified:primaryDocVerified",
  "metadata.::submittedAt,status"
);

console.log("Input:", JSON.stringify(complexData, null, 2));
console.log("Output:", JSON.stringify(processedApp, null, 2));
console.log("Note: Multiple techniques combined in single query\n");

// ============================================================================
// EXAMPLE 19: Writing Values - Building Objects
// ============================================================================
console.log("=".repeat(80));
console.log("EXAMPLE 19: Using writeValue to Build Objects");
console.log("=".repeat(80));

const { writeValue } = mapObejct;
const newUser = {};

// Build object step by step
writeValue(newUser, "id", "usr_001");
writeValue(newUser, "profile.name", "Steve Wilson");
writeValue(newUser, "profile.age", 28);
writeValue(newUser, "contacts.[]", "steve@example.com");
writeValue(newUser, "contacts.[]", "steve.wilson@work.com");
writeValue(newUser, "address.city", "Portland");
writeValue(newUser, "address.state", "OR");

console.log("Built object:", JSON.stringify(newUser, null, 2));
console.log("Note: writeValue creates nested structure automatically\n");

// ============================================================================
// EXAMPLE 20: Reading Values - Extracting Data
// ============================================================================
console.log("=".repeat(80));
console.log("EXAMPLE 20: Using readValue to Extract Data");
console.log("=".repeat(80));

const { readValue } = mapObejct;
const userData = {
  user: {
    profile: {
      name: "Tina Xu",
      settings: {
        theme: "dark",
        language: "zh",
      },
    },
    posts: [
      { title: "First Post", likes: 10 },
      { title: "Second Post", likes: 25 },
      { title: "Third Post", likes: 15 },
    ],
  },
};

console.log("name:", readValue(userData, "user.profile.name"));
console.log("theme:", readValue(userData, "user.profile.settings.theme"));
console.log("second post:", readValue(userData, "user.posts.1.title"));
console.log("last post:", readValue(userData, "user.posts.-1.title"));
console.log("all titles:", readValue(userData, "user.posts.[title]"));
console.log("all likes:", readValue(userData, "user.posts.[likes]"));
console.log("\nNote: readValue navigates any path, handles arrays\n");

// ============================================================================
// Summary of Key Patterns
// ============================================================================
console.log("=".repeat(80));
console.log("PATTERN SUMMARY");
console.log("=".repeat(80));
console.log(`
Basic Extraction:
  "field"                     → Extract field
  "field1,field2"             → Multiple fields (comma)
  "field1::field2"            → Multiple fields (:: preferred)
  
Renaming:
  "source:target"             → Read source, write to target
  
Navigation:
  "nested.path"               → Navigate object hierarchy
  "array.0"                   → Array index (positive)
  "array.-1"                  → Array index (negative, from end)
  "array.[property]"          → Extract property from all items
  "array.[nested.property]"   → Extract nested property from all items
  
Mappers (Context Setters):
  "prefix."                   → Read from prefix for following fields
  ":prefix."                  → Write to prefix for following fields
  "read:write."               → Read from 'read', write to 'write'
  
Advanced Extraction:
  ":nested::field1,field2"    → Extract multiple from nested
  "*"                         → Select entire object
  
Writing:
  writeValue(obj, "path", val) → Build objects dynamically
  writeValue(obj, "arr.[]", val) → Push to array
  
Reading:
  readValue(obj, "path")      → Extract any path
`);

console.log("=".repeat(80));
console.log("Examples complete! Check output above for detailed demonstrations.");
console.log("=".repeat(80));
