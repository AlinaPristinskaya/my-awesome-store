"use server";

"use server";

export async function sendOrderToSalesDrive(orderData: any) {
  const API_KEY = process.env.SALESDRIVE_API_KEY;
  const CRM_DOMAIN = "chepuruxa20.salesdrive.me"; 
  const URL = `https://${CRM_DOMAIN}/handler/`;

  // Готуємо зрозумілий текст для коментаря
  const paymentText = orderData.paymentMethod === 'WAYFORPAY' ? '💳 Картка' : '💵 Післяплата';
  
  const payload = {
    form: API_KEY,
    getResultData: "1",
    
    // Беремо окремі поля, які прийшли з форми
    fName: orderData.firstName || "", 
    lName: orderData.lastName || "",
    phone: orderData.phone,
    email: orderData.customerEmail || "", 
    
    products: orderData.items.map((item: any) => ({
      id: item.id,
      name: item.name,
      costPerItem: item.price,
      amount: item.quantity,
    })),
    
    // Робимо коментар таким же повним, як у Telegram
    comment: `
📍 Доставка: ${orderData.customerAddress || "Не вказано"}
💳 Оплата: ${paymentText}
📧 Email: ${orderData.customerEmail || "Не вказано"}
    `.trim(),
  };

  try {
    const response = await fetch(URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    return { success: true, data: result };
  } catch (error) {
    console.error("❌ SalesDrive Error:", error);
    return { success: false, error: "Не вдалося відправити замовлення" };
  }
}