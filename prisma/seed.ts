import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database cleanup...');

  try {
    // 1. Очищаємо дані у ПРАВИЛЬНОМУ порядку (від залежних до головних)
    console.log('   - Cleaning Cart items...');
    await prisma.cartItem.deleteMany({});
    
    console.log('   - Cleaning Order items...');
    await prisma.orderItem.deleteMany({});
    
    console.log('   - Cleaning Carts and Orders...');
    await prisma.cart.deleteMany({});
    await prisma.order.deleteMany({});

    console.log('   - Cleaning Products...');
    await prisma.product.deleteMany({});

    console.log('   - Cleaning Categories...');
    await prisma.category.deleteMany({});

    console.log('🧹 Database is now CRYSTAL CLEAR!');
    console.log('🚀 You can now run your Excel import script.');

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    throw error;
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });