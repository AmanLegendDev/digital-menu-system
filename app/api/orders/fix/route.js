import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Orders from "@/models/Orders";

export async function GET() {
  await connectDB();

  await Orders.updateMany(
    { seenByAdmin: { $exists: false } },
    { $set: { seenByAdmin: false } }
  );

  return NextResponse.json({ fixed: true });
}
