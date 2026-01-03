# map-object

A lightweight utility for **declarative object reading, mapping, and reshaping** using a compact string-based DSL.

It helps extract, transform, and restructure deeply nested objects (including arrays) **without repetitive mapping code**. Designed for API layers, DTOs, serializers, and data-transformation pipelines with **trusted input**.

---

## Why this exists

If you’ve ever written code like this:

```js
{
  name: user.profile.name,
  email: user.contact.email,
  photo: user.photos[user.photos.length - 1]?.url
}
```

…and then had to repeat it for multiple endpoints or services — this library exists to remove that repetition.

You describe **what you want**, not **how to traverse the object**.

---

## Installation

```bash
npm install map-object
```

```js
const mapObject = require("map-object");
```

---

## Mental Model

This library works in **three phases**:

1. **Read** values from the source object (deep paths, arrays, wildcards)
2. **Resolve** mappings (rename, group, prefix)
3. **Write** values into a new object (creating structure as needed)

Everything is driven by **string-based field definitions**.

---

## Basic Usage

```js
const user = {
  profile: { name: "Alice" },
  contact: { email: "alice@example.com" },
};

const result = mapObject(user, "profile.name", "contact.email:userEmail");

console.log(result);
// { name: "Alice", userEmail: "alice@example.com" }
```

---

## Field Mapping Syntax

### Read → Write

```text
source.path:target.path
```

```js
"profile.name:fullName";
```

---

### Multiple fields

```js
"name,email,phone";
```

---

### Nested grouping

```js
":address::line1,line2,pincode";
```

```js
// Result
{
  address: {
    line1: "...",
    line2: "...",
    pincode: "..."
  }
}
```

---

## Array Support

### Last item

```js
"photos.-1.url:photo";
```

### Push into array

```js
"photo:photo.[].url";
```

### Map over arrays

```js
"users.[name]";
```

---

## Mapper Prefixes

Mapper prefixes let you **shift read/write context**.

```js
"user.";
```

Reads everything from `user`.

```js
":profile.";
```

Writes everything under `profile`.

```js
"user:account.";
```

Reads from `user`, writes under `account`.

---

## Wildcard

```js
"*";
```

Copies the entire object.

---

## Real-World Example (API Response)

```js
const response = mapObject(
  user,
  "uid:id,userId,email,phone,photo.-1.url:photo",
  "name,gender",
  "address.::text:address,geo.location:location",
  "status,createdAt,updatedAt"
);
```

Produces a clean, API-friendly response object.

---

## Supported Path Features

| Feature     | Example                 |
| ----------- | ----------------------- |
| Dot paths   | `user.name`             |
| Array index | `photos.0`, `photos.-1` |
| Array push  | `photos.[]`             |
| Array map   | `users.[email]`         |
| Nested map  | `users.[profile.name]`  |
| Wildcard    | `*`                     |

---

## When NOT to use this

- ❌ Untrusted user input (this is a DSL, not a sandbox)
- ❌ Performance-critical inner loops
- ❌ Type-strict, compile-time mapping requirements

This tool favors **flexibility and clarity** over strict typing.

---

## Advanced Usage

Utility methods are exposed if needed:

```js
mapObject.readValue(obj, path);
mapObject.writeValue(obj, path, value);
```

---

## Philosophy

- No dependencies
- No code generation
- No schema enforcement
- String-based, declarative mapping
- Built for **real production data**

---

## License

MIT
