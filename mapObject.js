/**
 * mapObject - A powerful utility for extracting, transforming, and mapping object data
 *
 * This library provides a declarative way to read from complex nested objects and write to
 * new objects with a different structure using simple string-based query syntax.
 *
 * @example
 * const user = { profile: { name: "John", email: "john@example.com" } };
 * const result = mapObject(user, "profile.name", "profile.email:userEmail");
 * // Returns: { name: "John", userEmail: "john@example.com" }
 */

// ============================================================================
// Type Checking Utilities
// ============================================================================

/**
 * Checks if a value is undefined
 * @param {*} val - Value to check
 * @returns {boolean}
 */
const isUndefined = (val) => val === undefined;

/**
 * Checks if a value is null
 * @param {*} val - Value to check
 * @returns {boolean}
 */
const isNull = (val) => val === null;

/**
 * Checks if a value is a plain object (not array, not null)
 * @param {*} val - Value to check
 * @returns {boolean}
 */
const isObject = (val) => typeof val === "object" && !Array.isArray(val) && val !== null;

/**
 * Checks if a string is a mapper pattern (e.g., "user.name." or ":user.name")
 * Mapper patterns are used to read from or write to nested object paths
 *
 * Valid patterns:
 * - "user.name." - Read from user.name
 * - ":user.name" - Write to user.name
 * - ":user.name." - Read from and write to user.name
 * - "user." - Read all from user
 *
 * @param {string} val - String to test
 * @returns {boolean}
 */
const isMapper = (val) =>
  /(^[$\w-]+(\.[$\w-]+)*(:[$\w-]+(\.[$\w-]+)*)?\.$)|(^:[$\w-]+(\.[$\w-]+)*\.?$)/.test(val);

/**
 * Checks if a string is an array key pattern (e.g., "[key]")
 * @param {string} val - String to test
 * @returns {boolean}
 */
const isArrayKey = (val) => /^\[[^\[\]]*\]$/.test(val);

/**
 * Checks if a string is a numeric index (e.g., "0", "-1")
 * @param {string} val - String to test
 * @returns {boolean}
 */
const isIndexKey = (val) => /^-?\d+$/.test(val);

/**
 * Converts a map string to an array by splitting on "::" or ","
 *
 * @example
 * toMapArray("user::name,email") // ["user", "name", "email"]
 *
 * @param {string|Array} map - Map string or array
 * @returns {Array<string>}
 */
const toMapArray = (map) => (typeof map === "string" ? map.split(/::|,/) : map);

// ============================================================================
// Core Reading Functions
// ============================================================================

/**
 * Reads a value from an object using a dot-notation path string
 *
 * Supports:
 * - Simple paths: "user.name"
 * - Array indices: "users.0" or "users.-1" (negative indices supported)
 * - Array mapping: "users.[name]" (extracts name from each user)
 * - Nested array mapping: "users.[profile.email]"
 * - Wildcard: "*" (returns the current object)
 *
 * @example
 * const data = { users: [{ name: "Alice" }, { name: "Bob" }] };
 * readValue(data, "users.[name]"); // ["Alice", "Bob"]
 * readValue(data, "users.0.name"); // "Alice"
 * readValue(data, "users.-1.name"); // "Bob"
 *
 * @param {Object} obj - Source object to read from
 * @param {string} path - Dot-notation path string
 * @returns {*} The value at the specified path, or undefined if not found
 * @throws {Error} If path is invalid or empty
 */
function readValue(obj, path) {
  if (typeof path !== "string") {
    throw new Error(`Path must be a string, received: ${typeof path}`);
  }
  if (path === "") {
    throw new Error("Path cannot be an empty string");
  }

  // Parse the path into segments, handling nested brackets like "users.[profile.name].0"
  const segments = path.match(/\*|(?<=\.|^)((\[[$\w\-]+(\.[$\w\-]+)*\])|[$\w\-]+)(?=\.|$)/g);

  if (!segments) {
    return undefined;
  }

  return segments.reduce((currentObj, key) => {
    if (key === "") {
      throw new Error(`Invalid path segment in: ${path}`);
    }

    // Wildcard returns current object
    if (key === "*") {
      return currentObj;
    }

    // Handle array operations
    if (isArrayKey(key) || isIndexKey(key)) {
      // Remove brackets: "[name]" → "name", "[-1]" → "-1"
      const cleanKey = key.replace(/(^\[)|(\]$)/g, "");

      if (!Array.isArray(currentObj) || !cleanKey) {
        return undefined;
      }

      // Numeric index: access specific array element
      if (isIndexKey(cleanKey)) {
        return currentObj.at(cleanKey);
      }

      // Property extraction: map over array and extract nested property
      // "users.[profile.name]" extracts profile.name from each user
      return currentObj.map((item) => (isObject(item) ? readValue(item, cleanKey) : undefined));
    }

    // Standard object property access
    return isObject(currentObj) ? currentObj[key] : undefined;
  }, obj);
}

