import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log("Починаємо повне очищення...");
  
  // Спочатку видаляємо залежності
  await prisma.cartItem.deleteMany({});
  await prisma.orderItem.deleteMany({});
  
  // Тепер видаляємо самі товари
  await prisma.product.deleteMany({});
  
  // Категорії можна лишити, або теж видалити, якщо хочеш повний "reset"
  // await prisma.category.deleteMany({}); 

  console.log("✅ База товарів та кошиків повністю очищена!");
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());