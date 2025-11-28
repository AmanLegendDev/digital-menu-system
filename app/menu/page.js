import MenuClient from "./MenuClient";
import { connectDB } from "@/lib/db";
import Category from "@/models/Category";
import MenuItems from "@/models/MenuItems";
export const dynamic = "force-dynamic";
export const revalidate = false;


export default async function MenuPage() {
  await connectDB();

  const categories = await Category.find().lean();
  const items = await MenuItems.find().populate("category").lean();

  return (
    <MenuClient
      categories={JSON.parse(JSON.stringify(categories))}
      items={JSON.parse(JSON.stringify(items))}
    />
  );
}