// ============================================================================
// Core Writing Functions
// ============================================================================

/**
 * Writes a value to an object at a specified path, creating nested structure as needed
 *
 * Supports:
 * - Simple paths: "user.name" creates { user: { name: value } }
 * - Array indices: "users.0" or "users.-1"
 * - Array pushing: "users.[]" appends to array
 * - Bulk updates: "users.[name]" updates name in all array items
 *
 * @example
 * const obj = {};
 * writeValue(obj, "user.name", "Alice");
 * writeValue(obj, "user.emails.[]", "alice@example.com");
 * writeValue(obj, "user.emails.[]", "alice2@example.com");
 * // obj = { user: { name: "Alice", emails: ["alice@example.com", "alice2@example.com"] } }
 *
 * @param {Object} obj - Target object to write to (mutated in place)
 * @param {string} path - Dot-notation path string
 * @param {*} value - Value to write
 * @returns {Object} The modified object
 * @throws {Error} If path is invalid
 */
function writeValue(obj, path, value) {
  if (typeof path !== "string") {
    throw new Error(`Path must be a string, received: ${typeof path}`);
  }

  // Skip if trying to write undefined to a non-existent path
  if (value === undefined && readValue(obj, path) === undefined) {
    return obj;
  }

  const segments = path.match(/(?<=\.|^)(\[([$\w\-]+(\.[$\w\-]+)*)*\])|[$\w\-]+(?=\.|$)/g);

  if (!segments) {
    return obj;
  }

  segments.reduce((currentObj, key, index, array) => {
    const isLastKey = index + 1 === array.length;
    const nextKey = array[index + 1];

    /**
     * Determines what value to set at the current key
     * - If last key: use the provided value
     * - Otherwise: create appropriate container (array or object) based on next key
     */
    const getNextValue = (existingValue) => {
      if (isLastKey) {
        return value ?? undefined;
      }

      // Next key is array-like, ensure current value is an array
      if (isArrayKey(nextKey) || isIndexKey(nextKey)) {
        return (Array.isArray(existingValue) && existingValue) || [];
      }

      // Next key is object-like, ensure current value is an object
      return (isObject(existingValue) && existingValue) || {};
    };

    // Handle array operations
    if (isArrayKey(key) || isIndexKey(key)) {
      const cleanKey = key.replace(/(^\[)|(\]$)/g, "");

      // Empty brackets "[]" means push to array
      if (cleanKey === "") {
        currentObj.push(getNextValue());
        return currentObj.at(-1);
      }

      // Numeric index: update specific array element
      if (isIndexKey(cleanKey)) {
        const existingValue = currentObj.at(cleanKey);
        const shouldUpdate = !(isArrayKey(nextKey) || isIndexKey(nextKey)
          ? Array.isArray(existingValue)
          : isObject(existingValue));

        if (shouldUpdate) {
          const newValue = getNextValue(existingValue);
          if (/^-\d+$/.test(cleanKey)) {
            currentObj.splice(cleanKey, 1, newValue);
          } else {
            currentObj[cleanKey] = newValue;
          }
        }

        return currentObj.at(cleanKey);
      }

      // Property path "[profile.name]": update all array items
      currentObj.forEach((item) => {
        writeValue(item, cleanKey, getNextValue());
      });

      return currentObj;
    }

    // Handle object property operations
    const existingValue = currentObj[key];

    // If current object is an array, update all items
    if (Array.isArray(currentObj)) {
      currentObj.forEach((item) => {
        writeValue(item, key, getNextValue());
      });
      return currentObj;
    }

    // Check if we need to create a new container
    const shouldUpdate = !(isArrayKey(nextKey) || isIndexKey(nextKey)
      ? Array.isArray(existingValue)
      : isObject(existingValue));

    if (shouldUpdate) {
      currentObj[key] = getNextValue(existingValue);
    } else if (isLastKey) {
      currentObj[key] = value;
    }

    return currentObj[key];
  }, obj);

  return obj;
}

