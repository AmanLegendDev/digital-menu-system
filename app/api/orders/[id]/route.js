import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Orders from "@/models/Orders";


export async function PUT(req, { params }) {
  await connectDB();
  const body = await req.json();

  try {
    const updated = await Orders.findByIdAndUpdate(
      params.id,
      { status: body.status },
      { new: true }
    );

    return NextResponse.json({ success: true, order: updated });
  } catch (err) {
    return NextResponse.json({ success: false });
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { id } = params;

    await Orders.findByIdAndDelete(id);

    return NextResponse.json(
      { success: true, message: "Order deleted" },
      { status: 200 }
    );
  } catch (err) {
    console.log("DELETE Order Error:", err);
    return NextResponse.json(
      { success: false, message: "Delete failed" },
      { status: 500 }
    );
  }
}
