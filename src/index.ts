// --- Types ---

export type PiiType = "personnummer" | "phone" | "email" | "name";

export interface PiiDetection {
  type: string;
  original: string;
  placeholder: string;
}

export interface StripResult {
  original_length: number;
  stripped_length: number;
  stripped_text: string;
  detections: PiiDetection[];
  processing_time_ms: number;
}

export interface DetectResult {
  original_length: number;
  detections: PiiDetection[];
  pii_found: boolean;
  processing_time_ms: number;
}

export interface PiiSweepOptions {
  apiKey: string;
  baseUrl?: string;
}

// --- Error ---

export class PiiSweepError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(code: string, message: string, status: number) {
    super(message);
    this.name = "PiiSweepError";
    this.code = code;
    this.status = status;
  }
}

// --- Client ---

export class PiiSweep {
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor(options: string | PiiSweepOptions) {
    if (typeof options === "string") {
      this.apiKey = options;
      this.baseUrl = "https://piisweep.com";
    } else {
      this.apiKey = options.apiKey;
      this.baseUrl = (options.baseUrl ?? "https://piisweep.com").replace(
        /\/$/,
        ""
      );
    }
  }

  async strip(text: string, types?: PiiType[]): Promise<StripResult> {
    return this.request<StripResult>("/api/v1/strip", { text, types });
  }

  async detect(text: string, types?: PiiType[]): Promise<DetectResult> {
    return this.request<DetectResult>("/api/v1/detect", { text, types });
  }

  private async request<T>(
    path: string,
    body: Record<string, unknown>
  ): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      let code = "UNKNOWN_ERROR";
      let message = `Request failed with status ${res.status}`;

      try {
        const data = (await res.json()) as {
          error?: { code?: string; message?: string };
        };
        if (data.error) {
          code = data.error.code ?? code;
          message = data.error.message ?? message;
        }
      } catch {
        // Use defaults
      }

      throw new PiiSweepError(code, message, res.status);
    }

    return res.json() as Promise<T>;
  }
}
