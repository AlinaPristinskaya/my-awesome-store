import crypto from 'crypto';

export const generateWayForPaySignature = (data: any[], key: string) => {
  // WayForPay вимагає склеювання полів через ";"
  const baseString = data.join(';');
  return crypto.createHmac('md5', key).update(baseString).digest('hex');
};

export const WAYFORPAY_CONFIG = {
  merchantAccount: process.env.WAYFORPAY_MERCHANT_LOGIN as string, // ваш логін
  merchantSecretKey: process.env.WAYFORPAY_SECRET_KEY as string,   // ваш ключ
  merchantDomainName: process.env.NEXT_PUBLIC_SITE_URL as string,  // ваш url
  serviceUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/api/callback/wayforpay`,
};