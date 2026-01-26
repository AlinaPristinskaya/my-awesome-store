import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Image from "next/image";
import { Package, Calendar, Tag, CreditCard } from "lucide-react";

// Функция для красивого отображения статусов
const getStatusStyles = (status: string) => {
  switch (status) {
    case "COMPLETED":
      return "bg-emerald-50 text-emerald-600 border-emerald-100";
    case "PROCESSING":
      return "bg-blue-50 text-blue-600 border-blue-100";
    case "CANCELLED":
      return "bg-rose-50 text-rose-600 border-rose-100";
    default: // PENDING
      return "bg-amber-50 text-amber-600 border-amber-100";
  }
};

export default async function OrdersPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/");
  }

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    include: {
      items: {
        include: { product: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-[#fafafa] p-6 md:p-12 text-black">
      <div className="max-w-5xl mx-auto">
        <header className="mb-12">
          <h1 className="text-5xl font-black tracking-tight mb-4">My Orders</h1>
          <p className="text-gray-500 font-medium">
            Check the status of your recent orders and manage returns.
          </p>
        </header>

        {orders.length === 0 ? (
          <div className="bg-white p-20 rounded-[2.5rem] shadow-sm text-center border border-gray-100">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="w-10 h-10 text-gray-300" />
            </div>
            <h2 className="text-2xl font-bold mb-2">No orders found</h2>
            <p className="text-gray-400 mb-8">Ready to start shopping?</p>
            <a href="/" className="inline-block bg-black text-white px-8 py-3 rounded-2xl font-bold hover:scale-105 transition-all">
              Browse Catalog
            </a>
          </div>
        ) : (
          <div className="grid gap-8">
            {orders.map((order) => (
              <div 
                key={order.id} 
                className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300"
              >
                {/* Header Section */}
                <div className="p-8 border-b border-gray-50 bg-gray-50/30 grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div>
                    <div className="flex items-center gap-2 text-gray-400 mb-1">
                      <Tag className="w-3 h-3" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Order ID</span>
                    </div>
                    <p className="font-mono text-sm font-bold">#{order.id.slice(-8).toUpperCase()}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-gray-400 mb-1">
                      <Calendar className="w-3 h-3" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Date Placed</span>
                    </div>
                    <p className="text-sm font-bold">{new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-gray-400 mb-1">
                      <CreditCard className="w-3 h-3" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Total Amount</span>
                    </div>
                    <p className="text-sm font-black text-indigo-600">${order.totalAmount.toLocaleString()}</p>
                  </div>
                  <div className="flex flex-col items-start md:items-end">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase border ${getStatusStyles(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                </div>

                {/* Items Section */}
                <div className="p-8">
                  <div className="space-y-6">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center gap-6 group">
                        <div className="relative w-20 h-24 rounded-2xl overflow-hidden bg-gray-100 shrink-0 border border-gray-50">
                          <Image
                            src={item.product?.images[0] || "/placeholder.png"}
                            alt={item.name}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-lg leading-tight mb-1">{item.name}</h3>
                          <p className="text-gray-400 text-sm mb-2 uppercase tracking-tighter font-medium">Qty: {item.quantity}</p>
                          <p className="font-black text-gray-900">${item.price.toLocaleString()}</p>
                        </div>
                        <div className="hidden sm:block">
                           <button className="text-xs font-bold text-indigo-600 hover:underline">View Product</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer Section */}
                <div className="px-8 py-4 bg-gray-50/50 flex justify-between items-center">
                  <p className="text-[10px] text-gray-400 font-medium">Shipping to: <span className="text-gray-900 font-bold">{order.customerAddress}</span></p>
                  <button className="text-xs font-black uppercase tracking-widest hover:text-indigo-600 transition">Need help?</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}