"use server";

import { XMLParser } from "fast-xml-parser";
import { prisma } from "@/lib/prisma";
import { v2 as cloudinary } from 'cloudinary';

// Конфігурація Cloudinary (використовуємо змінні середовища)
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Допоміжні функції
function createSlug(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w\u0400-\u04FF]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const getCleanVideoName = (sku: string | null) => {
  if (!sku) return null;
  // Замінюємо / \ * та пробіли на дефіс, робимо малі літери
  return sku.replace(/[\/\\*\s]/g, "-").toLowerCase();
};

export async function syncProductsFromXML() {
  const XML_URL = "https://chepuruxa20.salesdrive.me/export/yml/export.yml?publicKey=MqCSb6FMuRRTL6pBBUQcXn6wiDhhWMCShL1OX1jFCyFxmnuQeCEM8kHQN"; 

  try {
    // 1. ОТРИМУЄМО СПИСОК ВІДЕО З CLOUDINARY
    let allVideos: { public_id: string; secure_url: string }[] = [];
    try {
      const result = await cloudinary.api.resources({ 
        resource_type: 'video', 
        type: 'upload', 
        max_results: 500 
      });
      allVideos = result.resources.map((r: any) => ({ 
        public_id: r.public_id, 
        secure_url: r.secure_url 
      }));
    } catch (e) {
      console.error("Cloudinary fetch error during sync:", e);
    }

    // 2. ЗАВАНТАЖУЄМО XML
    const response = await fetch(XML_URL);
    if (!response.ok) throw new Error(`Помилка завантаження XML: ${response.statusText}`);
    
    const xmlData = await response.text();
    const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "" });
    const jsonObj = parser.parse(xmlData);
    const shop = jsonObj.yml_catalog?.shop || jsonObj.shop;
    
    if (!shop) throw new Error("Не вдалося знайти блок <shop> у XML.");

    const rawCategories = shop.categories?.category || [];
    const rawOffers = shop.offers?.offer || [];
    const categoriesArray = Array.isArray(rawCategories) ? rawCategories : [rawCategories];
    const offersArray = Array.isArray(rawOffers) ? rawOffers : [rawOffers];

    // 3. СИНХРОНІЗАЦІЯ КАТЕГОРІЙ
    for (const cat of categoriesArray) {
      const name = String(cat["#text"] || "Без назви");
      const idStr = String(cat.id);
      const parentIdStr = cat.parentId ? String(cat.parentId) : null;
      const slug = `${createSlug(name)}-${idStr}`;

      await prisma.category.upsert({
        where: { id: idStr },
        update: { name, slug, parentId: parentIdStr },
        create: { id: idStr, name, slug, parentId: parentIdStr },
      });
    }

    // 4. СИНХРОНІЗАЦІЯ ТОВАРІВ + АВТОПРИВ'ЯЗКА ВІДЕО
    for (const item of offersArray) {
      const idStr = String(item.id);
      const vendorCode = item.vendorCode ? String(item.vendorCode) : null;
      const cleanSkuForVideo = getCleanVideoName(vendorCode);
      
      // Пошук відео в списку Cloudinary
      const matchedVideo = allVideos.find(v => {
        const fileNameOnly = v.public_id.split('/').pop()?.toLowerCase();
        return fileNameOnly === cleanSkuForVideo;
      });

      let imagesArray: string[] = [];
      if (Array.isArray(item.picture)) {
        imagesArray = item.picture.map((p: any) => String(p));
      } else if (item.picture) {
        imagesArray = [String(item.picture)];
      }

      await prisma.product.upsert({
        where: { id: idStr },
        update: {
          sku: vendorCode,
          name: String(item.name || "Без назви"),
          description: String(item.description || ""),
          price: parseFloat(item.price) || 0,
          images: imagesArray,
          stock: (item.available === "true" || item.available === true) ? 99 : 0,
          categoryId: String(item.categoryId),
          // АВТОПРИВ'ЯЗКА: Якщо відео знайдено за артикулом, оновлюємо посилання
          ...(matchedVideo ? { videoUrl: matchedVideo.secure_url } : {}),
        },
        create: {
          id: idStr,
          sku: vendorCode,
          name: String(item.name || "Без назви"),
          description: String(item.description || ""),
          price: parseFloat(item.price) || 0,
          images: imagesArray,
          videoUrl: matchedVideo ? matchedVideo.secure_url : null,
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