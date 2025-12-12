import db from '../../../db/index.js';
import { sysCurrencies, sysAccounts, sysTransactions } from '../schema.js';
import { eq, and, sql } from 'drizzle-orm';

/**
 * Ledger Service
 * Handles all monetary transactions with atomic integrity.
 */
export class LedgerService {
  constructor(fastify) {
    this.fastify = fastify;
  }

  /**
   * Get or create a specific currency account for a user.
   * @param {number} userId 
   * @param {string} currencyCode 
   * @param {object} [tx] - Optional transaction context
   */
  async getAccount(userId, currencyCode, tx = db) {
    let [account] = await tx
      .select()
      .from(sysAccounts)
      .where(and(
        eq(sysAccounts.userId, userId),
        eq(sysAccounts.currencyCode, currencyCode)
      ))
      .limit(1);

    if (!account) {
      // Check if currency exists first to avoid FK error, or let DB handle it?
      // Better to check or trust app logic. We'll trust FK constraint for performance, but valid currency check is good.
      // For now, assuming currency exists or it will throw.
      try {
        [account] = await tx.insert(sysAccounts).values({
          userId,
          currencyCode,
          balance: 0,
          totalEarned: 0,
          totalSpent: 0
        }).returning();
      } catch (err) {
        // Handle race condition if unique constraint fails
        if (err.code === '23505') { // unique_violation
          [account] = await tx
            .select()
            .from(sysAccounts)
            .where(and(
              eq(sysAccounts.userId, userId),
              eq(sysAccounts.currencyCode, currencyCode)
            ))
            .limit(1);
        } else {
          throw err;
        }
      }
    }
    return account;
  }

  /**
   * Grant currency to a user (System -> User).
   * @param {object} params
   * @param {number} params.userId
   * @param {number} params.amount
   * @param {string} params.currencyCode
   * @param {string} params.type
   * @param {string} params.referenceType
   * @param {string} params.referenceId
   * @param {string} [params.description]
   * @param {object} [params.metadata]
   */
  async grant({ userId, amount, currencyCode, type, referenceType, referenceId, description, metadata }) {
    if (amount <= 0) throw new Error('Grant amount must be positive');

    return await db.transaction(async (tx) => {
      const account = await this.getAccount(userId, currencyCode, tx);

      const newBalance = Number(account.balance) + amount;
      const newTotalEarned = Number(account.totalEarned) + amount;

      // Update Account
      await tx.update(sysAccounts)
        .set({
          balance: newBalance,
          totalEarned: newTotalEarned,
          updatedAt: new Date()
        })
        .where(eq(sysAccounts.id, account.id));

      // Create Transaction Record
      const [transaction] = await tx.insert(sysTransactions).values({
        userId,
        currencyCode,
        amount,
        balanceAfter: newBalance,
        type,
        referenceType,
        referenceId: String(referenceId),
        description,
        metadata: metadata ? JSON.stringify(metadata) : null
      }).returning();

      return transaction;
    });
  }

  /**
   * Deduct currency from a user (User -> System).
   * @param {object} params
   * @param {number} params.userId
   * @param {number} params.amount
   * @param {string} params.currencyCode
   * @param {string} params.type
   * @param {string} params.referenceType
   * @param {string} params.referenceId
   * @param {string} [params.description]
   * @param {object} [params.metadata]
   * @param {boolean} [params.allowNegative=false]
   */
  async deduct({ userId, amount, currencyCode, type, referenceType, referenceId, description, metadata, allowNegative = false }) {
    if (amount <= 0) throw new Error('Deduct amount must be positive');

    return await db.transaction(async (tx) => {
      const account = await this.getAccount(userId, currencyCode, tx);

      if (!allowNegative && Number(account.balance) < amount) {
        throw new Error(`Insufficient funds. Balance: ${account.balance}, Required: ${amount}`);
      }

      const newBalance = Number(account.balance) - amount;
      const newTotalSpent = Number(account.totalSpent) + amount;

      await tx.update(sysAccounts)
        .set({
          balance: newBalance,
          totalSpent: newTotalSpent,
          updatedAt: new Date()
        })
        .where(eq(sysAccounts.id, account.id));

      const [transaction] = await tx.insert(sysTransactions).values({
        userId,
        currencyCode,
        amount: -amount, // Negative for deduction
        balanceAfter: newBalance,
        type,
        referenceType,
        referenceId: String(referenceId),
        description,
        metadata: metadata ? JSON.stringify(metadata) : null
      }).returning();

      return transaction;
    });
  }

  /**
   * Transfer currency between users (User A -> User B).
   * @param {object} params
   * @param {number} params.fromUserId
   * @param {number} params.toUserId
   * @param {number} params.amount
   * @param {string} params.currencyCode
   * @param {string} params.type
   * @param {string} params.referenceType
   * @param {string} params.referenceId
   * @param {string} [params.description]
   * @param {object} [params.metadata]
   */
  async transfer({ fromUserId, toUserId, amount, currencyCode, type, referenceType, referenceId, description, metadata }) {
    if (amount <= 0) throw new Error('Transfer amount must be positive');
    if (fromUserId === toUserId) throw new Error('Cannot transfer to self');

    return await db.transaction(async (tx) => {
      const fromAccount = await this.getAccount(fromUserId, currencyCode, tx);
      const toAccount = await this.getAccount(toUserId, currencyCode, tx);

      // Check balance
      if (Number(fromAccount.balance) < amount) {
        throw new Error(`Insufficient funds. Balance: ${fromAccount.balance}, Required: ${amount}`);
      }

      // Update From Account
      const fromNewBalance = Number(fromAccount.balance) - amount;
      await tx.update(sysAccounts)
        .set({
          balance: fromNewBalance,
          totalSpent: Number(fromAccount.totalSpent) + amount,
          updatedAt: new Date()
        })
        .where(eq(sysAccounts.id, fromAccount.id));

      // Update To Account
      const toNewBalance = Number(toAccount.balance) + amount;
      await tx.update(sysAccounts)
        .set({
          balance: toNewBalance,
          totalEarned: Number(toAccount.totalEarned) + amount,
          updatedAt: new Date()
        })
        .where(eq(sysAccounts.id, toAccount.id));

      // Create From Transaction
      const [fromTx] = await tx.insert(sysTransactions).values({
        userId: fromUserId,
        currencyCode,
        amount: -amount,
        balanceAfter: fromNewBalance,
        type,
        referenceType,
        referenceId: String(referenceId),
        relatedUserId: toUserId,
        description: description || `Transfer to user ${toUserId}`,
        metadata: metadata ? JSON.stringify(metadata) : null
      }).returning();

      // Create To Transaction
      const [toTx] = await tx.insert(sysTransactions).values({
        userId: toUserId,
        currencyCode,
        amount: amount,
        balanceAfter: toNewBalance,
        type,
        referenceType,
        referenceId: String(referenceId),
        relatedUserId: fromUserId,
        description: description || `Transfer from user ${fromUserId}`,
        metadata: metadata ? JSON.stringify(metadata) : null
      }).returning();

      return { fromTx, toTx };
    });
  }
}
