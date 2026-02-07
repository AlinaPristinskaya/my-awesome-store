"use server";

import { XMLParser } from "fast-xml-parser";
import { prisma } from "@/lib/prisma";

function createSlug(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w\u0400-\u04FF]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function syncProductsFromXML() {
  const XML_URL = "https://chepuruxa20.salesdrive.me/export/yml/export.yml?publicKey=MqCSb6FMuRRTL6pBBUQcXn6wiDhhWMCShL1OX1jFCyFxmnuQeCEM8kHQN"; 

  try {
    const response = await fetch(XML_URL);
    if (!response.ok) throw new Error(`Помилка завантаження XML: ${response.statusText}`);
    
    const xmlData = await response.text();
    // ignoreAttributes: false дозволяє бачити id та parentId
    const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "" });
    const jsonObj = parser.parse(xmlData);
    const shop = jsonObj.yml_catalog?.shop || jsonObj.shop;
    
    if (!shop) throw new Error("Не вдалося знайти блок <shop> у XML.");

    const rawCategories = shop.categories?.category || [];
    const rawOffers = shop.offers?.offer || [];
    const categoriesArray = Array.isArray(rawCategories) ? rawCategories : [rawCategories];
    const offersArray = Array.isArray(rawOffers) ? rawOffers : [rawOffers];

    // 1. СИНХРОНІЗАЦІЯ КАТЕГОРІЙ
    for (const cat of categoriesArray) {
      const name = String(cat["#text"] || "Без назви");
      const idStr = String(cat.id);
      // Отримуємо parentId з атрибутів
      const parentIdStr = cat.parentId ? String(cat.parentId) : null;
      const slug = `${createSlug(name)}-${idStr}`;

      await prisma.category.upsert({
        where: { id: idStr },
        update: { 
          name, 
          slug,
          parentId: parentIdStr // Оновлюємо зв'язок з батьком
        },
        create: { 
          id: idStr, 
          name, 
          slug,
          parentId: parentIdStr // Створюємо зв'язок з батьком
        },
      });
    }

    // 2. СИНХРОНІЗАЦІЯ ТОВАРІВ
    for (const item of offersArray) {
      const idStr = String(item.id);
      
      let imagesArray: string[] = [];
      if (Array.isArray(item.picture)) {
        imagesArray = item.picture.map((p: any) => String(p));
      } else if (item.picture) {
        imagesArray = [String(item.picture)];
      }

      const externalVideo = item.video || item.videoLink || item.youtube || null;

      await prisma.product.upsert({
        where: { id: idStr },
        update: {
          name: String(item.name || "Без назви"),
          description: String(item.description || ""),
          price: parseFloat(item.price) || 0,
          images: imagesArray,
          stock: (item.available === "true" || item.available === true) ? 99 : 0,
          categoryId: String(item.categoryId),
          ...(externalVideo ? { videoUrl: String(externalVideo) } : {}),
        },
        create: {
          id: idStr,
          name: String(item.name || "Без назви"),
          description: String(item.description || ""),
          price: parseFloat(item.price) || 0,
          images: imagesArray,
          videoUrl: externalVideo ? String(externalVideo) : null,
          stock: (item.available === "true" || item.available === true) ? 99 : 0,
          categoryId: String(item.categoryId),
        },
      });
    }

    return { success: true, count: offersArray.length };
  } catch (error) {
    console.error("Sync Error:", error);
    return { success: false, error: String(error) };
  }
}