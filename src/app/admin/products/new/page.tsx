import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export default async function NewProductPage() {
  const session = await auth();

  // ПЕРЕВІРКА РОЛІ
  const isAdmin = (session?.user as any)?.role === "ADMIN" || session?.user?.email === "pristinskayaalina9@gmail.com";
  if (!isAdmin) {
    redirect("/");
  }

  const categories = await prisma.category.findMany();

  async function addProduct(formData: FormData) {
    "use server";

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const price = parseFloat(formData.get("price") as string);
    const categoryId = formData.get("categoryId") as string;
    const stock = parseInt(formData.get("stock") as string);
    const imageUrl = formData.get("imageUrl") as string;

    await prisma.product.create({
      data: {
        name,
        description,
        price,
        stock,
        categoryId,
        images: [imageUrl],
        weight: 0.5,
        width: 10,
        height: 10,
        length: 10,
      },
    });

    revalidatePath("/admin/products");
    revalidatePath("/");
    redirect("/admin/products");
  }

  return (
    <div className="min-h-screen bg-[#fafafa] p-6 md:p-12 text-black">
      <div className="max-w-3xl mx-auto">
        <header className="mb-12">
          <h1 className="text-4xl font-black tracking-tighter uppercase italic">Create Product</h1>
          <p className="text-gray-400 font-bold uppercase text-[10px] mt-2 tracking-widest">Add new item to your catalog</p>
        </header>

        <form action={addProduct} className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-sm border border-gray-100 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Product Name</label>
              <input name="name" required className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-black" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Category</label>
              <select name="categoryId" required className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl">
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Description</label>
            <textarea name="description" required rows={4} className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Price (UAH)</label>
              <input name="price" type="number" step="0.01" required className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Stock Quantity</label>
              <input name="stock" type="number" required className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Image URL</label>
            <input name="imageUrl" type="url" required className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl" />
          </div>
          <button type="submit" className="w-full bg-black text-white py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs hover:bg-indigo-600 transition-all">
            Save Product
          </button>
        </form>
      </div>
    </div>
  );
}