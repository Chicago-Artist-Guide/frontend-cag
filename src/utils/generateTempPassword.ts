/**
 * Generate a random temporary password
 *
 * Uses a character set that avoids ambiguous characters (0/O, 1/l/I)
 * for easier reading and transcription.
 */
export const generateTempPassword = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

export default generateTempPassword;
