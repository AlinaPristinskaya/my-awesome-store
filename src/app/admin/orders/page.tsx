import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import Image from "next/image";
import { Package, Calendar, Tag, CreditCard, User, Truck } from "lucide-react";

// Функция для стилей статуса (теперь они кликабельные кнопки)
const getStatusStyles = (status: string) => {
  switch (status) {
    case "COMPLETED":
      return "bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100";
    case "PROCESSING":
      return "bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100";
    default: // PENDING
      return "bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-100";
  }
};

export default async function AdminOrdersPage() {
  const session = await auth();

  // Жесткая проверка на твой email
  if (session?.user?.email !== "pristinskayaalina9@gmail.com") {
    redirect("/");
  }

  const allOrders = await prisma.order.findMany({
    include: {
      items: { include: { product: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const totalRevenue = allOrders.reduce((sum, order) => sum + order.totalAmount, 0);

  return (
    <div className="min-h-screen bg-[#fafafa] p-6 md:p-12 text-black">
      <div className="max-w-6xl mx-auto">
        
        {/* Admin Header */}
        <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 mb-2">
              <div className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Management Console</span>
            </div>
            <h1 className="text-6xl font-black tracking-tighter">Admin Panel</h1>
          </div>
          
          <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-6">
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Revenue</p>
              <p className="text-3xl font-black text-indigo-600">${totalRevenue.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center">
              <CreditCard className="text-indigo-600 w-6 h-6" />
            </div>
          </div>
        </header>

        <div className="grid gap-8">
          {allOrders.map((order) => (
            <div key={order.id} className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
              
              {/* Top Info Bar */}
              <div className="p-8 border-b border-gray-50 bg-gray-50/30 grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <div className="flex items-center gap-2 text-gray-400 mb-1 font-black uppercase text-[10px] tracking-widest">
                    <User className="w-3 h-3" /> Customer
                  </div>
                  <p className="font-bold text-sm">{order.customerName}</p>
                  <p className="text-xs text-gray-500">{order.customerEmail}</p>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-gray-400 mb-1 font-black uppercase text-[10px] tracking-widest">
                    <Tag className="w-3 h-3" /> Order ID
                  </div>
                  <p className="font-mono text-sm font-bold">#{order.id.slice(-8).toUpperCase()}</p>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-gray-400 mb-1 font-black uppercase text-[10px] tracking-widest">
                    <Truck className="w-3 h-3" /> Address
                  </div>
                  <p className="text-xs font-bold leading-tight">{order.customerAddress}</p>
                </div>

                {/* SERVER ACTION BUTTON - Переключатель статуса */}
                <div className="flex flex-col items-start md:items-end justify-center">
                  <form action={async () => {
                    "use server";
                    const newStatus = order.status === "PENDING" ? "COMPLETED" : "PENDING";
                    await prisma.order.update({
                      where: { id: order.id },
                      data: { status: newStatus }
                    });
                    revalidatePath("/admin/orders");
                    revalidatePath("/orders");
                  }}>
                    <button 
                      type="submit"
                      className={`px-6 py-2 rounded-full text-[10px] font-black uppercase border transition-all active:scale-95 shadow-sm ${getStatusStyles(order.status)}`}
                    >
                      {order.status}
                    </button>
                    <p className="text-[9px] text-gray-400 mt-2 text-center w-full uppercase font-bold tracking-tighter">Click to toggle</p>
                  </form>
                </div>
              </div>

              {/* Items List */}
              <div className="p-8">
                <div className="flex flex-wrap gap-6">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 bg-gray-50/50 p-3 rounded-2xl border border-gray-100">
                      <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-white shadow-sm">
                        <Image
                          src={item.product?.images[0] || "/placeholder.png"}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-bold text-sm leading-tight">{item.name}</p>
                        <p className="text-[10px] text-gray-400 font-black uppercase">{item.quantity} units — ${item.price}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}