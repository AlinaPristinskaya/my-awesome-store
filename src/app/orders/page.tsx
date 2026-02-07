import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Image from "next/image";
import { Package, Calendar, Tag, CreditCard } from "lucide-react";

const getStatusStyles = (status: string) => {
  switch (status) {
    case "COMPLETED": return "bg-emerald-50 text-emerald-600 border-emerald-100";
    case "PROCESSING": return "bg-blue-50 text-blue-600 border-blue-100";
    case "CANCELLED": return "bg-rose-50 text-rose-600 border-rose-100";
    default: return "bg-amber-50 text-amber-600 border-amber-100";
  }
};

export default async function OrdersPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  const orders = await prisma.order.findMany({
    where: { 
      OR: [
        { userId: session.user.id },
        { customerEmail: session.user.email as string }
      ]
    },
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-[#fafafa] p-6 md:p-12 text-black">
      <div className="max-w-5xl mx-auto">
        <header className="mb-12">
          <h1 className="text-5xl font-black tracking-tighter uppercase">My Orders</h1>
          <p className="text-gray-400 font-bold uppercase text-xs tracking-widest mt-2">Personal Purchase History</p>
        </header>

        {orders.length === 0 ? (
          <div className="bg-white p-20 rounded-[3rem] text-center border border-gray-100">
            <Package className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <h2 className="text-xl font-bold uppercase">No orders yet</h2>
            <a href="/" className="mt-6 inline-block bg-black text-white px-8 py-3 rounded-2xl font-bold uppercase text-xs tracking-widest">Start Shopping</a>
          </div>
        ) : (
          <div className="grid gap-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-sm">
                <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/20">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Order</p>
                      <p className="font-mono text-sm font-bold">#{order.id.slice(-8).toUpperCase()}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Status</p>
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-black border uppercase ${getStatusStyles(order.status)}`}>{order.status}</span>
                    </div>
                    <div className="hidden md:block">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Payment</p>
                      <span className={`text-[10px] font-black uppercase ${order.isPaid ? 'text-emerald-500' : 'text-amber-500'}`}>{order.isPaid ? '✓ Paid' : '○ Pending'}</span>
                    </div>
                  </div>
                  <p className="text-xl font-black">{order.totalAmount} UAH</p>
                </div>
                <div className="p-8">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-6 mb-4 last:mb-0">
                      <div className="relative w-16 h-20 rounded-xl overflow-hidden bg-gray-50 border">
                        <Image src={item.product?.images[0] || "/placeholder.png"} alt="" fill className="object-cover" />
                      </div>
                      <div>
                        <h4 className="font-black text-sm uppercase">{item.name}</h4>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Qty: {item.quantity} • {item.price} UAH</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}