// ============================================================================
// Mapping and Resolution Functions
// ============================================================================

/**
 * Resolves a single map string to an identifier and value
 *
 * Map syntax:
 * - "user.name" → { identifier: "user.name", value: obj.user.name }
 * - "user.name:fullName" → { identifier: "fullName", value: obj.user.name }
 * - "user.name:" → { identifier: "name", value: obj.user.name }
 *
 * @example
 * const user = { profile: { name: "Alice" } };
 * resolveMap(user, "profile.name:userName");
 * // { identifier: "userName", value: "Alice" }
 *
 * @param {Object} obj - Source object
 * @param {string} map - Map string in format "source:target" or "source"
 * @returns {{identifier: string, value: *}}
 * @throws {Error} If map is not a string
 */
function resolveMap(obj, map) {
  if (typeof map !== "string") {
    throw new Error(`Map must be a string, received: ${typeof map}`);
  }

  // Split on colon: "user.name:fullName" → ["user.name", "fullName"]
  const [sourcePath, targetPath] = map.split(":");
  const value = readValue(obj, sourcePath);

  // Use target path if provided, otherwise use source path as identifier
  const identifier = targetPath || sourcePath;

  return { identifier, value };
}

/**
 * Resolves an array of map strings, handling nested mappers and prefixes
 *
 * Supports advanced patterns:
 * - "personalInfo." - Read all from personalInfo (mapper prefix)
 * - ":address." - Write all to address (mapper prefix)
 * - "personalInfo:person." - Read from personalInfo, write with person prefix
 * - Nested arrays for grouping: ["name", "email"] within larger map
 * - Multi-field syntax: "name,email" or "name::email"
 *
 * @example
 * const data = { user: { name: "Alice", email: "alice@example.com" } };
 * resolveMapArray(data, ["user.", "name", "email:userEmail"]);
 * // [
 * //   { identifier: "name", value: "Alice" },
 * //   { identifier: "userEmail", value: "alice@example.com" }
 * // ]
 *
 * @param {Object} obj - Source object
 * @param {Array<string|Array>} mapArray - Array of map strings or nested arrays
 * @returns {Array<{identifier: string, value: *}>}
 * @throws {Error} If mapArray is not an array
 */
function resolveMapArray(obj, mapArray) {
  if (!Array.isArray(mapArray)) {
    throw new Error(`Map array must be an array, received: ${typeof mapArray}`);
  }

  const workingMapArray = mapArray.slice();
  let sourceObj = obj;
  let identifierPrefix = "";

  // Check if first element is a mapper (path prefix directive)
  const firstElement = mapArray[0];
  if (typeof firstElement === "string" && isMapper(firstElement)) {
    workingMapArray.shift();

    // Parse mapper: "source:target." or "source." or ":target."
    const [readPath, writePath] = firstElement.split(/:|\.$/);
    const normalizedReadPath = readPath || (firstElement.endsWith(".") && writePath) || "";

    // Update source object if read path specified
    if (normalizedReadPath) {
      sourceObj = readValue(obj, normalizedReadPath);
    }

    // Update identifier prefix if write path specified
    if (writePath) {
      identifierPrefix = `${writePath}.`;
    }
  }

  const resolvedMaps = [];

  // Return empty if source object is undefined/null
  if (isUndefined(sourceObj) || isNull(sourceObj)) {
    return resolvedMaps;
  }

  // Process each map in the array
  workingMapArray.forEach((mapItem) => {
    if (typeof mapItem === "string") {
      // Handle multi-field syntax: "name,email" or "name::email"
      if (/::|,/.test(mapItem)) {
        const expandedMap = toMapArray(mapItem);
        const nestedResults = resolveMapArray(sourceObj, expandedMap);

        resolvedMaps.push(
          ...nestedResults.map(({ identifier, value }) => ({
            identifier: `${identifierPrefix}${identifier}`,
            value,
          }))
        );
      } else {
        // Single field map
        const result = resolveMap(sourceObj, mapItem);
        resolvedMaps.push({
          identifier: `${identifierPrefix}${result.identifier}`,
          value: result.value,
        });
      }
    } else if (Array.isArray(mapItem)) {
      // Nested array: recursively resolve
      const nestedResults = resolveMapArray(sourceObj, mapItem);
      resolvedMaps.push(
        ...nestedResults.map(({ identifier, value }) => ({
          identifier: `${identifierPrefix}${identifier}`,
          value,
        }))
      );
    }
  });

  return resolvedMaps;
}

