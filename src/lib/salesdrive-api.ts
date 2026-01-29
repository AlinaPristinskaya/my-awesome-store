"use server";

export async function sendOrderToSalesDrive(orderData: any) {
  const API_KEY = process.env.SALESDRIVE_API_KEY;
  const CRM_DOMAIN = "chepuruxa20.salesdrive.me"; // Заміни на своє
  const URL = `https://${CRM_DOMAIN}/handler/`;

  const payload = {
    form: API_KEY, // SalesDrive використовує ключ у полі form
    getResultData: "1", // Щоб отримати ID замовлення у відповідь
    fName: orderData.firstName,
    lName: orderData.lastName,
    phone: orderData.phone,
    products: orderData.items.map((item: any) => ({
      id: item.id,
      name: item.name,
      costPerItem: item.price,
      amount: item.quantity,
    })),
    comment: "Замовлення з сайту Next.js",
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
    console.error("SalesDrive Error:", error);
    return { success: false, error: "Не вдалося відправити замовлення" };
  }
}