import prisma from "@/utils/prisma";

const appUninstallHandler = async (
  topic: string,
  shop: string,
  webhookRequestBody: string
) => {
  try {
    const webhookBody = JSON.parse(webhookRequestBody);
    await prisma.session.deleteMany({ where: { shop } });
    await prisma.active_stores.upsert({
      where: { shop: shop },
      update: { isActive: false },
      create: { shop: shop, isActive: false },
    });
  } catch (e) {
    console.log(e);
  }
};

export default appUninstallHandler;
