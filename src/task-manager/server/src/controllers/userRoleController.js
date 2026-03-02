const prisma = require("../../config/prisma");
const Joi = require("joi");

const updateRoleSchema = Joi.object({
  role: Joi.string().valid("ADMIN", "MODERATOR", "VIEWER").required(),
});

const updateUserRole = async (req, res) => {
  try {
    const { error } = updateRoleSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { id } = req.params;
    const { role } = req.body;

    // Проверяем, что пользователь не меняет свою роль
    if (req.user.id === id) {
      return res.status(400).json({ error: "Cannot change your own role" });
    }

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    res.json({
      message: "User role updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update user role error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  updateUserRole,
};
