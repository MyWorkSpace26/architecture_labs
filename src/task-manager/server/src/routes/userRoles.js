const express = require("express");
const { updateUserRole } = require("../controllers/userRoleController");
const { authMiddleware, roleMiddleware } = require("../middleware/auth");

const router = express.Router();

/**
 * @swagger
 * /api/users/{id}/role:
 *   patch:
 *     summary: Update user role (ADMIN only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: body
 *         name: role
 *         required: true
 *         schema:
 *           type: string
 *           enum: [ADMIN, MODERATOR, VIEWER]
 *     responses:
 *       200:
 *         description: User role updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 */
router.patch(
  "/:id/role",
  authMiddleware,
  roleMiddleware("ADMIN"),
  updateUserRole
);

module.exports = router;
