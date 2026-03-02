const prisma = require("../../config/prisma");

const getDashboardStats = async (req, res) => {
  try {
    const [totalUsers, totalTasks, recentTasks, tasksByStatus, usersByRole] =
      await Promise.all([
        // Общее количество пользователей
        prisma.user.count(),

        // Общее количество задач
        prisma.task.count(),

        // Последние 10 задач
        prisma.task.findMany({
          take: 10,
          orderBy: { createdAt: "desc" },
          include: {
            user: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        }),

        // Задачи по статусам
        prisma.task.groupBy({
          by: ["status"],
          _count: {
            status: true,
          },
        }),

        // Пользователи по ролям
        prisma.user.groupBy({
          by: ["role"],
          _count: {
            role: true,
          },
        }),
      ]);

    // Формируем статистику по статусам
    const statusStats = tasksByStatus.reduce((acc, item) => {
      acc[item.status] = item._count.status;
      return acc;
    }, {});

    // Формируем статистику по ролям
    const roleStats = usersByRole.reduce((acc, item) => {
      acc[item.role] = item._count.role;
      return acc;
    }, {});

    res.json({
      stats: {
        totalUsers,
        totalTasks,
        statusStats,
        roleStats,
        recentTasks: recentTasks.map((task) => ({
          id: task.id,
          title: task.title,
          status: task.status,
          createdAt: task.createdAt,
          user: task.user,
        })),
      },
    });
  } catch (error) {
    console.error("Get dashboard stats error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  getDashboardStats,
};
