import db from '../../db/index.js';
import { messages } from '../../db/schema.js';
import { eq, and } from 'drizzle-orm';

export default async function messageRoutes(fastify) {
  // 删除单条消息
  fastify.delete(
    '/:id',
    {
      preHandler: [fastify.authenticate],
      schema: {
        tags: ['messages'],
        description: '删除单条消息',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'number' },
          },
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params;

      const [message] = await db
        .select()
        .from(messages)
        .where(eq(messages.id, id))
        .limit(1);

      if (!message) {
        return reply.code(404).send({ error: '消息不存在' });
      }

      // 检查权限
      if (
        message.senderId !== request.user.id &&
        message.recipientId !== request.user.id
      ) {
        return reply
          .code(403)
          .send({ error: '你没有权限删除该消息' });
      }

      // 根据用户角色执行软删除
      const updates = {};
      if (message.senderId === request.user.id) {
        updates.isDeletedBySender = true;
      }
      if (message.recipientId === request.user.id) {
        updates.isDeletedByRecipient = true;
      }

      await db.update(messages).set(updates).where(eq(messages.id, id));

      return { message: 'Message deleted successfully' };
    }
  );
}
