export const isValidPhone = (p: string) => /^\+?\d{10,13}$/.test(p.replace(/\s/g,''));
export const isValidOtp = (o: string) => /^\d{4,6}$/.test(o);
