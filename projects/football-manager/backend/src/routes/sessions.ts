import { Router } from 'express';
import { prisma } from '../index';
import { AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', async (req, res) => {
  const sessions = await prisma.session.findMany({
    include: { attendances: { include: { user: true, guest: true } } },
    orderBy: { startTime: 'desc' }
  });
  // 添加人数统计
  const sessionsWithCount = sessions.map(s => ({
    ...s,
    memberCount: s.attendances.filter((a: any) => a.userId).length,
    guestCount: s.attendances.filter((a: any) => a.guestId).length
  }));
  res.json(sessionsWithCount);
});

router.get('/:id', async (req, res) => {
  const session = await prisma.session.findUnique({
    where: { id: req.params.id },
    include: { attendances: { include: { user: true, guest: true } } }
  });
  if (!session) return res.status(404).json({ error: '场次不存在' });
  // 添加人数统计
  const sessionWithCount = {
    ...session,
    memberCount: session.attendances.filter((a: any) => a.userId).length,
    guestCount: session.attendances.filter((a: any) => a.guestId).length
  };
  res.json(sessionWithCount);
});

router.post('/', async (req, res) => {
  const { title, location, startTime, endTime, totalCost, userIds, guestIds, guests } = req.body;
  
  const session = await prisma.session.create({
    data: {
      title,
      location,
      startTime: new Date(startTime),
      endTime: endTime ? new Date(endTime) : null,
      totalCost: totalCost || 0
    }
  });

  if (userIds && userIds.length > 0) {
    await prisma.attendance.createMany({
      data: userIds.map((userId: string) => ({
        sessionId: session.id,
        userId,
        status: 'CONFIRMED'
      }))
    });
  }

  if (guestIds && guestIds.length > 0) {
    await prisma.attendance.createMany({
      data: guestIds.map((guestId: string) => ({
        sessionId: session.id,
        guestId,
        status: 'CONFIRMED'
      }))
    });
  }

  if (guests && guests.length > 0) {
    for (const g of guests) {
      const guest = await prisma.guest.create({
        data: { name: g.name, category: g.category || '临时' }
      });
      await prisma.attendance.create({
        data: {
          sessionId: session.id,
          guestId: guest.id,
          guestName: g.name,
          customCost: g.customCost ? g.customCost * 100 : null,
          status: 'CONFIRMED'
        }
      });
    }
  }

  const result = await prisma.session.findUnique({
    where: { id: session.id },
    include: { attendances: { include: { user: true, guest: true } } }
  });
  
  res.status(201).json(result);
});

router.put('/:id', async (req, res) => {
  const { title, location, startTime, endTime, totalCost, status, userIds, guestIds, guests } = req.body;
  const sessionId = req.params.id;
  
  const session = await prisma.session.update({
    where: { id: sessionId },
    data: {
      title,
      location,
      startTime: startTime ? new Date(startTime) : undefined,
      endTime: endTime ? new Date(endTime) : undefined,
      totalCost: totalCost ? totalCost : undefined,
      status
    }
  });

  if (userIds !== undefined || guestIds !== undefined) {
    const currentAttendances = await prisma.attendance.findMany({ where: { sessionId } });
    const currentUserIds = currentAttendances.filter((a: any) => a.userId).map((a: any) => a.userId!);
    const currentGuestIds = currentAttendances.filter((a: any) => a.guestId).map((a: any) => a.guestId!);

    const newUserIds = userIds || [];
    const newGuestIds = guestIds || [];

    const usersToAdd = newUserIds.filter((id: string) => !currentUserIds.includes(id));
    const usersToRemove = currentUserIds.filter((id: string) => !newUserIds.includes(id));
    const guestsToAdd = newGuestIds.filter((id: string) => !currentGuestIds.includes(id));
    const guestsToRemove = currentGuestIds.filter((id: string) => !newGuestIds.includes(id));

    if (usersToAdd.length > 0) {
      await prisma.attendance.createMany({
        data: usersToAdd.map((userId: string) => ({
          sessionId,
          userId,
          status: 'CONFIRMED'
        }))
      });
    }

    if (usersToRemove.length > 0) {
      await prisma.attendance.deleteMany({
        where: { sessionId, userId: { in: usersToRemove } }
      });
    }

    if (guestsToAdd.length > 0) {
      await prisma.attendance.createMany({
        data: guestsToAdd.map((guestId: string) => ({
          sessionId,
          guestId,
          status: 'CONFIRMED'
        }))
      });
    }

    if (guestsToRemove.length > 0) {
      await prisma.attendance.deleteMany({
        where: { sessionId, guestId: { in: guestsToRemove } }
      });
    }
  }

  if (guests && guests.length > 0) {
    for (const g of guests) {
      const guest = await prisma.guest.create({
        data: { name: g.name, category: g.category || '临时' }
      });
      await prisma.attendance.create({
        data: {
          sessionId,
          guestId: guest.id,
          guestName: g.name,
          customCost: g.customCost ? g.customCost * 100 : null,
          status: 'CONFIRMED'
        }
      });
    }
  }

  const result = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { attendances: { include: { user: true, guest: true } } }
  });
  
  res.json(result);
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  await prisma.attendance.deleteMany({ where: { sessionId: id } });
  await prisma.session.delete({ where: { id } });
  res.json({ message: '删除成功' });
});

