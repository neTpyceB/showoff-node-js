import jwt from 'jsonwebtoken';

export function issueToken(user, secret) {
  return jwt.sign({ role: user.role }, secret, {
    expiresIn: '1h',
    subject: String(user.id)
  });
}

export function verifyToken(token, secret) {
  return jwt.verify(token, secret);
}
