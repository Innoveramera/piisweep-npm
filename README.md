# piisweep

TypeScript client for the [PiiSweep](https://piisweep.com) API — Swedish PII detection and stripping.

## Install

```bash
npm install piisweep
```

## Quick start

```ts
import { PiiSweep } from "piisweep";

const pii = new PiiSweep("pg_live_...");

// Strip PII from text
const stripped = await pii.strip("Ring Johan Andersson på 070-123 45 67");
console.log(stripped.stripped_text);
// "Ring [NAME] på [PHONE]"

// Detect PII without stripping
const detected = await pii.detect("Personnummer: 199001011234");
console.log(detected.pii_found); // true
console.log(detected.detections);
// [{ type: "personnummer", original: "199001011234", placeholder: "[PERSONNUMMER]" }]
```

## Constructor

```ts
// API key only
const pii = new PiiSweep("pg_live_...");

// With options
const pii = new PiiSweep({
  apiKey: "pg_live_...",
  baseUrl: "http://localhost:3000", // default: "https://piisweep.com"
});
```

## Methods

### `strip(text, types?)`

Strip PII from text, replacing detections with placeholders.

```ts
const result = await pii.strip("Email: test@example.com", ["email"]);
```

Returns `StripResult`:

| Field               | Type             | Description                    |
| ------------------- | ---------------- | ------------------------------ |
| `original_length`   | `number`         | Character count of input text  |
| `stripped_length`    | `number`         | Character count of output text |
| `stripped_text`      | `string`         | Text with PII replaced         |
| `detections`        | `PiiDetection[]` | List of detected PII           |
| `processing_time_ms`| `number`         | Server processing time in ms   |

### `detect(text, types?)`

Detect PII in text without modifying it.

```ts
const result = await pii.detect("Ring 08-123 456");
```

Returns `DetectResult`:

| Field               | Type             | Description                    |
| ------------------- | ---------------- | ------------------------------ |
| `original_length`   | `number`         | Character count of input text  |
| `detections`        | `PiiDetection[]` | List of detected PII           |
| `pii_found`         | `boolean`        | Whether any PII was found      |
| `processing_time_ms`| `number`         | Server processing time in ms   |

### PII types

Pass an optional array to scan for specific types only:

```ts
await pii.strip(text, ["personnummer", "email"]);
```

Available types: `personnummer`, `phone`, `email`, `name`

## Error handling

API errors throw `PiiSweepError` with `code`, `message`, and `status`:

```ts
import { PiiSweep, PiiSweepError } from "piisweep";

try {
  await pii.strip(text);
} catch (err) {
  if (err instanceof PiiSweepError) {
    console.error(err.code);    // "UNAUTHORIZED"
    console.error(err.status);  // 401
    console.error(err.message); // "Invalid or missing API key"
  }
}
```

## Type exports

All types are exported for use in your application:

```ts
import type {
  PiiType,
  PiiDetection,
  StripResult,
  DetectResult,
  PiiSweepOptions,
} from "piisweep";
```

## License

MIT