// ============================================================================
// Main Query Function
// ============================================================================

/**
 * Main function: Extracts and transforms data from an object based on field mappings
 *
 * This is the primary API for the library. It takes a source object and one or more
 * field specifications, and returns a new object with the mapped data.
 *
 * Features:
 * - Extract specific fields: mapObject(obj, "name", "email")
 * - Rename fields: mapObject(obj, "name:fullName")
 * - Navigate nested objects: mapObject(obj, "user.profile.name")
 * - Handle arrays: mapObject(obj, "users.[name]")
 * - Group fields: mapObject(obj, "name,email,phone")
 * - Use mappers for bulk operations: mapObject(obj, "user.", "name", "email")
 * - Wildcard extraction: mapObject(obj, "*") returns entire object
 *
 * @example
 * // Basic usage
 * const user = {
 *   profile: { name: "Alice", age: 30 },
 *   contact: { email: "alice@example.com" }
 * };
 *
 * mapObject(user, "profile.name", "contact.email:userEmail");
 * // Returns: { name: "Alice", userEmail: "alice@example.com" }
 *
 * @example
 * // Using mappers
 * mapObject(user, "profile.", "name:fullName", "age");
 * // Returns: { fullName: "Alice", age: 30 }
 *
 * @example
 * // Complex mapping with restructuring
 * const data = {
 *   personalInfo: { name: "Bob", dob: "1990-01-01" },
 *   contactInfo: { email: "bob@example.com", phone: "123-456-7890" }
 * };
 *
 * mapObject(
 *   data,
 *   ":user.::personalInfo.name,contactInfo.email"
 * );
 * // Returns: { user: { name: "Bob", email: "bob@example.com" } }
 *
 * @param {Object|Array} obj - Source object or array to query
 * @param {...(string|Array)} fields - Field specifications (map strings or arrays)
 * @returns {Object|Array} New object with mapped data
 */
function mapObject(obj, ...fields) {
  // Initialize result container matching source type
  const result = { newObj: Array.isArray(obj) ? [] : {} };

  // Deep clone to avoid mutations (handles Mongoose documents via toObject)
  const sourceObj = JSON.parse(JSON.stringify(obj && obj.toObject ? obj.toObject() : obj));

  /**
   * Processes a single map specification
   */
  function processMap(mapSpec) {
    const expandedMap = toMapArray(mapSpec);

    if (!Array.isArray(expandedMap)) {
      return;
    }

    const resolvedFields = resolveMapArray(sourceObj, expandedMap);

    resolvedFields.forEach(({ identifier, value }) => {
      // Wildcard handling: merge or replace entire object
      if (identifier === "*") {
        if (Array.isArray(result.newObj) && Array.isArray(value)) {
          result.newObj.push(...value);
        } else if (isObject(result.newObj) && isObject(value)) {
          Object.assign(result.newObj, value);
        } else {
          result.newObj = value;
        }
      } else {
        writeValue(result.newObj, identifier, value);
      }
    });
  }

  // Process all field specifications
  fields.forEach((mapSpec) => {
    processMap(mapSpec);
  });

  return result.newObj;
}

// ============================================================================
// Exports
// ============================================================================

// Expose utility functions for advanced use cases
mapObject.readValue = readValue;
mapObject.writeValue = writeValue;

// CommonJS export
if (typeof module !== "undefined" && module.exports) {
  module.exports = mapObject;
}

