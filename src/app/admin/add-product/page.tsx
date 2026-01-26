import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ProductForm from "@/components/ProductForm";
import { PlusCircle } from "lucide-react";

export default async function AddProductPage() {
  const session = await auth();

  // Жесткая проверка на твой email, идентичная admin/orders
  if (session?.user?.email !== "pristinskayaalina9@gmail.com") {
    redirect("/");
  }

  // Получаем категории для выпадающего списка в форме
  const categories = await prisma.category.findMany();

  return (
    <div className="min-h-screen bg-[#fafafa] p-6 md:p-12 text-black">
      <div className="max-w-3xl mx-auto">
        
        {/* Header в стиле твоей админки */}
        <header className="mb-12">
          <div className="flex items-center gap-2 text-indigo-600 mb-2">
            <PlusCircle className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Inventory Management</span>
          </div>
          <h1 className="text-6xl font-black tracking-tighter">Add Product</h1>
          <p className="text-gray-400 font-medium mt-2">Create a new item for your store catalog</p>
        </header>

        {/* Форма в белом контейнере с закруглениями */}
        <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-sm border border-gray-100">
          <ProductForm categories={categories} />
        </div>
        
      </div>
    </div>
  );
}