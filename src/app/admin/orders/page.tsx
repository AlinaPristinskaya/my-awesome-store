import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import Image from "next/image";
import { Package, Calendar, Tag, CreditCard, User, Truck } from "lucide-react";
import { updateOrderStatus } from "@/lib/order";

const getStatusStyles = (status: string) => {
  switch (status) {
    case "COMPLETED": 
      return "bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100";
    case "PROCESSING": 
      return "bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100";
    default:
      return "bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-100";
  }
};

export default async function AdminOrdersPage() {
  const session = await auth();

  // ПЕРЕВІРКА РОЛІ
  const isAdmin = (session?.user as any)?.role === "ADMIN" || session?.user?.email === "pristinskayaalina9@gmail.com";
  if (!isAdmin) {
    redirect("/");
  }

  const allOrders = await prisma.order.findMany({
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: "desc" },
  });

  const totalRevenue = allOrders.reduce((sum, order) => sum + order.totalAmount, 0);

  return (
    <div className="min-h-screen bg-[#fafafa] p-6 md:p-12 text-black">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h1 className="text-6xl font-black tracking-tighter uppercase">Admin Panel</h1>
            <p className="text-gray-400 font-bold uppercase text-[10px] mt-2 tracking-widest">Store Management</p>
          </div>
          <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-6">
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Revenue</p>
              <p className="text-3xl font-black text-indigo-600">{totalRevenue.toLocaleString()} UAH</p>
            </div>
            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center">
              <CreditCard className="text-indigo-600 w-6 h-6" />
            </div>
          </div>
        </header>

        <div className="grid gap-8">
          {allOrders.map((order) => (
            <div key={order.id} className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-8 border-b border-gray-50 bg-gray-50/30 grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <span className="flex items-center gap-2 text-gray-400 mb-1 font-black uppercase text-[10px] tracking-widest"><User className="w-3" /> Customer</span>
                  <p className="font-bold text-sm">{order.customerName}</p>
                  <p className="text-[10px] text-gray-400">{order.customerEmail}</p>
                </div>
                <div>
                  <span className="flex items-center gap-2 text-gray-400 mb-1 font-black uppercase text-[10px] tracking-widest"><Tag className="w-3" /> ID</span>
                  <p className="font-mono text-sm font-bold">#{order.id.slice(-8).toUpperCase()}</p>
                </div>
                <div>
                  <span className="flex items-center gap-2 text-gray-400 mb-1 font-black uppercase text-[10px] tracking-widest"><Truck className="w-3" /> Address</span>
                  <p className="text-xs font-bold leading-tight">{order.customerAddress}</p>
                </div>
                <div className="flex flex-col items-start md:items-end justify-center">
                  <form action={async () => {
                    "use server";
                    await updateOrderStatus(order.id, order.status);
                    revalidatePath("/admin/orders");
                    revalidatePath("/orders");
                  }}>
                    <button type="submit" className={`px-6 py-2 rounded-full text-[10px] font-black uppercase border transition-all active:scale-95 ${getStatusStyles(order.status)}`}>
                      {order.status}
                    </button>
                  </form>
                  <p className="text-[9px] font-black mt-2 uppercase tracking-tighter text-gray-400">
                    {order.isPaid ? "✅ PAID" : "❌ UNPAID"}
                  </p>
                </div>
              </div>
              <div className="p-8 flex gap-4 overflow-x-auto">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 bg-gray-50 p-2 pr-4 rounded-xl border border-gray-100 shrink-0">
                    <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-white">
                      <Image src={item.product?.images[0] || "/placeholder.png"} alt="" fill className="object-cover" />
                    </div>
                    <p className="text-[10px] font-bold leading-tight max-w-[100px]">{item.name} <br/><span className="text-indigo-600">x{item.quantity}</span></p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}