router.post('/:sessionId/attendees', async (req, res) => {
  const { sessionId } = req.params;
  const { userIds, guestIds, guests, multipliers, notes } = req.body;

  if (userIds && userIds.length > 0) {
    const currentAttendances = await prisma.attendance.findMany({ where: { sessionId } });
    const currentUserIds = currentAttendances.filter((a: any) => a.userId).map(a => a.userId!);
    const newUserIds = userIds.filter((id: string) => !currentUserIds.includes(id));

    if (newUserIds.length > 0) {
      await prisma.attendance.createMany({
        data: newUserIds.map((userId: string) => ({
          sessionId,
          userId,
          status: 'CONFIRMED',
          multiplier: multipliers?.[userId] || 1,
          note: notes?.[userId] || null
        }))
      });
    }
  }

  if (guestIds && guestIds.length > 0) {
    const currentAttendances = await prisma.attendance.findMany({ where: { sessionId } });
    const currentGuestIds = currentAttendances.filter((a: any) => a.guestId).map(a => a.guestId!);
    const newGuestIds = guestIds.filter((id: string) => !currentGuestIds.includes(id));

    if (newGuestIds.length > 0) {
      await prisma.attendance.createMany({
        data: newGuestIds.map((guestId: string) => ({
          sessionId,
          guestId,
          status: 'CONFIRMED'
        }))
      });
    }
  }

  if (guests && guests.length > 0) {
    for (const g of guests) {
      const guest = await prisma.guest.create({
        data: { name: g.name, category: g.category || '临时' }
      });
      await prisma.attendance.create({
        data: {
          sessionId,
          guestId: guest.id,
          guestName: g.name,
          customCost: g.customCost ? g.customCost * 100 : null,
          status: 'CONFIRMED'
        }
      });
    }
  }

  const result = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { attendances: { include: { user: true, guest: true } } }
  });
  
  res.json(result);
});

router.delete('/:sessionId/attendees/:attendanceId', async (req, res) => {
  const { sessionId, attendanceId } = req.params;
  await prisma.attendance.delete({ where: { id: attendanceId } });
  
  const result = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { attendances: { include: { user: true, guest: true } } }
  });
  
  res.json(result);
});

router.put('/:sessionId/attendance/:attendanceId', async (req, res) => {
  const { attendanceId } = req.params;
  const { customCost, isPaid, status, multiplier, note } = req.body;
  
  const attendance = await prisma.attendance.update({
    where: { id: attendanceId },
    data: {
      // customCost 传入的已经是分，不再乘以100
      customCost: customCost,
      isPaid: isPaid !== undefined ? (isPaid ? 1 : 0) : undefined,
      status,
      multiplier: multiplier,
      note: note as any,
      paidAt: isPaid ? new Date() : null
    }
  });
  
  res.json(attendance);
});

