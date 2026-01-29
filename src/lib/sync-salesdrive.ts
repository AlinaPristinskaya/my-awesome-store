"use server"; // ДОДАЙ ЦЕЙ РЯДОК ПЕРШИМ

import { XMLParser } from "fast-xml-parser";
import { prisma } from "@/lib/prisma";


// Функція для створення чистих посилань (slug)
function createSlug(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w\u0400-\u04FF]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function syncProductsFromXML() {
  // ВСТАВ СВОЄ РЕАЛЬНЕ ПОСИЛАННЯ СЮДИ
  const XML_URL = "https://chepuruxa20.salesdrive.me/export/yml/export.yml?publicKey=MqCSb6FMuRRTL6pBBUQcXn6wiDhhWMCShL1OX1jFCyFxmnuQeCEM8kHQN"; 

  try {
    const response = await fetch(XML_URL);
    if (!response.ok) throw new Error(`Помилка завантаження: ${response.statusText}`);
    
    const xmlData = await response.text();

    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "",
    });
    
    const jsonObj = parser.parse(xmlData);
    
    // Гнучкий пошук блоку shop
    const shop = jsonObj.yml_catalog?.shop || jsonObj.shop;
    
    if (!shop) {
      throw new Error("Не вдалося знайти блок <shop> у XML. Перевірте структуру.");
    }

    const rawCategories = shop.categories?.category || [];
    const rawOffers = shop.offers?.offer || [];

    const categoriesArray = Array.isArray(rawCategories) ? rawCategories : [rawCategories];
    const offersArray = Array.isArray(rawOffers) ? rawOffers : [rawOffers];

    console.log(`Знайдено: категорій - ${categoriesArray.length}, товарів - ${offersArray.length}`);

    // 1. СИНХРОНІЗАЦІЯ КАТЕГОРІЙ
    // Сортуємо: спочатку головні категорії, потім підкатегорії
    const sortedCategories = [...categoriesArray].sort((a: any, b: any) => {
      if (!a.parentId && b.parentId) return -1;
      if (a.parentId && !b.parentId) return 1;
      return 0;
    });

    for (const cat of sortedCategories) {
      const name = String(cat["#text"] || "Без назви");
      const idStr = String(cat.id);
      const slug = `${createSlug(name)}-${idStr}`;

      await prisma.category.upsert({
        where: { id: idStr },
        update: { name, slug },
        create: { id: idStr, name, slug },
      });
    }

    // 2. СИНХРОНІЗАЦІЯ ТОВАРІВ
    for (const item of offersArray) {
      const idStr = String(item.id);
      
      // Обробка картинок: перетворюємо в масив string[] для Prisma
      let imagesArray: string[] = [];
      if (Array.isArray(item.picture)) {
        imagesArray = item.picture.map((p: any) => String(p));
      } else if (item.picture) {
        imagesArray = [String(item.picture)];
      }

      if (imagesArray.length === 0) {
        imagesArray = ["/placeholder-product.png"];
      }

      await prisma.product.upsert({
        where: { id: idStr },
        update: {
          name: String(item.name || "Без назви"),
          description: String(item.description || ""),
          price: parseFloat(item.price) || 0,
          images: imagesArray,
          stock: (item.available === "true" || item.available === true) ? 99 : 0,
          categoryId: String(item.categoryId),
        },
        create: {
          id: idStr,
          name: String(item.name || "Без назви"),
          description: String(item.description || ""),
          price: parseFloat(item.price) || 0,
          images: imagesArray,
          stock: (item.available === "true" || item.available === true) ? 99 : 0,
          categoryId: String(item.categoryId),
        },
      });
    }

    return { 
      success: true, 
      categories: categoriesArray.length, 
      products: offersArray.length 
    };

  } catch (error) {
    console.error("Деталі помилки:", error);
    return { success: false, error: String(error) };
  }
}