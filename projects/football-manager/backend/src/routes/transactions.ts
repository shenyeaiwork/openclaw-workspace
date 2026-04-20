import { Router } from 'express';
import { prisma } from '../index';
import { AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', async (req: AuthRequest, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const type = req.query.type as string;
  const userId = req.user!.id;
  const isAdmin = req.user!.role === 'ADMIN';
  
  // 管理员查看所有，非管理员只查看自己的
  const where: any = isAdmin ? {} : { userId };
  if (type && type !== 'ALL') {
    where.type = type;
  }
  
  const [txs, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { id: true, name: true } }, guest: { select: { id: true, name: true } } }
    }),
    prisma.transaction.count({ where })
  ]);
  
  res.json({ data: txs, total, page, limit, pages: Math.ceil(total / limit) });
});

router.post('/deposit', async (req: AuthRequest, res) => {
  if (req.user!.role !== 'ADMIN') return res.status(403).json({ error: '需要管理员权限' });
  const { userId, guestId, amount, description } = req.body;
  const tx = await prisma.transaction.create({
    data: { type: 'DEPOSIT', amount, userId, guestId, description, operatorId: req.user!.id }
  });
  if (userId) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user) await prisma.user.update({ where: { id: userId }, data: { balance: user.balance + amount } });
  }
  res.status(201).json(tx);
});

router.post('/:id/reverse', async (req: AuthRequest, res) => {
  if (req.user!.role !== 'ADMIN') return res.status(403).json({ error: '需要管理员权限' });
  const { id } = req.params;
  const { reason } = req.body;
  
  const tx = await prisma.transaction.findUnique({ where: { id } });
  if (!tx) return res.status(404).json({ error: '交易不存在' });
  
  // 撤回
  const reverse = await prisma.transaction.create({
    data: { type: 'REVERSE', amount: -tx.amount, userId: tx.userId, guestId: tx.guestId, description: reason, operatorId: 'admin' }
  });
  await prisma.transaction.update({ where: { id }, data: { status: 'REVERSED' } });
  
  // 恢复余额
  if (tx.userId) {
    const user = await prisma.user.findUnique({ where: { id: tx.userId } });
    if (user) await prisma.user.update({ where: { id: tx.userId }, data: { balance: user.balance - tx.amount } });
  }
  
  res.json({ message: '已撤回', reverse });
});

export { router as transactionsRouter };
