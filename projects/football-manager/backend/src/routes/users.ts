import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../index';
import { AuthRequest } from '../middleware/auth';

const router = Router();

// 获取当前用户
router.get('/me', async (req: AuthRequest, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: { id: true, username: true, name: true, phone: true, role: true, balance: true }
  });
  res.json(user);
});

// 获取所有成员 - 只有管理员可以访问所有成员，非管理员只能查看自己
router.get('/', async (req: AuthRequest, res) => {
  // 非管理员只能查看自己
  if (req.user!.role !== 'ADMIN') {
    const currentUser = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { id: true, username: true, name: true, phone: true, role: true, status: true, balance: true, createdAt: true }
    });
    return res.json(currentUser ? [currentUser] : []);
  }
  
  // 管理员可以查看所有成员
  const users = await prisma.user.findMany({
    select: { id: true, username: true, name: true, phone: true, role: true, status: true, balance: true, createdAt: true },
    orderBy: { createdAt: 'desc' }
  });
  res.json(users);
});

// 创建成员
router.post('/', async (req, res) => {
  const { username, password, name, phone, role, initialBalance } = req.body;
  const user = await prisma.user.create({
    data: { username, password: bcrypt.hashSync(password, 10), name, phone, role: role || 'MEMBER', balance: initialBalance || 0 }
  });
  res.status(201).json(user);
});

// 调整余额 - 仅管理员可操作
router.post('/:id/balance', async (req: AuthRequest, res) => {
  if (req.user!.role !== 'ADMIN') return res.status(403).json({ error: '需要管理员权限' });
  const { id } = req.params;
  const { amount, reason } = req.body;
  
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return res.status(404).json({ error: '用户不存在' });
  
  const newBalance = user.balance + amount;
  await prisma.user.update({ where: { id }, data: { balance: newBalance } });
  
  const tx = await prisma.transaction.create({
    data: { type: amount >= 0 ? 'DEPOSIT' : 'ADJUST', amount, userId: id, description: reason, operatorId: req.user!.id }
  });
  
  res.json({ oldBalance: user.balance, newBalance, transactionId: tx.id });
});

// 更新成员
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, username, phone, role, status, password } = req.body;
  
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return res.status(404).json({ error: '用户不存在' });
  
  const updateData: any = { name, role, status };
  
  // 允许更新用户名
  if (username) {
    updateData.username = username;
  }
  
  // 允许 phone 为空字符串或 null
  if (phone === '' || phone === null) {
    updateData.phone = null;
  } else if (phone) {
    updateData.phone = phone;
  }
  
  // 如果提供了密码则更新
  if (password) {
    updateData.password = bcrypt.hashSync(password, 10);
  }
  
  const updated = await prisma.user.update({
    where: { id },
    data: updateData,
    select: { id: true, username: true, name: true, phone: true, role: true, status: true, balance: true }
  });
  
  res.json(updated);
});

export { router as usersRouter };
