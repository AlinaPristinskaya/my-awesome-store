"use server";

import { XMLParser } from "fast-xml-parser";
import { prisma } from "@/lib/prisma";
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function createSlug(text: string) {
  return text.toLowerCase().replace(/[^\w\u0400-\u04FF]+/g, "-").replace(/^-+|-+$/g, "");
}

const getCleanVideoName = (sku: string | null) => {
  if (!sku) return null;
  return sku.replace(/[\/\\*\s]/g, "-").toLowerCase();
};

export async function syncProductsFromXML() {
  const XML_URL = "https://chepuruxa20.salesdrive.me/export/yml/export.yml?publicKey=MqCSb6FMuRRTL6pBBUQcXn6wiDhhWMCShL1OX1jFCyFxmnuQeCEM8kHQN"; 

  try {
    // Змінні для звіту
    let newProductsCount = 0;
    let updatedProductsCount = 0;
    let newCategoriesNames: string[] = [];
    
    let allVideos: { public_id: string; secure_url: string }[] = [];
    try {
      const result = await cloudinary.api.resources({ resource_type: 'video', type: 'upload', max_results: 500 });
      allVideos = result.resources.map((r: any) => ({ public_id: r.public_id, secure_url: r.secure_url }));
    } catch (e) { console.error("Cloudinary error:", e); }

    const response = await fetch(XML_URL);
    const xmlData = await response.text();
    const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "" });
    const jsonObj = parser.parse(xmlData);
    const shop = jsonObj.yml_catalog?.shop || jsonObj.shop;
    
    const rawCategories = shop.categories?.category || [];
    const rawOffers = shop.offers?.offer || [];
    const categoriesArray = Array.isArray(rawCategories) ? rawCategories : [rawCategories];
    const offersArray = Array.isArray(rawOffers) ? rawOffers : [rawOffers];

    // 1. СИНХРОНІЗАЦІЯ КАТЕГОРІЙ (З ЗАХИСТОМ НАЗВИ)
    const subCategoryIds = new Set<string>();

    for (const cat of categoriesArray) {
      const name = String(cat["#text"] || "Без назви");
      const idStr = String(cat.id);
      const parentIdStr = cat.parentId ? String(cat.parentId) : null;
      const slug = `${createSlug(name)}-${idStr}`;

      // Оновлюємо головну категорію
      await prisma.category.upsert({
        where: { id: idStr },
        update: { slug, parentId: parentIdStr }, // НЕ оновлюємо name
        create: { id: idStr, name, slug, parentId: parentIdStr },
      });

      if (parentIdStr) {
        // Перевіряємо, чи існує підкатегорія вже в базі
        const existingSub = await prisma.subCategory.findUnique({ where: { id: idStr } });
        if (!existingSub) {
          newCategoriesNames.push(name);
        }

        await prisma.subCategory.upsert({
          where: { id: idStr },
          update: { 
            slug, 
            categoryId: parentIdStr 
            // name тут ВІДСУТНІЙ, щоб не затерти твої зміни в адмінці!
          },
          create: { id: idStr, name, slug, categoryId: parentIdStr },
        });
        subCategoryIds.add(idStr);
      }
    }

    // 2. СИНХРОНІЗАЦІЯ ТОВАРІВ
    for (const item of offersArray) {
      const idStr = String(item.id);
      const catIdStr = String(item.categoryId);
      const validSubId = subCategoryIds.has(catIdStr) ? catIdStr : null;

      const vendorCode = item.vendorCode ? String(item.vendorCode) : null;
      const cleanSkuForVideo = getCleanVideoName(vendorCode);
      const matchedVideo = allVideos.find(v => v.public_id.split('/').pop()?.toLowerCase() === cleanSkuForVideo);
      let imagesArray = Array.isArray(item.picture) ? item.picture.map((p: any) => String(p)) : (item.picture ? [String(item.picture)] : []);

      // Перевіряємо чи товар новий
      const existingProduct = await prisma.product.findUnique({ where: { id: idStr } });
      if (existingProduct) {
        updatedProductsCount++;
      } else {
        newProductsCount++;
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
          categoryId: catIdStr,
          subCategoryId: validSubId,
          ...(matchedVideo ? { videoUrl: matchedVideo.secure_url } : {}),
          // isHidden не чіпаємо при оновленні, щоб не скинути твій "ігнор"
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
          categoryId: catIdStr,
          subCategoryId: validSubId,
          isHidden: false, // Нові товари за замовчуванням видимі
        },
      });
    }

    // Формуємо текстовий звіт
    let reportMessage = `Синхронізація завершена!\n`;
    reportMessage += `📦 Нових товарів: ${newProductsCount}\n`;
    reportMessage += `🔄 Оновлено товарів: ${updatedProductsCount}\n`;
    
    if (newCategoriesNames.length > 0) {
      reportMessage += `🆕 Додано нові категорії з CRM: ${newCategoriesNames.join(", ")}`;
    } else {
      reportMessage += `✅ Структура категорій без змін.`;
    }

    return { 
      success: true, 
      message: reportMessage,
      details: {
        newProducts: newProductsCount,
        updated: updatedProductsCount,
        newCats: newCategoriesNames
      }
    };
  } catch (error: any) {
    console.error("Sync Error:", error);
    return { success: false, error: error.message };
  }
}