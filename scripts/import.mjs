import { PrismaClient } from '@prisma/client';
import xlsx from 'xlsx';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  const filePath = path.resolve('products.xlsx'); 
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

  console.log(`Очищення та імпорт ${data.length} товарів...`);

  for (const item of data) {
    try {
      const name = item['Название(UA)'];
      if (!name) continue;

      const price = parseFloat(item['Цена']) || 0;
      const description = item['Описание товара(UA)'] || "";
      const categoryName = item['Раздел'] || "Різне";
      
      // МАГІЯ ТУТ: Розділяємо по ";" і беремо лише перше чисте посилання
      let imageUrl = "";
      if (item['Фото']) {
        const photos = item['Фото'].split(';'); // Розбиваємо список
        imageUrl = photos[0].trim(); // Беремо перше і чистимо пробіли
      }

      const category = await prisma.category.upsert({
        where: { name: categoryName },
        update: {},
        create: { 
          name: categoryName,
          slug: categoryName.toLowerCase().replace(/[^a-zа-я0-9]+/g, '-') 
        }
      });

      await prisma.product.create({
        data: {
          name,
          description,
          price,
          images: imageUrl ? [imageUrl] : [],
          stock: 5,
          categoryId: category.id,
          weight: 0.5, width: 10, height: 10, length: 10,
        }
      });

      console.log(`✅ Ready: ${name}`);
    } catch (error) {
      console.error(`❌ Error: ${item['Название(UA)']}`, error.message);
    }
  }
}

main().finally(() => prisma.$disconnect());