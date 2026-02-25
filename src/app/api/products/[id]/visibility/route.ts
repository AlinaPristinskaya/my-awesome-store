import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (session?.user?.email !== "pristinskayaalina9@gmail.com") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = await params;
    const { isHidden } = await req.json();

    const product = await prisma.product.update({
      where: { id },
      data: { isHidden }
    });

    // Оновлюємо кеш всюди
    revalidatePath("/");
    revalidatePath("/admin/products");

    return NextResponse.json(product);
  } catch (error: any) {
    return new NextResponse("Error", { status: 500 });
  }
}