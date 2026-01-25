import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seeding...');

  // 1. Очищаем старые данные (порядок важен из-за связей)
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});

  // 2. Создаем категории
  const catStyle = await prisma.category.create({ 
    data: { name: 'Style', slug: 'style' } 
  });
  const catTech = await prisma.category.create({ 
    data: { name: 'Tech', slug: 'tech' } 
  });

  // 3. Список из 6 качественных товаров
 const products = [
    { 
      name: 'Premium Headphones', 
      price: 299, 
      catId: catTech.id, 
      img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80' 
    },
    { 
      name: 'Mechanical Keyboard', 
      price: 159, 
      catId: catTech.id, 
      img: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&w=800&q=80' 
    },
    { 
      name: 'Smart Watch', 
      price: 399, 
      catId: catTech.id, 
      img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80' 
    },
    { 
      name: 'White Tee', 
      price: 35, 
      catId: catStyle.id, 
      img: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80' 
    },
    { 
      name: 'Leather Boots', 
      price: 180, 
      catId: catStyle.id, 
      img: 'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?auto=format&fit=crop&w=800&q=80' 
    },
    { 
      name: 'Minimalist Backpack', 
      price: 95, 
      catId: catStyle.id, 
      img: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80' 
    },
  ];

  // 4. Добавляем товары в базу
  for (const p of products) {
    await prisma.product.create({
      data: {
        name: p.name,
        description: 'Modern design meets high-quality materials. Perfect for your daily routine.',
        price: p.price,
        images: [p.img], // Prisma ожидает массив строк
        categoryId: p.catId,
      },
    });
  }

  console.log('✅ Seed finished: 2 categories and 6 products created!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Error during seeding:', e);
    await prisma.$disconnect();
    process.exit(1);
  });