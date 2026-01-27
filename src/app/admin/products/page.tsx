import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import Image from "next/image";
import Link from "next/link";
import { Plus, Trash2, Edit, Package, CreditCard } from "lucide-react";

const getStatusStyles = (stock: number) => {
  if (stock > 5) return "bg-emerald-50 text-emerald-600 border-emerald-100";
  if (stock > 0) return "bg-amber-50 text-amber-600 border-amber-100";
  return "bg-rose-50 text-rose-600 border-rose-100";
};

export default async function AdminProductsPage() {
  const session = await auth();

  // Жорстка перевірка на адміна
  if (session?.user?.email !== "pristinskayaalina9@gmail.com") {
    redirect("/");
  }

  // Отримуємо всі товари з категоріями
  const products = await prisma.product.findMany({
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-[#fafafa] p-6 md:p-12 text-black font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 mb-2">
              <div className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Warehouse Manager</span>
            </div>
            <h1 className="text-6xl font-black tracking-tighter uppercase italic">Inventory</h1>
          </div>
          
          <Link 
            href="/admin/products/new" 
            className="bg-black text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-indigo-600 transition-all flex items-center gap-2 shadow-xl active:scale-95"
          >
            <Plus className="w-4 h-4" /> Add New Item
          </Link>
        </header>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Products</p>
            <p className="text-4xl font-black">{products.length}</p>
          </div>
          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Out of Stock</p>
              <p className="text-4xl font-black text-rose-500">{products.filter(p => p.stock === 0).length}</p>
            </div>
            <Package className="text-gray-100 w-12 h-12" />
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="p-8 text-[10px] font-black uppercase tracking-widest text-gray-400">Product Info</th>
                  <th className="p-8 text-[10px] font-black uppercase tracking-widest text-gray-400">Category</th>
                  <th className="p-8 text-[10px] font-black uppercase tracking-widest text-gray-400">Stock</th>
                  <th className="p-8 text-[10px] font-black uppercase tracking-widest text-gray-400">Price</th>
                  <th className="p-8 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50/20 transition-colors group">
                    <td className="p-8">
                      <div className="flex items-center gap-6">
                        <div className="relative w-16 h-20 rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 shrink-0 shadow-sm">
                          <Image
                            src={product.images[0] || "/placeholder.png"}
                            alt={product.name}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        </div>
                        <div>
                          <p className="font-black text-base leading-tight mb-1">{product.name}</p>
                          <p className="text-[10px] text-gray-400 font-mono tracking-tighter uppercase">ID: {product.id.slice(-8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-8">
                      <span className="px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase">
                        {product.category?.name || "No Category"}
                      </span>
                    </td>
                    <td className="p-8">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase border ${getStatusStyles(product.stock)}`}>
                        {product.stock} in stock
                      </span>
                    </td>
                    <td className="p-8 font-black text-lg">
                      {product.price.toLocaleString()} <span className="text-[10px] text-gray-400 ml-1">UAH</span>
                    </td>
                    <td className="p-8 text-right">
                      <div className="flex justify-end items-center gap-3">
                        <button className="p-3 hover:bg-white hover:shadow-lg rounded-2xl transition-all text-gray-400 hover:text-black active:scale-90">
                          <Edit className="w-5 h-5" />
                        </button>
                        
                        {/* SERVER ACTION ДЛЯ ВИДАЛЕННЯ */}
                        <form action={async () => {
                          "use server";
                          await prisma.product.delete({
                            where: { id: product.id }
                          });
                          revalidatePath("/admin/products");
                        }}>
                          <button 
                            type="submit" 
                            className="p-3 hover:bg-rose-50 rounded-2xl transition-all text-gray-300 hover:text-rose-600 active:scale-90"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {products.length === 0 && (
            <div className="p-32 text-center bg-white">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Package className="w-10 h-10 text-gray-200" />
              </div>
              <p className="text-gray-400 font-black uppercase text-xs tracking-[0.2em]">The warehouse is empty</p>
              <Link href="/admin/products/new" className="text-indigo-600 font-black text-[10px] uppercase mt-4 inline-block hover:underline">Add first product →</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}