// 结算 - 包含交易记录
router.post('/:id/settle', async (req: AuthRequest, res) => {
  if (req.user!.role !== 'ADMIN') return res.status(403).json({ error: '需要管理员权限' });
  const { id } = req.params;
  const { sharedGuestIds, memberMultipliers } = req.body; 
  
  console.log('[SETTLE] Received memberMultipliers:', JSON.stringify(memberMultipliers));
  
  const session = await prisma.session.findUnique({ 
    where: { id },
    include: { attendances: { include: { user: true, guest: true } } }
  });
  
  if (!session) return res.status(404).json({ error: '场次不存在' });
  
  console.log('[SETTLE] Attendances:', session.attendances.map((a: any) => ({ id: a.id, userId: a.userId, multiplier: a.multiplier })));
  
  const totalCost = session.totalCost;
  const memberAttendances = session.attendances.filter((a: any) => a.userId);
  const guestAttendances = session.attendances.filter((a: any) => a.guestId);
  
  // 计算选择均摊的散客数量
  const sharedGuestSet = new Set(sharedGuestIds || []);
  const sharedGuests = guestAttendances.filter((g: any) => sharedGuestSet.has(g.guestId));
  const nonSharedGuests = guestAttendances.filter((g: any) => !sharedGuestSet.has(g.guestId));
  
  // 计算非均摊散客总额（使用customCost，如果为空则用actualCost）
  const guestTotal = nonSharedGuests.reduce((sum: number, att: any) => sum + (att.customCost || att.actualCost || 0), 0);
  
  // 成员总份数 - 优先使用前端传入的值，否则从数据库读取
  const totalShares = (memberAttendances.reduce((sum: number, att: any) => {
    const mult = memberMultipliers?.[att.userId] || att.multiplier || 1;
    return sum + mult;
  }, 0) + sharedGuests.length) || 1;
  
  // 每人份 = (总费用 - 非均摊散客费用) / 总份数
  const memberCount = memberAttendances.length || 1;
  const shareAmount = (totalCost - guestTotal) / totalShares;
  
  const results = [];
  
  // 成员分摊 - 更新余额并创建交易记录
  for (const att of memberAttendances as any[]) {
    // 优先使用前端传入的倍数，否则使用数据库值
    const multiplier = memberMultipliers?.[att.userId] || att.multiplier || 1;
    const note = att.note || '';
    const personalShare = shareAmount * multiplier;
    if (att.user && shareAmount > 0) {
      const newBalance = att.user.balance - personalShare;
      await prisma.user.update({
        where: { id: att.userId! },
        data: { balance: newBalance }
      });
      
      // 创建交易记录
      await prisma.transaction.create({
        data: {
          type: 'SESSION_PAY',
          amount: -personalShare,
          description: `场次消费: ${session.title}${multiplier > 1 ? ` (${multiplier}倍分摊${note ? ', ' + note : ''})` : ''}`,
          userId: att.userId!,
          sessionId: id,
          operatorId: req.user!.id,
          status: 'COMPLETED'
        }
      });
      
      await prisma.attendance.update({
        where: { id: att.id },
        data: { isPaid: 1, paidAt: new Date(), actualCost: personalShare }
      });
      
      results.push({ userId: att.userId, name: att.user!.name, multiplier, note, amount: personalShare });
    }
  }
  
  // 散客支付 - 更新状态并记录交易
  // 均摊散客按份数计算，非均摊散客按固定费用
  for (const att of guestAttendances as any[]) {
    const isShared = sharedGuestSet.has(att.guestId!);
    const cost = isShared ? shareAmount : (att.customCost || 0);
    const guestName = att.guest?.name || '未知';
    
    if ((isShared && shareAmount > 0) || (!isShared && cost > 0 && att.guest)) {
      await prisma.attendance.update({
        where: { id: att.id },
        data: { isPaid: 1, paidAt: new Date(), actualCost: cost }
      });
      
      // 创建散客消费交易记录
      await prisma.transaction.create({
        data: {
          type: isShared ? 'SESSION_PAY' : 'GUEST_PAY',
          amount: -cost,
          description: isShared 
            ? `场次消费(均摊): ${session.title} - ${guestName}`
            : `散客消费: ${session.title} - ${guestName}`,
          guestId: att.guestId!,
          sessionId: id,
          status: 'COMPLETED'
        }
      });
      
      results.push({ guestId: att.guestId, name: guestName, amount: cost });
    }
  }
  
  await prisma.session.update({
    where: { id },
    data: { status: 'COMPLETED' }
  });
  
  res.json({ totalCost, shareAmount, memberCount, totalShares: totalShares, results });
});

// 取消结算 - 退回未结算状态并回滚数据
router.post('/:id/cancel-settle', async (req: AuthRequest, res) => {
  if (req.user!.role !== 'ADMIN') return res.status(403).json({ error: '需要管理员权限' });
  const { id } = req.params;
  
  const session = await prisma.session.findUnique({
    where: { id },
    include: { attendances: { include: { user: true } } }
  });
  
  if (!session) return res.status(404).json({ error: '场次不存在' });
  if (session.status !== 'COMPLETED') return res.status(400).json({ error: '该场次未结算' });
  
  const memberAttendances = session.attendances.filter((a: any) => a.userId);
  
  // 回滚成员余额并删除交易记录
  for (const att of memberAttendances) {
    if (att.user && att.actualCost) {
      // 恢复余额
      await prisma.user.update({
        where: { id: att.userId! },
        data: { balance: { increment: att.actualCost } }
      });
      
      // 删除该场次的交易记录
      await prisma.transaction.deleteMany({
        where: { sessionId: id, userId: att.userId! }
      });
      
      // 重置签到状态
      await prisma.attendance.update({
        where: { id: att.id },
        data: { isPaid: 0, paidAt: null, actualCost: null }
      });
    }
  }
  
  // 回滚散客交易记录
  const guestAttendances = session.attendances.filter((a: any) => a.guestId);
  for (const att of guestAttendances) {
    // 删除散客的交易记录
    await prisma.transaction.deleteMany({
      where: { sessionId: id, guestId: att.guestId! }
    });
    
    // 重置散客签到状态
    await prisma.attendance.update({
      where: { id: att.id },
      data: { isPaid: 0, paidAt: null, actualCost: null }
    });
  }
  
  // 恢复场次状态为已结束
  await prisma.session.update({
    where: { id },
    data: { status: 'ONGOING' }  // 恢复到进行中状态
  });
  
  res.json({ message: '结算已回滚', sessionId: id });
});

export { router as sessionsRouter };
