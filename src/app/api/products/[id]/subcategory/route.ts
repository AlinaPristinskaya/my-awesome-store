import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const userEmail = session?.user?.email;
    const isAdmin = userEmail === "pristinskayaalina9@gmail.com";

    if (!isAdmin) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // 1. Отримуємо id з параметрів (Next 15 потребує await)
    const { id } = await params; 
    
    // 2. Отримуємо дані з тіла запиту
    const body = await req.json();
    const { subCategoryId } = body;

    console.log("LOG: Оновлюємо товар ID:", id, "на підкатегорію:", subCategoryId);

    // 3. Оновлення в базі через Prisma
    const updatedProduct = await prisma.product.update({
      where: { 
        id: id 
      },
      data: { 
        subCategoryId: subCategoryId || null 
      }
    });

    return NextResponse.json(updatedProduct);
  } catch (error: any) {
    console.error("DATABASE UPDATE ERROR:", error);
    return new NextResponse(
      JSON.stringify({ 
        error: "Internal Server Error", 
        message: error.message 
      }), 
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
}