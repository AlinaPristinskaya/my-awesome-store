import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    // Проверка прав (замени email на свой, если нужно)
    if (session?.user?.email !== "pristinskayaalina9@gmail.com") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { isHidden } = body;

    const updatedProduct = await prisma.product.update({
      where: { id: id },
      data: { isHidden: isHidden }
    });

    return NextResponse.json(updatedProduct);
  } catch (error: any) {
    return new NextResponse(error.message, { status: 500 });
  }
}