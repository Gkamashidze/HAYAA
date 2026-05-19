import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import { randomBytes } from "crypto";
import path from "path";

const MAX_BYTES = 5 * 1024 * 1024; // 5MB

// Allowed image types with their canonical extension and magic-byte signature.
// The extension is derived here, never from the user-supplied filename.
const IMAGE_TYPES = {
  "image/jpeg": { ext: "jpg", magic: [0xff, 0xd8, 0xff] },
  "image/png": { ext: "png", magic: [0x89, 0x50, 0x4e, 0x47] },
  "image/gif": { ext: "gif", magic: [0x47, 0x49, 0x46, 0x38] },
  "image/webp": { ext: "webp", magic: [0x52, 0x49, 0x46, 0x46] }, // "RIFF"
} as const;

type ImageType = keyof typeof IMAGE_TYPES;

function matchesMagic(bytes: Uint8Array, magic: readonly number[]): boolean {
  return magic.every((byte, i) => bytes[i] === byte);
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Reject oversized uploads before buffering the whole body into memory.
    const contentLength = Number(req.headers.get("content-length") ?? 0);
    if (contentLength > MAX_BYTES + 1024) {
      return NextResponse.json(
        { error: "File too large (max 5MB)" },
        { status: 413 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: "File too large (max 5MB)" },
        { status: 413 }
      );
    }

    const declaredType = file.type;
    if (!(declaredType in IMAGE_TYPES)) {
      return NextResponse.json(
        { error: "Only JPEG, PNG, WebP, GIF allowed" },
        { status: 400 }
      );
    }
    const spec = IMAGE_TYPES[declaredType as ImageType];

    // Verify real file content, not the client-supplied MIME type.
    const bytes = new Uint8Array(await file.arrayBuffer());
    if (!matchesMagic(bytes, spec.magic)) {
      return NextResponse.json(
        { error: "File content does not match its type" },
        { status: 400 }
      );
    }

    // Server-generated filename with a fixed safe extension — no user input.
    const filename = `${Date.now()}-${randomBytes(8).toString("hex")}.${spec.ext}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, filename), Buffer.from(bytes));

    return NextResponse.json({ url: `/uploads/${filename}` });
  } catch {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