// ES6 export
if (typeof window !== "undefined") {
  window.mapObject = mapObject;
}

// ============================================================================
// Usage Examples
// ============================================================================

/**
 * COMPREHENSIVE USAGE EXAMPLES
 *
 * These examples demonstrate real-world usage patterns covering all features.
 */

/*
// Example 1: Simple User Signup - Extract specific fields
const signupData = {
  name: "Alice Johnson",
  email: "alice@example.com",
  pincode: "123456",
  password: "secret123",
  passwordConfirm: "secret123",
  internalId: "xyz789" // This will be excluded
};

const signupUser = mapObject(
  signupData,
  "name",
  "pincode",
  "password",
  "passwordConfirm"
);
// Result: { name: "Alice Johnson", pincode: "123456", password: "secret123", passwordConfirm: "secret123" }


// Example 2: Complex User Creation - Restructuring nested data
const createData = {
  name: "Bob Smith",
  email: "bob@example.com",
  phone: "555-1234",
  dob: "1990-05-15",
  gender: "M",
  father: "John Smith",
  mother: "Jane Smith",
  pincode: "654321",
  address: { text: "123 Main St", location: { lat: 40.7128, lng: -74.0060 } },
  geo: { location: { lat: 40.7128, lng: -74.0060 } },
  aadhaarNumber: "1234-5678-9012",
  aadhaar: { url: "https://example.com/aadhaar.pdf" },
  panNumber: "ABCDE1234F",
  pan: { url: "https://example.com/pan.pdf" },
  photo: { url: "https://example.com/photo.jpg" },
  centrename: "Downtown Center",
  centreaddress: "456 Center Ave",
  password: "newpass123",
  passwordConfirm: "newpass123"
};

const createdUser = mapObject(
  createData,
  "photo:$push.photo.url",
  "email,phone",
  "name,dob,gender,father,mother",
  "pincode",
  ":address::address:text,location:geo.location",
  ":uidaRequest::aadhaarNumber:text,aadhaar:url",
  ":uidpRequest::panNumber:text,pan:url",
  "centrename,centreaddress",
  "password,passwordConfirm"
);
// Result: {
//   $push: { photo: { url: "https://example.com/photo.jpg" } },
//   email: "bob@example.com",
//   phone: "555-1234",
//   name: "Bob Smith",
//   dob: "1990-05-15",
//   gender: "M",
//   father: "John Smith",
//   mother: "Jane Smith",
//   pincode: "654321",
//   address: {
//     text: "123 Main St",
//     location: { lat: 40.7128, lng: -74.0060 }
//   },
//   uidaRequest: {
//     text: "1234-5678-9012",
//     url: "https://example.com/aadhaar.pdf"
//   },
//   uidpRequest: {
//     text: "ABCDE1234F",
//     url: "https://example.com/pan.pdf"
//   },
//   centrename: "Downtown Center",
//   centreaddress: "456 Center Ave",
//   password: "newpass123",
//   passwordConfirm: "newpass123"
// }


// Example 3: User Response - Formatting for API response
const userData = {
  id: "user123",
  userId: "USR001",
  email: "charlie@example.com",
  phone: "555-9876",
  photo: [
    { url: "https://example.com/old-photo.jpg" },
    { url: "https://example.com/current-photo.jpg" }
  ],
  name: "Charlie Davis",
  gender: "F",
  address: {
    text: "789 Oak Lane",
    geo: { location: { lat: 34.0522, lng: -118.2437 } }
  },
  centrename: "West Center",
  centreaddress: "321 West Blvd",
  lastUpdatedAt: "2024-01-15T10:30:00Z",
  lastLoggedinAt: "2024-01-20T14:22:00Z",
  createdAt: "2023-06-01T08:00:00Z",
  status: "active",
  updatedAt: "2024-01-15T10:30:00Z",
  ekycRequested: true
};

const userResponse = mapObject(
  userData,
  "uid:id,userId,email,phone,photo.-1.url:photo",
  "name,gender",
  "address.::text:address,geo.location:location",
  "centrename,centreaddress",
  "lastUpdatedAt,lastLoggedinAt,createdAt",
  "status",
  "updatedAt,ekycRequested"
);
// Result: {
//   id: "user123",
//   userId: "USR001",
//   email: "charlie@example.com",
//   phone: "555-9876",
//   photo: "https://example.com/current-photo.jpg",
//   name: "Charlie Davis",
//   gender: "F",
//   address: "789 Oak Lane",
//   location: { lat: 34.0522, lng: -118.2437 },
//   centrename: "West Center",
//   centreaddress: "321 West Blvd",
//   lastUpdatedAt: "2024-01-15T10:30:00Z",
//   lastLoggedinAt: "2024-01-20T14:22:00Z",
//   createdAt: "2023-06-01T08:00:00Z",
//   status: "active",
//   updatedAt: "2024-01-15T10:30:00Z",
//   ekycRequested: true
// }


// Example 4: Nested Array Mapping - KYC Request
const kycData = {
  photo: { url: "https://example.com/kyc-photo.jpg" },
  name: "Diana Evans",
  gender: "F",
  dob: "1988-09-20",
  father: "Edward Evans",
  mother: "Fiona Evans",
  address: { text: "456 Pine Rd", location: { lat: 51.5074, lng: -0.1278 } },
  uida: { aadhaarNumber: "9876-5432-1098", text: "9876-5432-1098", url: "https://example.com/aadhaar2.pdf" },
  uidp: { panNumber: "FGHIJ5678K", text: "FGHIJ5678K", url: "https://example.com/pan2.pdf" },
  centrename: "North Center",
  centreaddress: "789 North St"
};

const kycRequest = mapObject(
  kycData,
  [
    ":$push.kycRequests",
    "photo:$push.photo.url",
    "name,gender,dob,father,mother",
    ":address::address:text,location:geo.location",
    "uida:aadhaarNumber:text,aadhaar:url",
    "uidp:panNumber:text,pan:url"
  ],
  "centrename,centreaddress"
);
// Result: {
//   $push: {
//     kycRequests: {
//       photo: { url: "https://example.com/kyc-photo.jpg" },
//       name: "Diana Evans",
//       gender: "F",
//       dob: "1988-09-20",
//       father: "Edward Evans",
//       mother: "Fiona Evans",
//       address: {
//         text: "456 Pine Rd",
//         location: { lat: 51.5074, lng: -0.1278 }
//       },
//       aadhaarNumber: { text: "9876-5432-1098", url: "https://example.com/aadhaar2.pdf" },
//       panNumber: { text: "FGHIJ5678K", url: "https://example.com/pan2.pdf" }
//     }
//   },
//   centrename: "North Center",
//   centreaddress: "789 North St"
// }


// Example 5: Document Update with Prefix Mapping
const docData = {
  aadhaarNumber: "5555-6666-7777",
  existpanNumber: "LMNOP9012Q",
  name: "Eric Foster",
  dob: "1995-03-10",
  gender: "M",
  father: "George Foster",
  mother: "Helen Foster",
  phone: "555-4321",
  email: "eric@example.com",
  addressLine1: "101 Maple Ave",
  addressLine2: "Apt 5B",
  postoffice: "Central PO",
  subdivision: "District 3",
  district: "Metro District",
  state: "State A",
  pincode: "111222",
  location: { lat: 37.7749, lng: -122.4194 }
};

const updatedDoc = mapObject(
  docData,
  "aadhaarNumber,existpanNumber",
  ":personalInfo::name,dob,gender,father,mother",
  ":contactInfo::phone,email",
  ":addressInfo::addressLine1:line1,addressLine2:line2,postoffice,subdivision,district,state,pincode",
  "location:addressInfo.geo.location"
);
// Result: {
//   aadhaarNumber: "5555-6666-7777",
//   existpanNumber: "LMNOP9012Q",
//   personalInfo: {
//     name: "Eric Foster",
//     dob: "1995-03-10",
//     gender: "M",
//     father: "George Foster",
//     mother: "Helen Foster"
//   },
//   contactInfo: {
//     phone: "555-4321",
//     email: "eric@example.com"
//   },
//   addressInfo: {
//     line1: "101 Maple Ave",
//     line2: "Apt 5B",
//     postoffice: "Central PO",
//     subdivision: "District 3",
//     district: "Metro District",
//     state: "State A",
//     pin
*/
