import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()

  const catGadgets = await prisma.category.create({ data: { name: 'Gadgets' } })
  const catHome = await prisma.category.create({ data: { name: 'Home' } })
  const catStyle = await prisma.category.create({ data: { name: 'Style' } })

  const products = [
    {
      name: 'Smart Watch S-Series',
      description: 'Stainless steel case with 48h battery life.',
      price: 24900,
      images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800'],
      categoryId: catGadgets.id
    },
    {
      name: 'Mechanical Keyboard',
      description: 'Tactile switches and RGB backlight for perfect typing.',
      price: 12500,
      images: ['https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=800'],
      categoryId: catGadgets.id
    },
    {
      name: 'Wireless Desk Lamp',
      description: 'Soft warm light with touch control.',
      price: 4200,
      images: ['https://images.unsplash.com/photo-1534073828943-f801091bb18c?w=800'],
      categoryId: catHome.id
    },
    {
      name: 'Minimalist Backpack',
      description: 'Waterproof fabric, fits 16-inch laptop.',
      price: 8900,
      images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800'],
      categoryId: catStyle.id
    }
  ]

  for (const product of products) {
    await prisma.product.create({ data: product })
  }
  console.log('Database seeded with English content!')
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect())