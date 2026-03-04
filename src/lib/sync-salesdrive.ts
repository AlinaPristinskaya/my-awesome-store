import { prisma } from "@/lib/prisma";
import { XMLParser } from "fast-xml-parser";

// Функція для створення Slug (людинозрозумілих посилань)
const createSlug = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\u0400-\u04FF]+/g, "-") // Замінює символи на дефіси, підтримує кирилицю
    .replace(/^-+|-+$/g, "");             // Видаляє дефіси на початку та в кінці
};

export async function syncProductsFromXML() {
  const XML_URL = "https://chepuruxa20.salesdrive.me/export/yml/export.yml?publicKey=MqCSb6FMuRRTL6pBBUQcXn6wiDhhWMCShL1OX1jFCyFxmnuQeCEM8kHQN"; 

  try {
    console.log("--- 🚀 СТАРТ ПОВНОЇ РОЗУМНОЇ СИНХРОНІЗАЦІЇ ---");
    
    const response = await fetch(XML_URL);
    if (!response.ok) throw new Error("Помилка завантаження XML");
    const xmlData = await response.text();
    
    const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "" });
    const jsonObj = parser.parse(xmlData);
    const shop = jsonObj.yml_catalog?.shop || jsonObj.shop;
    
    const categoriesArray = Array.isArray(shop.categories?.category) ? shop.categories.category : [shop.categories?.category];
    const offersArray = Array.isArray(shop.offers?.offer) ? shop.offers.offer : [shop.offers?.offer];

    // --- КРОК 1: ТАБЛИЦЯ Category (CRM Ієрархія для логіки) ---
    console.log("📂 Етап 1: Оновлення ієрархії Category...");
    for (const cat of categoriesArray) {
      const idStr = String(cat.id);
      const name = String(cat["#text"] || "").trim();
      const slug = `${createSlug(name)}-${idStr}`;

      await prisma.category.upsert({
        where: { id: idStr },
        update: { name, slug },
        create: { id: idStr, name, slug }
      });
    }

    // Проставляємо parentId окремим циклом, щоб усі ID вже існували
    for (const cat of categoriesArray) {
      await prisma.category.update({
        where: { id: String(cat.id) },
        data: { parentId: cat.parentId ? String(cat.parentId) : null }
      });
    }

    // --- КРОК 2: ТАБЛИЦЯ subCategory (Фронтенд + Твої назви) ---
    console.log("🎨 Етап 2: Синхронізація підкатегорій для фронтенду...");
    const crmSubCats = categoriesArray.filter((c: any) => c.parentId);

    for (const cat of crmSubCats) {
      const idStr = String(cat.id);
      const nameFromCRM = String(cat["#text"] || "").trim();
      const slug = `${createSlug(nameFromCRM)}-${idStr}`;

      // Перевіряємо, чи вже є така підкатегорія в таблиці subCategory
      const existing = await prisma.subCategory.findUnique({ where: { id: idStr } });

      if (!existing) {
        console.log(`✨ Створюємо нову підкатегорію для фронту: ${nameFromCRM}`);
        await prisma.subCategory.create({
          data: {
            id: idStr,
            name: nameFromCRM,
            slug: slug, // Тепер slug передається обов'язково
            categoryId: String(cat.parentId)
          }
        });
      }
      // Якщо підкатегорія вже є — ми її НЕ чіпаємо, щоб зберегти твої ручні зміни назви
    }

    // --- КРОК 3: ТОВАРИ ---
    console.log("📦 Етап 3: Оновлення товарів...");
    let updatedCount = 0;

    for (const item of offersArray) {
      const idStr = String(item.id);
      const catId = String(item.categoryId);

      // Отримуємо інформацію про категорію з бази, щоб знати, чи є вона підкатегорією
      const catInfo = await prisma.category.findUnique({ where: { id: catId } });
      
      const productData = {
        sku: String(item.vendorCode || ""),
        name: String(item.name_ua || item.name || "").trim(),
        description: String(item.description_ua || item.description || "").trim(),
        price: parseFloat(item.price) || 0,
        categoryId: catId,
        // Якщо категорія в CRM має батька, записуємо її ID як subCategoryId для сумісності з твоїм фронтендом
        subCategoryId: catInfo?.parentId ? catId : null, 
        stock: (item.available === "true" || item.available === true) ? 99 : 0,
        images: Array.isArray(item.picture) ? item.picture.map(String) : (item.picture ? [String(item.picture)] : []),
      };

      await prisma.product.upsert({
        where: { id: idStr },
        update: productData,
        create: { ...productData, id: idStr, isHidden: false }
      });
      updatedCount++;
    }

    return { 
      success: true, 
      message: "Синхронізація виконана успішно",
      details: { updated: updatedCount, totalCats: categoriesArray.length }
    };

  } catch (error: any) {
    console.error("❌ ПОМИЛКА СИНХРОНІЗАЦІЇ:", error.message);
    return { success: false, error: error.message };
  }
}